const http = require('http');

function checkPort(port) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}/api/v1/health`, (res) => {
      resolve(res.statusCode === 200 || res.statusCode === 503); // health endpoint might return 503 if db isn't fully healthy, but it means server is up
    });
    req.on('error', () => resolve(false));
  });
}

async function waitForServer() {
  console.log("Waiting for server on port 5000...");
  for (let i = 0; i < 30; i++) {
    const isUp = await checkPort(5000);
    if (isUp) {
      console.log("Server is UP!");
      return;
    }
    await new Promise(r => setTimeout(r, 2000));
  }
  console.log("Timeout waiting for server");
}

waitForServer();
