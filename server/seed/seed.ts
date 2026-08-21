/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import connectDB, { closeDB } from "../config/db.js";

import Company from "../models/Company.js";
import Location from "../models/Location.js";
import Department from "../models/Department.js";
import Team from "../models/Team.js";
import { User, AdminAuth, HRAuth, ManagerAuth, EmployeeAuth } from "../models/User.js";
import Employee from "../models/Employee.js";
import Shift from "../models/Shift.js";
import ShiftAssignment from "../models/ShiftAssignment.js";
import AttendanceRecord from "../models/AttendanceRecord.js";
import AttendanceEvent from "../models/AttendanceEvent.js";
import BreakSession from "../models/BreakSession.js";
import CorrectionRequest from "../models/CorrectionRequest.js";
import ApprovalHistory from "../models/ApprovalHistory.js";
import PerformanceRecord from "../models/PerformanceRecord.js";
import ProductivityRecord from "../models/ProductivityRecord.js";
import Skill from "../models/Skill.js";
import EmployeeSkill from "../models/EmployeeSkill.js";
import Task from "../models/Task.js";
import LeaveRequest from "../models/LeaveRequest.js";
import Notification from "../models/Notification.js";
import AuditLog from "../models/AuditLog.js";
import IdempotencyRecord from "../models/IdempotencyRecord.js";

dotenv.config();

