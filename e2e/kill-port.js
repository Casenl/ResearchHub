/**
 * Kill any process listening on port 3000 (Windows) and remove the
 * Next.js dev lock file so a fresh instance can start.
 */
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const PORT = process.env.E2E_PORT || 3000;
const LOCK_FILE = path.join(__dirname, "..", ".next", "dev", "lock");

// 1. Kill process on the port
try {
  const output = execSync("netstat -ano", { encoding: "utf-8" });
  const line = output
    .split("\n")
    .find((l) => l.includes(`:${PORT}`) && l.includes("LISTENING"));

  if (line) {
    const pid = line.trim().split(/\s+/).pop();
    console.log(`Killing process ${pid} on port ${PORT}...`);
    execSync(`taskkill /PID ${pid} /F`, { stdio: "inherit" });
    console.log("Done.");
  } else {
    console.log(`Port ${PORT} is free.`);
  }
} catch {
  // Port already free or taskkill failed — continue
}

// 2. Remove stale Next.js lock file
try {
  if (fs.existsSync(LOCK_FILE)) {
    fs.unlinkSync(LOCK_FILE);
    console.log("Removed stale .next/dev/lock file.");
  }
} catch {
  // Lock file already gone — continue
}
