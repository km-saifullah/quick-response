/**
 * Post-build step for the CommonJS bundle.
 *
 * quick-response v1.x did `module.exports = apiResponse`, so consumers could
 * call `require("quick-response")` directly as a function:
 *
 *   const apiResponse = require("quick-response");
 *   apiResponse(200, "Success");
 *
 * tsup/esbuild emit CJS output as `exports.default = apiResponse` plus named
 * exports, which breaks that call pattern (`require(...)` returns an object,
 * not a function). This script patches dist/index.cjs after the build so
 * `module.exports` is directly callable *and* still exposes every named
 * export (`.apiResponse`, `.successResponse`, `.errorResponse`, etc) as
 * properties on that same function — the same trick libraries like `debug`
 * and `chalk` use to stay compatible across CJS calling conventions.
 */
const fs = require("fs");
const path = require("path");

const cjsPath = path.join(__dirname, "..", "dist", "index.cjs");

let code = fs.readFileSync(cjsPath, "utf8");

const shim = `
// --- v1 compatibility shim -------------------------------------------------
// Makes \`require("quick-response")\` directly callable, matching v1.x
// (\`module.exports = apiResponse\`), while still exposing every named export
// as a property on the same function.
//
// Note: this must read from \`module.exports\` (not the local \`exports\`
// binding) because the bundler above already reassigned \`module.exports\`
// to a fresh object — the \`exports\` variable no longer points to it.
(function patchCjsExports() {
  var ns = module.exports;
  var fn = ns.default;
  module.exports = Object.assign(fn, ns);
  module.exports.default = fn;
})();
`;

if (!code.includes("v1 compatibility shim")) {
  code = `${code}\n${shim}`;
  fs.writeFileSync(cjsPath, code);
  console.log("[fix-cjs] Patched dist/index.cjs for v1 callable-require compatibility.");
} else {
  console.log("[fix-cjs] Shim already present, skipping.");
}
