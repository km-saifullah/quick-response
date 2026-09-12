# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.0.0] - 2026-09-12

### Fixed

- `package.json` had accidentally reverted to the v1.0.5 content during a
  git merge (missing `"type": "module"` and the `exports` map), which
  broke `import { successResponse, errorResponse } from "quick-response"`
  under Node's native ESM loader. v2.0.0 is deprecated; use 3.0.0+.

## [2.0.0] - 2026-09-12

### ✅ Fully backward compatible

- `require("quick-response")` is **still directly callable**, exactly like v1.x
  (`const apiResponse = require("quick-response"); apiResponse(200, "Success")`
  keeps working, no code changes needed). It now also carries the new named
  exports as properties (`apiResponse.successResponse`, `apiResponse.errorResponse`).
- `import apiResponse from "quick-response"` (ESM/TypeScript) is unaffected.

### ⚠️ Breaking changes

- **Rewritten in TypeScript.** The package now ships its own type definitions
  (`.d.ts` / `.d.cts`) — no `@types/quick-response` needed.
- **`timestamp` is now an ISO 8601 string by default** (e.g.
  `"2026-09-12T10:00:00.000Z"`) instead of `Date#toDateString()` (e.g.
  `"Fri Sep 12 2026"`). Pass `{ timestampFormat: "date" }` to opt back into
  the old format, or `{ timestampFormat: "unix" }` for an epoch-millisecond
  number.
- **`statusCode` and `message` are now validated.** Passing a non-numeric
  `statusCode` or an empty `message` throws a `TypeError` instead of silently
  producing a malformed response.

### ✨ Added

- `successResponse(statusCode, message, data?, options?)` — always sets
  `success: true`.
- `errorResponse(statusCode, message, data?, options?)` — always sets
  `success: false`.
- `success` field on every response, auto-derived from `statusCode`
  (`>= 200 && < 400`) unless overridden via `options.success`.
- `errors` option — attach an array of structured `ApiError` objects
  (`{ field?, code?, message }`) for validation/business errors. Omitted
  from the response when empty.
- `meta` option — attach arbitrary metadata (pagination, request IDs, API
  version, etc). Omitted from the response when empty.
- `timestampFormat` option — `"iso"` (default), `"unix"`, or `"date"`.
- Full TypeScript types: `ApiResponse<T>`, `ApiError`, `ApiMeta`,
  `ApiResponseOptions`.
- Dual CommonJS + ESM build output (`dist/index.cjs`, `dist/index.js`) with
  matching type declarations (`dist/index.d.cts`, `dist/index.d.ts`).
- Test suite (Vitest, 14 tests) covering the core function and both helpers.
- ESLint + Prettier tooling for contributors.
- GitHub Actions CI (test matrix across Node 16/18/20/22) and an npm publish
  workflow with provenance.

### 🔧 Changed

- Internal build now uses `tsup` (esbuild-based) instead of the hand-rolled
  `build.js` script.
- `package.json` gained a proper `exports` map, `types` field, and `files`
  allowlist so only `dist/`, docs, and the license ship to npm.

## [1.0.5] - 2024

- Last release of the original JavaScript implementation. See git history
  prior to the v2.0.0 rewrite for details.
