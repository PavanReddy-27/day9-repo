import { describe, it, expect, vi, beforeAll, afterAll, afterEach } from "vitest";
import mongoose from "../../server/node_modules/mongoose";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import { checkOut } from "../../server/controllers/attendanceController";
import AttendanceRecord from "../../server/models/AttendanceRecord";
import AttendanceEvent from "../../server/models/AttendanceEvent";
import IdempotencyRecord from "../../server/models/IdempotencyRecord";
import BreakSession from "../../server/models/BreakSession";

let mongoServer: MongoMemoryReplSet;

beforeAll(async () => {
  mongoServer = await MongoMemoryReplSet.create({
    replSet: { count: 1, storageEngine: 'wiredTiger' }
  });
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, { directConnection: true });

  // Collections must be explicitly created before using transactions in MongoDB
  await AttendanceRecord.createCollection();
  await AttendanceEvent.createCollection();
  await IdempotencyRecord.createCollection();
  await BreakSession.createCollection();

  // Ensure all background index builds are complete to prevent lock contention during transactions
  await AttendanceRecord.init();
  await AttendanceEvent.init();
  await IdempotencyRecord.init();
  await BreakSession.init();
}, 60000);

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  vi.clearAllMocks();
});

const mockResponse = () => {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

describe("Attendance Controller - checkOut", () => {
  it("should fail to check out before check-in", async () => {
    const req = {
      body: {},
      companyId: new mongoose.Types.ObjectId().toString(),
      employee: { _id: new mongoose.Types.ObjectId() },
    };
    const res = mockResponse();

    try {
      await checkOut(req, res);
    } catch (e: any) {
      console.error(e);
    }

    if (res.status.mock.calls[0][0] === 500) {
      console.log("500 ERROR:", res.json.mock.calls[0][0]);
    }

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Cannot check out: Employee has not checked in yet.",
    });
  }, 30000);

  it("should fail to check out if another company's record exists (cross-company isolation)", async () => {
    const companyA = new mongoose.Types.ObjectId().toString();
    const companyB = new mongoose.Types.ObjectId().toString();
    const employeeId = new mongoose.Types.ObjectId();

    // Create a working record for Company A
    await AttendanceRecord.create({
      companyId: companyA,
      employeeId,
      locationId: new mongoose.Types.ObjectId(),
      date: new Date().toISOString().split("T")[0],
      status: "Working",
      checkInTime: new Date(),
    });

    // Attempt to checkout from Company B
    const req = {
      body: {},
      companyId: companyB,
      employee: { _id: employeeId },
    };
    const res = mockResponse();

    await checkOut(req, res);

    // It should not find the record from Company A
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Cannot check out: Employee has not checked in yet.",
    });
  }, 30000);

  it("should check out successfully", async () => {
    const companyId = new mongoose.Types.ObjectId().toString();
    const employeeId = new mongoose.Types.ObjectId();
    const today = new Date().toISOString().split("T")[0];

    await AttendanceRecord.create({
      companyId,
      employeeId,
      locationId: new mongoose.Types.ObjectId(),
      date: today,
      status: "Working",
      checkInTime: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
    });

    const req = {
      body: { location: { lat: 10, lng: 20 }, idempotencyKey: "key1" },
      companyId,
      employee: { _id: employeeId },
      originalUrl: "/api/attendance/checkout",
    };
    const res = mockResponse();

    await checkOut(req as any, res as any);

    if (res.status.mock.calls[0][0] === 500) {
      console.log("500 ERROR 2:", res.json.mock.calls[0][0]);
    }

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: expect.stringContaining("Check-out successful"),
      })
    );

    // Verify DB states
    const record = await AttendanceRecord.findOne({ companyId, employeeId });
    expect(record?.status).toBe("Checked Out");
    expect(record?.checkOutTime).toBeDefined();
    
    const event = await AttendanceEvent.findOne({ companyId, employeeId });
    expect(event?.eventType).toBe("CHECK_OUT");
    
    const idempotency = await IdempotencyRecord.findOne({ idempotencyKey: "key1" });
    expect(idempotency).toBeDefined();
  }, 30000);

  it("should handle concurrent checkout requests safely (idempotency)", async () => {
    const companyId = new mongoose.Types.ObjectId().toString();
    const employeeId = new mongoose.Types.ObjectId();
    const today = new Date().toISOString().split("T")[0];

    await AttendanceRecord.create({
      companyId,
      employeeId,
      locationId: new mongoose.Types.ObjectId(),
      date: today,
      status: "Working",
      checkInTime: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
    });

    const req1 = {
      body: { idempotencyKey: "concurrent-key" },
      companyId,
      employee: { _id: employeeId },
      originalUrl: "/api/attendance/checkout",
    };
    
    const req2 = {
      body: { idempotencyKey: "concurrent-key" },
      companyId,
      employee: { _id: employeeId },
      originalUrl: "/api/attendance/checkout",
    };

    console.log("Indexes:", await IdempotencyRecord.collection.indexes());

    const res1 = mockResponse();
    const res2 = mockResponse();

    // Fire requests concurrently
    await Promise.all([checkOut(req1, res1), checkOut(req2, res2)]);

    // One request should succeed, the other should either hit idempotency or hit "already checked out"
    // Since idempotency acts in transaction, if transaction 1 commits, transaction 2 will hit the idempotency record.
    const calls1 = res1.status.mock.calls.length > 0 ? res1.status.mock.calls[0][0] : null;
    const calls2 = res2.status.mock.calls.length > 0 ? res2.status.mock.calls[0][0] : null;
    
    expect([calls1, calls2]).toContain(200);
    
    // There should be exactly ONE checkout event for this employee
    const events = await AttendanceEvent.find({ companyId, employeeId, eventType: "CHECK_OUT" });
    expect(events.length).toBe(1);

    // There should be exactly ONE idempotency record for this company and key
    const idempotencies = await IdempotencyRecord.find({ companyId, idempotencyKey: "concurrent-key" });
    expect(idempotencies.length).toBe(1);
  }, 30000);
});
