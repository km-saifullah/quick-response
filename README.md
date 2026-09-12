# quick-response

A tiny, dependency-free, fully-typed utility for building consistent, structured API responses in Node.js applications.

![npm](https://img.shields.io/npm/v/quick-response?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![License](https://img.shields.io/npm/l/quick-response?style=for-the-badge)

> **v2.0.0** — Rewritten in TypeScript with full type definitions, new `successResponse()` / `errorResponse()` helpers, structured errors and metadata, and dual CommonJS/ESM builds.
>
> **Upgrading from v1?** Good news: your existing `apiResponse(statusCode, message, data)` calls keep working unchanged, in both CommonJS and ESM/TypeScript. See the [Migration Guide](./MIGRATION.md) for the two-minute checklist — the one real breaking change is the default timestamp format.

## Why quick-response?

Every REST API ends up re-inventing the same response envelope. `quick-response` gives you one small, well-tested function (plus a couple of convenience wrappers) so every endpoint in your app returns the same predictable shape — with full IntelliSense/autocomplete in TypeScript and plain JavaScript alike.

- ✅ **Zero runtime dependencies** — nothing to audit, nothing to break.
- ✅ **TypeScript-first** — ships with complete `.d.ts` type definitions; works great in plain JS too.
- ✅ **CommonJS _and_ ESM** — `require()` and `import` both just work.
- ✅ **Backwards compatible** — `require("quick-response")` is still directly callable, exactly like v1.
- ✅ **Structured errors & metadata** — no more inventing your own shape for validation errors.
- ✅ **Tiny** — a few KB, zero runtime dependencies.

## Installation

```bash
npm install quick-response
```

```bash
yarn add quick-response
```

```bash
pnpm add quick-response
```

## Quick start

```ts
import { successResponse, errorResponse } from "quick-response";

// Success response
successResponse(200, "Success", { id: 1, name: "Ada Lovelace" });
// {
//   success: true,
//   statusCode: 200,
//   message: "Success",
//   data: { id: 1, name: "Ada Lovelace" },
//   timestamp: "2026-09-12T10:00:00.000Z"
// }

// Error response
errorResponse(404, "User not found");
// {
//   success: false,
//   statusCode: 404,
//   message: "User not found",
//   data: null,
//   timestamp: "2026-09-12T10:00:00.000Z"
// }
```

## API reference

### `apiResponse(statusCode, message, data?, options?)`

The core function every other helper is built on. Also the **default export**, kept for drop-in v1 compatibility.

| Parameter    | Type                 | Required | Description                                    |
| ------------ | -------------------- | -------- | ---------------------------------------------- |
| `statusCode` | `number`             | ✅       | HTTP status code, e.g. `200`, `404`, `500`.    |
| `message`    | `string`             | ✅       | Short, human-readable summary of the response. |
| `data`       | `T \| null`          | ❌       | Response payload. Defaults to `null`.          |
| `options`    | `ApiResponseOptions` | ❌       | See [options](#apiresponseoptions) below.      |

```ts
import apiResponse from "quick-response";

apiResponse(200, "Success", { id: 1 });
apiResponse(404, "Not found"); // data defaults to null
```

### `successResponse(statusCode, message, data?, options?)`

Identical signature to `apiResponse`, but always forces `success: true` — useful when you want to be explicit at the call site regardless of status code (e.g. a `204 No Content` or a `3xx` redirect body).

```ts
import { successResponse } from "quick-response";

successResponse(201, "User created", { id: 1 });
```

### `errorResponse(statusCode, message, data?, options?)`

Identical signature to `apiResponse`, but always forces `success: false` and is the natural place to attach structured errors.

```ts
import { errorResponse } from "quick-response";

errorResponse(404, "User not found");

errorResponse(422, "Validation failed", null, {
  errors: [
    { field: "email", message: "Email is required" },
    { field: "password", message: "Password must be at least 8 characters" },
  ],
});
```

### `ApiResponseOptions`

All three functions above accept the same optional fourth argument:

| Option            | Type                        | Description                                                                                     |
| ----------------- | --------------------------- | ----------------------------------------------------------------------------------------------- |
| `success`         | `boolean`                   | Overrides the auto-derived `success` flag (derived as `statusCode >= 200 && statusCode < 400`). |
| `errors`          | `ApiError[]`                | Structured, field-level errors. Omitted from the response entirely when empty.                  |
| `meta`            | `ApiMeta`                   | Arbitrary metadata — pagination, request IDs, API version, etc. Omitted when empty.             |
| `timestampFormat` | `"iso" \| "unix" \| "date"` | Format of the `timestamp` field. Defaults to `"iso"`. `"date"` matches the v1.x format.         |

### Structured errors

```ts
import { errorResponse, ApiError } from "quick-response";

const errors: ApiError[] = [
  { field: "email", code: "REQUIRED", message: "Email is required" },
  { field: "age", code: "OUT_OF_RANGE", message: "Age must be between 0 and 120" },
];

errorResponse(422, "Validation failed", null, { errors });
```

### Metadata

```ts
import { successResponse } from "quick-response";

successResponse(200, "Users fetched", users, {
  meta: { page: 1, perPage: 20, totalItems: 132, totalPages: 7 },
});
```

## Usage with Express

```ts
import express from "express";
import { successResponse, errorResponse } from "quick-response";

const app = express();

app.get("/users/:id", async (req, res) => {
  const user = await findUser(req.params.id);

  if (!user) {
    return res.status(404).json(errorResponse(404, "User not found"));
  }

  res.status(200).json(successResponse(200, "User fetched", user));
});

app.listen(8000, () => console.log("Server is running"));
```

## CommonJS

`require("quick-response")` is still directly callable, exactly like v1.x — no changes needed for existing code:

```js
const apiResponse = require("quick-response");

console.log(apiResponse(200, "Success", { id: 1 }));
```

The same import also carries the new named exports as properties, so you can mix styles freely:

```js
const apiResponse = require("quick-response");

console.log(apiResponse(200, "Success", { id: 1 }));
console.log(apiResponse.successResponse(201, "Created", { id: 2 }));
console.log(apiResponse.errorResponse(404, "Not found"));
```

Or destructure the named exports directly:

```js
const { successResponse, errorResponse } = require("quick-response");
```

## TypeScript

Full type definitions ship in the package — no `@types/quick-response` needed.

```ts
import apiResponse, { ApiResponse, ApiError, ApiMeta } from "quick-response";

interface User {
  id: number;
  name: string;
}

const res: ApiResponse<User> = apiResponse(200, "Success", { id: 1, name: "Ada" });
//    ^ res.data is typed as `User | null`
```

## Migrating from v1

See [MIGRATION.md](./MIGRATION.md) for the full guide, and [CHANGELOG.md](./CHANGELOG.md) for the complete list of changes. The short version: your existing `apiResponse(statusCode, message, data)` calls keep working unchanged; everything else is additive.

## Contributing

Issues and pull requests are welcome at the [GitHub repository](https://github.com/km-saifullah/quick-response).

```bash
git clone https://github.com/km-saifullah/quick-response.git
cd quick-response
npm install
npm run test
npm run lint
npm run build
```

## License

This project is licensed under the MIT License — see the [LICENSE](./LICENSE) file for details.

Happy coding... 👍
