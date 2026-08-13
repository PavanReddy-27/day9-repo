const http = require('http');

async function run() {
  try {
    // 1. Login
    const loginRes = await fetch("http://localhost:5000/api/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "employee@thestackly.com", password: "Password123!" })
    });
    const loginData = await loginRes.json();
    console.log("Login Status:", loginRes.status);
    
    if (!loginData.data || !loginData.data.accessToken) {
      console.log("Failed to login", loginData);
      return;
    }
    const token = loginData.data.accessToken;
    console.log("Got Token");

    // 2. Apply Leave
    const leaveRes = await fetch("http://localhost:5000/api/v1/leaves", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        type: "Sick",
        startDate: "2026-08-14",
        endDate: "2026-08-15",
        reason: "Test reason"
      })
    });
    
    console.log("Apply Leave Status:", leaveRes.status);
    const text = await leaveRes.text();
    console.log("Apply Leave Response Text:", text);

  } catch (err) {
    console.error("Error:", err);
  }
}

run();
