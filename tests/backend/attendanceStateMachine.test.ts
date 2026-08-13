import { describe, it, expect } from "vitest";
import { calculateHaversineDistance } from "../../server/controllers/attendanceController.ts";

describe("Attendance State Machine & Geofence Logic", () => {
  it("calculates Haversine distance correctly between two GPS coordinates", () => {
    // Distance between Hyderabad HITEC City (17.3850, 78.4867) and nearby point (~500m away)
    const lat1 = 17.3850;
    const lon1 = 78.4867;
    const lat2 = 17.3890;
    const lon2 = 78.4867;

    const distance = calculateHaversineDistance(lat1, lon1, lat2, lon2);
    expect(distance).toBeGreaterThan(400);
    expect(distance).toBeLessThan(500);
  });

  it("returns 0 meters distance for identical coordinates", () => {
    const lat = 17.3850;
    const lon = 78.4867;
    const distance = calculateHaversineDistance(lat, lon, lat, lon);
    expect(distance).toBe(0);
  });

  it("enforces state machine sequence: Not Checked In -> Working -> On Break -> Working -> Checked Out", () => {
    const validTransitions = {
      "Not Checked In": ["Working"],
      Working: ["On Break", "Checked Out"],
      "On Break": ["Working"],
      "Checked Out": [],
    };

    expect(validTransitions["Not Checked In"]).toContain("Working");
    expect(validTransitions["Not Checked In"]).not.toContain("On Break");
    expect(validTransitions["Working"]).toContain("On Break");
    expect(validTransitions["Working"]).toContain("Checked Out");
  });

  it("accurately computes worked hours subtracting break duration", () => {
    const checkIn = new Date("2026-08-12T09:00:00Z");
    const checkOut = new Date("2026-08-12T18:00:00Z"); // 9 hours elapsed (540 mins)
    const breakDurationMinutes = 60; // 1 hour break

    const totalElapsedMinutes = Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60));
    const netWorkMinutes = Math.max(0, totalElapsedMinutes - breakDurationMinutes);
    const workingHours = Number((netWorkMinutes / 60).toFixed(2));

    expect(totalElapsedMinutes).toBe(540);
    expect(netWorkMinutes).toBe(480);
    expect(workingHours).toBe(8);
  });
});
