import type { ApiResponse, ApiResponseOptions } from "./types";

/**
 * Builds the `timestamp` field according to the requested format.
 * Defaults to ISO-8601, the recommended, sortable, timezone-safe format.
 */
function buildTimestamp(format: ApiResponseOptions["timestampFormat"]): string | number {
  const now = new Date();
  switch (format) {
    case "unix":
      return now.getTime();
    case "date":
      // Legacy v1.x format, kept for anyone who parses this exact string.
      return now.toDateString();
    case "iso":
    default:
      return now.toISOString();
  }
}

/**
 * Creates a standardized API response envelope.
 *
 * This is the core building block of the library. `successResponse()` and
 * `errorResponse()` are thin, opinionated wrappers around this function —
 * use whichever reads best in your codebase.
 *
 * @typeParam T - Type of the `data` payload.
 * @param statusCode - HTTP status code, e.g. 200, 201, 400, 404, 500.
 * @param message - Short, human-readable summary of the response.
 * @param data - Response payload. Defaults to `null`.
 * @param options - Optional extras: `errors`, `meta`, `success` override, `timestampFormat`.
 *
 * @example
 * ```ts
 * apiResponse(200, "Success", { id: 1 });
 * // {
 * //   success: true,
 * //   statusCode: 200,
 * //   message: "Success",
 * //   data: { id: 1 },
 * //   timestamp: "2026-08-26T10:00:00.000Z"
 * // }
 * ```
 */
export function apiResponse<T = unknown>(
  statusCode: number,
  message: string,
  data: T | null = null,
  options: ApiResponseOptions = {}
): ApiResponse<T> {
  if (typeof statusCode !== "number" || Number.isNaN(statusCode)) {
    throw new TypeError("quick-response: `statusCode` must be a number.");
  }
  if (typeof message !== "string" || message.length === 0) {
    throw new TypeError("quick-response: `message` must be a non-empty string.");
  }

  const { success, errors, meta, timestampFormat = "iso" } = options;

  const response: ApiResponse<T> = {
    success: success ?? (statusCode >= 200 && statusCode < 400),
    statusCode,
    message,
    data,
    timestamp: buildTimestamp(timestampFormat),
  };

  if (errors && errors.length > 0) {
    response.errors = errors;
  }

  if (meta && Object.keys(meta).length > 0) {
    response.meta = meta;
  }

  return response;
}

/**
 * Shorthand for a successful response. Always sets `success: true`,
 * regardless of `statusCode` — use this when you want to be explicit at
 * the call site (e.g. for a `204 No Content`, or a `3xx` redirect body).
 *
 * @example
 * ```ts
 * successResponse(200, "Success", { id: 1, name: "Ada" });
 * successResponse(201, "User created", { id: 1 });
 * ```
 */
export function successResponse<T = unknown>(
  statusCode: number,
  message: string,
  data: T | null = null,
  options: Omit<ApiResponseOptions, "success"> = {}
): ApiResponse<T> {
  return apiResponse(statusCode, message, data, { ...options, success: true });
}

/**
 * Shorthand for an error response. Always sets `success: false`, and is
 * the natural place to attach structured `errors`.
 *
 * @example
 * ```ts
 * errorResponse(404, "User not found");
 *
 * errorResponse(422, "Validation failed", null, {
 *   errors: [{ field: "email", message: "Email is required" }],
 * });
 * ```
 */
export function errorResponse<T = unknown>(
  statusCode: number,
  message: string,
  data: T | null = null,
  options: Omit<ApiResponseOptions, "success"> = {}
): ApiResponse<T> {
  return apiResponse(statusCode, message, data, { ...options, success: false });
}
