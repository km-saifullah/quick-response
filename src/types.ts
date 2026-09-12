/**
 * A single structured error entry. Useful for validation errors,
 * field-level errors, or any additional error context you want to
 * attach to a response.
 */
export interface ApiError {
  /** The field this error relates to, e.g. "email". Omit for general errors. */
  field?: string;
  /** Machine-readable error code, e.g. "REQUIRED" or "AUTH_INVALID_TOKEN". */
  code?: string;
  /** Human-readable description of the error. */
  message: string;
  /** Any additional context. Avoid putting stack traces here in production. */
  [key: string]: unknown;
}

/** Arbitrary metadata attached to a response — pagination, request IDs, etc. */
export type ApiMeta = Record<string, unknown>;

/**
 * Extra, optional fields that can be supplied alongside the core
 * statusCode / message / data triple.
 */
export interface ApiResponseOptions {
  /** Overrides the auto-derived `success` flag. */
  success?: boolean;
  /** List of structured errors (validation errors, etc). */
  errors?: ApiError[];
  /** Extra metadata, e.g. pagination info. */
  meta?: ApiMeta;
  /**
   * Timestamp format for the response.
   * - "iso" (default): ISO 8601 string, e.g. "2026-08-26T10:00:00.000Z"
   * - "unix": Unix epoch in milliseconds
   * - "date": Human-readable date string, e.g. "Wed Aug 26 2026" (legacy v1 format)
   */
  timestampFormat?: "iso" | "unix" | "date";
}

/**
 * The canonical response envelope returned by every helper in this package.
 *
 * @typeParam T - Type of the `data` payload.
 */
export interface ApiResponse<T = unknown> {
  /** `true` for 2xx/3xx status codes, `false` otherwise (unless overridden). */
  success: boolean;
  /** HTTP status code associated with the response. */
  statusCode: number;
  /** Human-readable summary of the response. */
  message: string;
  /** Response payload. `null` when there is nothing to return. */
  data: T | null;
  /** Present only when `options.errors` was supplied and non-empty. */
  errors?: ApiError[];
  /** Present only when `options.meta` was supplied and non-empty. */
  meta?: ApiMeta;
  /** Timestamp of when the response object was created (format per `timestampFormat`). */
  timestamp: string | number;
}