// Simple PRNG for deterministic seeding
class PseudoRandom {
  constructor(seed = 42) {
    this.seed = seed;
  }
  next() {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
  range(min, max) {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
  choice(array) {
    return array[this.range(0, array.length - 1)];
  }
}

const prng = new PseudoRandom(12345);

const FIRST_NAMES = [
  "Aarav", "Ananya", "Rohan", "Priya", "Vikram", "Neha", "Rahul", "Sneha", "Kiran", "Meera",
  "Siddharth", "Kavya", "Aditya", "Riya", "Arjun", "Pooja", "Varun", "Ishita", "Suresh", "Divya",
  "Rajesh", "Swati", "Manish", "Deepika", "Amit", "Tanvi", "Sunil", "Bhavna", "Vijay", "Anusha"
];

const LAST_NAMES = [
  "Sharma", "Verma", "Reddy", "Rao", "Nair", "Patel", "Gupta", "Kumar", "Singh", "Joshi",
  "Iyer", "Chowdhury", "Deshmukh", "Kulkarni", "Menon", "Pillai", "Das", "Banerjee", "Bhat", "Mehta"
];

const LOCATION_DEFS = [
  { code: "HYD", name: "Hyderabad", count: 70, lat: 17.3850, lng: 78.4867, city: "Hyderabad", address: "HITEC City, Phase 2, Hyderabad, Telangana" },
  { code: "VSP", name: "Visakhapatnam", count: 40, lat: 17.6868, lng: 83.2185, city: "Visakhapatnam", address: "IT SEZ, Rushikonda, Visakhapatnam, Andhra Pradesh" },
  { code: "CHN", name: "Chennai", count: 50, lat: 13.0827, lng: 80.2707, city: "Chennai", address: "OMR IT Corridor, Taramani, Chennai, Tamil Nadu" },
  { code: "BLR", name: "Bengaluru", count: 60, lat: 12.9716, lng: 77.5946, city: "Bengaluru", address: "Electronic City, Phase 1, Bengaluru, Karnataka" },
  { code: "KOC", name: "Kochi", count: 30, lat: 9.9312, lng: 76.2673, city: "Kochi", address: "Infopark, Kakkanad, Kochi, Kerala" },
];

const DEPARTMENTS_DEF = [
  { code: "ENG", name: "Engineering" },
  { code: "HR", name: "Human Resources" },
  { code: "FIN", name: "Finance" },
  { code: "SALES", name: "Sales" },
  { code: "MKT", name: "Marketing" },
  { code: "OPS", name: "Operations" },
  { code: "CS", name: "Customer Support" },
];

export async function runSeed(reset = false) {
  console.log(`[Seed Engine] Starting deterministic seeding (Reset=${reset})...`);
  await connectDB();

  if (reset) {
    if (process.env.NODE_ENV === "production") {
      console.error("[Seed Engine] ERROR: Cannot reset database in production environment!");
      process.exit(1);
    }
    console.log("[Seed Engine] Reset flag detected. Clearing collections...");
    await Promise.all([
      Company.deleteMany({}),
      Location.deleteMany({}),
      Department.deleteMany({}),
      Team.deleteMany({}),
      User.deleteMany({}),
      Employee.deleteMany({}),
      AdminAuth.deleteMany({}),
      HRAuth.deleteMany({}),
      ManagerAuth.deleteMany({}),
      EmployeeAuth.deleteMany({}),
      Shift.deleteMany({}),
      ShiftAssignment.deleteMany({}),
      AttendanceRecord.deleteMany({}),
      AttendanceEvent.deleteMany({}),
      BreakSession.deleteMany({}),
      CorrectionRequest.deleteMany({}),
      ApprovalHistory.deleteMany({}),
      PerformanceRecord.deleteMany({}),
      ProductivityRecord.deleteMany({}),
      Skill.deleteMany({}),
      EmployeeSkill.deleteMany({}),
      Task.deleteMany({}),
      LeaveRequest.deleteMany({}),
      Notification.deleteMany({}),
      AuditLog.deleteMany({}),
      IdempotencyRecord.deleteMany({}),
    ]);
    await PerformanceRecord.collection.dropIndexes().catch(() => {});
  }

  // Check if company already exists to prevent duplicate runs without reset
  const existingCompany = await Company.findOne({ code: "STACKLY" });
  if (existingCompany && !reset) {
    console.log("[Seed Engine] Database already populated. Use --reset to re-seed.");
    await printCollectionCounts();
    await closeDB();
    return;
  }

  // 1. Create Company (Stackly — the code doubles as the human-readable id)
  const company = await Company.create({
    name: "Stackly",
    code: "STACKLY",
    domain: "stackly.com",
    settings: { defaultGeofenceRadiusMeters: 500, timezone: "Asia/Kolkata" },
  });

  // 2. Create Shifts
  const regularShift = await Shift.create({
    companyId: company._id,
    name: "Regular General Shift",
    code: "REG-01",
    type: "Regular",
    startTime: "09:00",
    endTime: "18:00",
    breakDurationMinutes: 60,
  });

  const nightShift = await Shift.create({
    companyId: company._id,
    name: "US Night Shift",
    code: "NIGHT-01",
    type: "Night",
    startTime: "21:00",
    endTime: "06:00",
    breakDurationMinutes: 60,
  });

  const flexShift = await Shift.create({
    companyId: company._id,
    name: "Flexible Core Shift",
    code: "FLEX-01",
    type: "Flexible",
    startTime: "10:00",
    endTime: "19:00",
    breakDurationMinutes: 60,
  });

  // 3. Create Locations
  const locationDocs = {};
  for (const locDef of LOCATION_DEFS) {
    const loc = await Location.create({
      companyId: company._id,
      code: locDef.code,
      name: locDef.name,
      city: locDef.city,
      address: locDef.address,
      coordinates: { latitude: locDef.lat, longitude: locDef.lng },
      radiusMeters: 500,
      targetEmployeeCount: locDef.count,
    });
    locationDocs[locDef.code] = loc;
  }

  // 4. Create Departments & Teams per Location
  const deptDocs = [];
  const teamDocs = [];

  for (const locDef of LOCATION_DEFS) {
    const loc = locationDocs[locDef.code];
    for (const deptDef of DEPARTMENTS_DEF) {
      const dept = await Department.create({
        companyId: company._id,
        locationId: loc._id,
        name: `${deptDef.name} - ${locDef.code}`,
        code: `${deptDef.code}-${locDef.code}`,
      });
      deptDocs.push(dept);

      // Create 2 Teams per department
      for (let t = 1; t <= 2; t++) {
        const team = await Team.create({
          department: dept._id,
          name: `${deptDef.name} Team ${t} (${locDef.code})`,
        });
        teamDocs.push(team);
      }
    }
  }

  // 5. Create Skills
  const SKILL_DEFS = [
    { name: "React.js", category: "Frontend" },
    { name: "TypeScript", category: "Frontend" },
    { name: "Node.js", category: "Backend" },
    { name: "MongoDB", category: "Database" },
    { name: "Python", category: "Backend" },
    { name: "Recruitment", category: "HR" },
    { name: "Payroll Management", category: "Finance" },
    { name: "Client Relations", category: "Sales" },
    { name: "Agile Leadership", category: "Management" },
  ];

  const skillDocs = [];
  for (const sDef of SKILL_DEFS) {
    const skill = await Skill.create({
      companyId: company._id,
      name: sDef.name,
      category: sDef.category,
    });
    skillDocs.push(skill);
  }

  // 6. Create 250 Employees & Users
  const defaultPasswordStr = "Password123!";
  const devAccountPasswords = {
    Admin: "Password123!",
    HR: "Password123!",
    Manager: "Password123!",
    Employee: "Password123!",
  };

  const devAccountsConfig = [
    { role: "Admin", email: "admin@thestackly.com", empId: "EMP-001", firstName: "System", lastName: "Admin", locCode: "HYD", deptIndex: 0 },
    { role: "HR", email: "hr@thestackly.com", empId: "EMP-002", firstName: "David", lastName: "Miller", locCode: "HYD", deptIndex: 1 },
    { role: "Manager", email: "manager@thestackly.com", empId: "EMP-003", firstName: "Robert", lastName: "King", locCode: "HYD", deptIndex: 0 },
    { role: "Employee", email: "employee@thestackly.com", empId: "EMP-004", firstName: "Pavan", lastName: "Reddy", locCode: "HYD", deptIndex: 0 },
  ];

  const createdEmployees = [];
  let globalEmpIndex = 1;

  for (const locDef of LOCATION_DEFS) {
    const loc = locationDocs[locDef.code];
    const locDepts = deptDocs.filter((d) => d.code.endsWith(`-${locDef.code}`));

    for (let i = 0; i < locDef.count; i++) {
      const empIdNumber = globalEmpIndex;
      const empIdStr = `EMP-${String(empIdNumber).padStart(3, "0")}`;

      const devCfg = devAccountsConfig.find((d) => d.empId === empIdStr);

      let role = "Employee";
      let email = `employee${empIdNumber}@thestackly.com`;
      let firstName = prng.choice(FIRST_NAMES);
      let lastName = prng.choice(LAST_NAMES);

      if (devCfg) {
        role = devCfg.role;
        email = devCfg.email;
        firstName = devCfg.firstName;
        lastName = devCfg.lastName;
      } else if (empIdNumber === 5) {
        role = "Manager"; // 1 additional Manager
      } else if (empIdNumber > 5 && empIdNumber <= 14) {
        role = "HR"; // 9 additional HRs
      }

      const passStr = devAccountsConfig.some(d => d.email === email)
        ? devAccountPasswords[role]
        : defaultPasswordStr;

      // Store the login in its role-specific collection (separate "folders":
      // adminauths / hrauths / managerauths / employeeauths) so auth is split by
      // role, matching authController/authMiddleware lookups.
      const roleAuthModel: Record<string, any> = {
        Admin: AdminAuth,
        HR: HRAuth,
        Manager: ManagerAuth,
        Employee: EmployeeAuth,
      };
      const AuthModel = roleAuthModel[role] || EmployeeAuth;
      const user = await AuthModel.create({
        employeeId: empIdStr,
        email: email.toLowerCase(),
        password: passStr,
        role: role,
        isActive: true,
      });

      const assignedDept = locDepts[i % locDepts.length];
      const assignedTeams = teamDocs.filter((t) => t.department.toString() === assignedDept._id.toString());
      const assignedTeam = assignedTeams[i % assignedTeams.length];

      const workMode = prng.choice(["Office", "Office", "Office", "Hybrid", "Remote"]);
      const shift = prng.choice([regularShift, flexShift, nightShift]);
      const riskLevel = prng.choice(["Low", "Low", "Low", "Medium", "High"]);

      const emp = await Employee.create({
        companyId: company._id,
        userId: user._id,
        employeeId: empIdStr,
        email: email.toLowerCase(),
        firstName,
        lastName,
        fullName: `${firstName} ${lastName}`,
        locationId: loc._id,
        locationCode: loc.code,
        departmentId: assignedDept._id,
        departmentName: assignedDept.name,
        teamId: assignedTeam._id,
        managerId: null, // Will update next
        role: role,
        designation: `${role === 'Employee' ? 'Software Engineer' : role}`,
        workMode: workMode,
        shiftId: shift._id,
        joiningDate: new Date(Date.now() - prng.range(30, 365) * 24 * 60 * 60 * 1000),
        employmentStatus: "Active",
        riskLevel: riskLevel,
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${empIdStr}`,
      });

      createdEmployees.push(emp);
      globalEmpIndex++;
    }
  }

  // Set Manager hierarchy
  const managerEmployees = createdEmployees.filter((e) => e.role === "Manager" || e.role === "Admin");
  for (const emp of createdEmployees) {
    if (emp.role !== "Admin" && managerEmployees.length > 0) {
      const mgr = managerEmployees.find((m) => m.departmentId.toString() === emp.departmentId.toString()) || managerEmployees[0];
      await Employee.updateOne({ _id: emp._id }, { managerId: mgr._id });
      emp.managerId = mgr._id;
    }
  }

  console.log(`[Seed Engine] Created 250 Employees across 5 locations.`);

  // 7. Seed Employee Skills (Batch Insert)
  const empSkillsToInsert = [];
  for (const emp of createdEmployees) {
    const s1 = prng.choice(skillDocs);
    let s2 = prng.choice(skillDocs);
    while (s2._id.toString() === s1._id.toString()) {
      s2 = prng.choice(skillDocs);
    }
    for (const s of [s1, s2]) {
      empSkillsToInsert.push({
        companyId: company._id,
        employeeId: emp._id,
        skillId: s._id,
        proficiencyLevel: prng.range(2, 5),
      });
    }
  }
  await EmployeeSkill.insertMany(empSkillsToInsert, { ordered: false });

  // 8. Seed 12 Months Historical Data (Attendance, Performance, Productivity, Tasks)
  console.log("[Seed Engine] Generating 12 months historical attendance, performance & productivity records...");

  const attendanceRecordsBatch = [];
  const performanceRecordsBatch = [];
  const productivityRecordsBatch = [];
  const tasksBatch = [];

  const now = new Date();

  // Seed performance records for 4 quarters
  for (const emp of createdEmployees) {
    for (let q = 1; q <= 4; q++) {
      performanceRecordsBatch.push({
        companyId: company._id,
        employeeId: emp._id,
        period: `2025-Q${q}`,
        month: `2025-Q${q}`,
        rating: prng.range(3, 5),
        goalsCompleted: prng.range(4, 10),
        goalsAssigned: 10,
        feedback: "Consistent performer with great teamwork.",
        reviewerId: emp.managerId || emp._id,
      });
    }
  }
  await PerformanceRecord.insertMany(performanceRecordsBatch, { ordered: false });

  // Seed 30 days of recent HISTORICAL attendance & productivity for all 250
  // employees in batches. We start at dayOffset = 1 (yesterday) and never write
  // the current day: today must begin as "Not Checked In" so employees can
  // actually check in / out through the app each day. Writing today here would
  // leave every employee already "Checked Out" and block real check-ins.
  for (let dayOffset = 1; dayOffset <= 30; dayOffset++) {
    const dateObj = new Date(now.getTime() - dayOffset * 24 * 60 * 60 * 1000);
    if (dateObj.getDay() === 0 || dateObj.getDay() === 6) continue; // Skip weekends

    const dateStr = dateObj.toISOString().split("T")[0];

    for (const emp of createdEmployees) {
      const isAbsent = prng.range(1, 100) > 92;
      const status = isAbsent ? "Not Checked In" : "Checked Out";
      const checkInHour = prng.range(8, 10);
      const checkInMin = prng.range(0, 59);

      const checkInTime = isAbsent ? null : new Date(dateObj.setHours(checkInHour, checkInMin, 0));
      const checkOutTime = isAbsent ? null : new Date(dateObj.setHours(checkInHour + 9, checkInMin, 0));

      const workDurationMinutes = isAbsent ? 0 : 480;
      const breakDurationMinutes = isAbsent ? 0 : 60;
      const lateMinutes = checkInHour >= 10 ? 30 : 0;

      const locDoc = locationDocs[LOCATION_DEFS.find(l => l.code === emp.locationCode)?.code || "HYD"];
      const baseLat = locDoc?.coordinates?.latitude || 17.3850;
      const baseLng = locDoc?.coordinates?.longitude || 78.4867;

      attendanceRecordsBatch.push({
        companyId: company._id,
        employeeId: emp._id,
        locationId: emp.locationId,
        date: dateStr,
        checkInTime,
        checkOutTime,
        workDurationMinutes,
        workingHours: Number((workDurationMinutes / 60).toFixed(2)),
        breakDurationMinutes,
        overtimeMinutes: 0,
        lateMinutes,
        earlyDepartureMinutes: 0,
        status,
        shiftKind: "Regular",
        checkInCoordinates: isAbsent ? undefined : { lat: baseLat + (prng.range(-20, 20) / 10000), lng: baseLng + (prng.range(-20, 20) / 10000) },
        checkOutCoordinates: isAbsent ? undefined : { lat: baseLat + (prng.range(-20, 20) / 10000), lng: baseLng + (prng.range(-20, 20) / 10000) },
      });

      productivityRecordsBatch.push({
        companyId: company._id,
        employeeId: emp._id,
        date: dateStr,
        hoursLogged: isAbsent ? 0 : 8,
        tasksCompleted: isAbsent ? 0 : prng.range(2, 6),
        efficiencyScore: isAbsent ? 0 : prng.range(75, 98),
        idleTimeMinutes: isAbsent ? 0 : prng.range(15, 45),
      });
    }
  }

  // Insert batches of 1000 to manage RAM memory
  console.log(`[Seed Engine] Inserting ${attendanceRecordsBatch.length} attendance records in memory-managed batches...`);
  while (attendanceRecordsBatch.length > 0) {
    const chunk = attendanceRecordsBatch.splice(0, 1000);
    await AttendanceRecord.insertMany(chunk, { ordered: false });
  }

  while (productivityRecordsBatch.length > 0) {
    const chunk = productivityRecordsBatch.splice(0, 1000);
    await ProductivityRecord.insertMany(chunk, { ordered: false });
  }

  // Seed sample tasks & audit logs
  for (let t = 1; t <= 50; t++) {
    const emp = prng.choice(createdEmployees);
    tasksBatch.push({
      companyId: company._id,
      title: `Quarterly Milestone Deliverable #${t}`,
      description: `Complete task requirements for module #${t}`,
      assignedTo: emp._id,
      assignedBy: emp.managerId || emp._id,
      departmentId: emp.departmentId,
      teamId: emp.teamId,
      status: prng.choice(["To Do", "In Progress", "Completed"]),
      priority: prng.choice(["Low", "Medium", "High", "Critical"]),
      dueDate: new Date(Date.now() + prng.range(1, 14) * 24 * 60 * 60 * 1000),
    });
  }
  await Task.insertMany(tasksBatch);

  await AuditLog.create({
    companyId: company._id,
    performedBy: "Seed Engine",
    userRole: "System",
    action: "DATABASE_SEED_COMPLETE",
    details: "Successfully seeded 250 employees across 5 locations with 12 months historical records.",
  });

  console.log("[Seed Engine] Seeding completed successfully!");
  await printCollectionCounts();
  await closeDB();
}

async function printCollectionCounts() {
  console.log("\n=================== SEED SUMMARY REPORT ===================");
  console.log(`Companies           : ${await Company.countDocuments()}`);
  console.log(`Locations           : ${await Location.countDocuments()}`);
  console.log(`Departments         : ${await Department.countDocuments()}`);
  console.log(`Teams               : ${await Team.countDocuments()}`);
  console.log(`Users               : ${await User.countDocuments()}`);
  console.log(`Employees           : ${await Employee.countDocuments()}`);
  console.log(`Shifts              : ${await Shift.countDocuments()}`);
  console.log(`Attendance Records  : ${await AttendanceRecord.countDocuments()}`);
  console.log(`Performance Records : ${await PerformanceRecord.countDocuments()}`);
  console.log(`Productivity Records: ${await ProductivityRecord.countDocuments()}`);
  console.log(`Skills & EmpSkills  : ${await Skill.countDocuments()} skills, ${await EmployeeSkill.countDocuments()} employee skills`);
  console.log(`Tasks               : ${await Task.countDocuments()}`);
  console.log("===========================================================\n");
}

// CLI runner
if (process.argv[1]?.includes("seed.ts")) {
  const resetFlag = process.argv.includes("--reset");
  runSeed(resetFlag).catch((err) => {
    console.error("[Seed Engine] Fatal Error:", err);
    process.exit(1);
  });
}
