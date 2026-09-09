import { execSync } from 'child_process';
try {
  execSync('npx.cmd tsx server/index.ts', { stdio: 'pipe' });
  console.log("Success");
} catch (e) {
  console.log("STATUS:", e.status);
  console.log("STDOUT:", e.stdout ? e.stdout.toString() : "none");
  console.log("STDERR:", e.stderr ? e.stderr.toString() : "none");
  console.log("ERROR:", e.message);
}
