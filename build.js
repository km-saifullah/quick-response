const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

// Create the dist directory if it doesn't exist
const distDir = path.join(__dirname, "dist");
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir);
}

// Copy the file for CommonJS
fs.copyFileSync(
  path.join(__dirname, "src/index.js"),
  path.join(distDir, "index.cjs.js")
);

// Convert the file to ES Module
const esmContent = fs
  .readFileSync(path.join(__dirname, "src/index.js"), "utf8")
  .replace(/module\.exports\s*=\s*/, "export default ");

fs.writeFileSync(path.join(distDir, "index.esm.js"), esmContent);
