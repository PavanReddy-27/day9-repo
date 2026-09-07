import dotenv from "dotenv";
dotenv.config();

async function verify() {
  console.log("=== Checking Frontend (Vite on :5173) ===");
  try {
    const fe = await fetch("http://localhost:5173/");
    console.log("Frontend Status:", fe.status, fe.headers.get("content-type"));
    const html = await fe.text();
    console.log("HTML length:", html.length, "Has #root:", html.includes('id="root"'));
  } catch (err: any) {
    console.error("Frontend error:", err.message);
  }

  console.log("\n=== Checking Backend (Express on :5000) ===");
  try {
    const health = await fetch("http://localhost:5000/api/v1/health");
    const healthData = await health.json();
    console.log("Health:", healthData.status, "DB Host:", healthData.database?.host, "DB State:", healthData.database?.state);

    const adminPassword = process.env.SEED_PASSWORD || "Password123!";
    const loginRes = await fetch("http://localhost:5000/api/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@thestackly.com", password: adminPassword }),
    });
    const loginData = await loginRes.json();
    console.log("Admin Login:", loginData.success, "Role:", loginData.data?.role);

    const token = loginData.data?.accessToken;

    const empRes = await fetch("http://localhost:5000/api/v1/employees?page=1&limit=5", {
      headers: { Authorization: "Bearer " + token },
    });
    const empData = await empRes.json();
    console.log("Employees API count:", empData.data?.length ?? empData.employees?.length ?? 0);

    const deptRes = await fetch("http://localhost:5000/api/v1/departments", {
      headers: { Authorization: "Bearer " + token },
    });
    const deptData = await deptRes.json();
    console.log("Departments API count:", deptData.data?.length ?? deptData.departments?.length ?? 0);

    const attRes = await fetch("http://localhost:5000/api/v1/attendance/status", {
      headers: { Authorization: "Bearer " + token },
    });
    const attData = await attRes.json();
    console.log("Attendance Status API status:", attRes.status, "Has Record:", Boolean(attData.data || attData));
  } catch (err: any) {
    console.error("Backend error:", err.message);
  }

  console.log("\n=== Checking Scripts ===");
  try {
    const { connectDB } = await import("../server/config/db.js");
    await connectDB();
    const { User, Employee, Company } = await import("../server/models/index.js");
    const count = await User.countDocuments();
    const empCount = await Employee.countDocuments();
    const compCount = await Company.countDocuments();
    console.log(`DB Counts: Users=${count}, Employees=${empCount}, Companies=${compCount}`);
    process.exit(0);
  } catch (err: any) {
    console.error("Script error:", err);
    process.exit(1);
  }
}

verify();
