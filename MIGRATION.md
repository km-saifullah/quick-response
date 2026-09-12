# Migrating from v1 to v2

`quick-response` v2 is a TypeScript rewrite that stays as close to drop-in
compatible as possible. Most projects need **zero code changes**. This guide
covers the handful of things worth checking.

## 1. If you use CommonJS `require(...)`

**No change needed.** `require("quick-response")` is still directly callable,
exactly like v1:

```js
const apiResponse = require("quick-response");
apiResponse(200, "Success");
```

Optionally, take advantage of the new named exports, available as properties
on the same import:

```js
const apiResponse = require("quick-response");
apiResponse.successResponse(201, "Created", { id: 1 });
apiResponse.errorResponse(404, "Not found");

// or destructure directly
const { successResponse, errorResponse } = require("quick-response");
```

## 2. If you use ESM / TypeScript `import`

**No change needed.**

```ts
import apiResponse from "quick-response";
apiResponse(200, "Success");
```

New named exports are available alongside the default:

```ts
import apiResponse, { successResponse, errorResponse } from "quick-response";
```

## 3. The `timestamp` format changed (the one real breaking change)

**v1** returned a human-readable date string:

```js
{ statusCode: 200, message: "Success", data: null, timestamp: "Fri Sep 12 2026" }
```

**v2** returns an ISO 8601 string by default:

```js
{ success: true, statusCode: 200, message: "Success", data: null, timestamp: "2026-09-12T10:00:00.000Z" }
```

If your code parses `timestamp` with a specific format, or the exact string
is asserted in tests, either:

- **Update your code** to parse ISO 8601 (recommended — `new Date(timestamp)`
  works with both formats, but ISO is sortable and timezone-safe), or
- **Opt back into the old format:**

  ```ts
  apiResponse(200, "Success", null, { timestampFormat: "date" });
  // timestamp: "Fri Sep 12 2026"
  ```

## 4. The response now includes a `success` field

v1 responses had no `success` field. v2 adds one automatically, derived from
`statusCode` (`true` for `< 400`, `false` otherwise). This is additive and
shouldn't break anything that only reads `statusCode`, `message`, or `data`
— but if you have strict schema validation (e.g. `ajv` with
`additionalProperties: false`) on the response shape, add `success` to your
schema.

## 5. `statusCode` and `message` are now validated

v2 throws a `TypeError` if `statusCode` isn't a number or `message` is an
empty string. v1 would silently accept anything. This should only affect you
if you were calling `apiResponse` with malformed arguments — which was
already a bug.

## 6. Optional: adopt the new helpers

Not required, but recommended for new code:

```ts
// Before
apiResponse(200, "Success", data);
apiResponse(404, "Not found");

// After
successResponse(200, "Success", data);
errorResponse(404, "Not found");
```

`successResponse` and `errorResponse` are identical in signature to
`apiResponse`, just with `success` pinned to `true`/`false` respectively —
useful for cases like a `500` you've recovered from, or a `200` that still
represents a soft failure.

## Checklist

- [ ] Search your codebase/tests for assumptions about the `timestamp` format.
- [ ] If you validate the full response shape (e.g. with `ajv`), add the new
      `success` field to your schema.
- [ ] (Optional) Adopt `successResponse` / `errorResponse` in new code.
- [ ] (Optional) Add `ApiError[]` to validation error responses via the
      `errors` option.
- [ ] Run your test suite after upgrading.

## Need help?

Open an issue at
[github.com/km-saifullah/quick-response/issues](https://github.com/km-saifullah/quick-response/issues).
