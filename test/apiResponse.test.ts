import { describe, it, expect } from "vitest";
import apiResponse, { successResponse, errorResponse } from "../src/index";

describe("apiResponse (core)", () => {
  it("builds a basic response with defaults", () => {
    const res = apiResponse(200, "OK");
    expect(res.statusCode).toBe(200);
    expect(res.message).toBe("OK");
    expect(res.data).toBeNull();
    expect(res.success).toBe(true);
    expect(typeof res.timestamp).toBe("string");
  });

  it("derives success from the status code", () => {
    expect(apiResponse(201, "Created").success).toBe(true);
    expect(apiResponse(399, "Redirect").success).toBe(true);
    expect(apiResponse(400, "Bad request").success).toBe(false);
    expect(apiResponse(500, "Server error").success).toBe(false);
  });

  it("lets `options.success` override the derived value", () => {
    expect(apiResponse(200, "OK", null, { success: false }).success).toBe(false);
    expect(apiResponse(500, "Partial failure", null, { success: true }).success).toBe(true);
  });

  it("attaches data of any shape", () => {
    const payload = { id: 1, tags: ["a", "b"] };
    expect(apiResponse(200, "OK", payload).data).toEqual(payload);
  });

  it("omits `errors` and `meta` when not supplied", () => {
    const res = apiResponse(200, "OK");
    expect(res).not.toHaveProperty("errors");
    expect(res).not.toHaveProperty("meta");
  });

  it("attaches non-empty `errors` and `meta`", () => {
    const res = apiResponse(422, "Validation failed", null, {
      errors: [{ field: "email", message: "Required" }],
      meta: { requestId: "abc-123" },
    });
    expect(res.errors).toEqual([{ field: "email", message: "Required" }]);
    expect(res.meta).toEqual({ requestId: "abc-123" });
  });

  it("omits empty `errors`/`meta` arrays and objects", () => {
    const res = apiResponse(200, "OK", null, { errors: [], meta: {} });
    expect(res).not.toHaveProperty("errors");
    expect(res).not.toHaveProperty("meta");
  });

  it("supports the legacy 'date' timestamp format", () => {
    const res = apiResponse(200, "OK", null, { timestampFormat: "date" });
    // toDateString() format, e.g. "Wed Sep 12 2026"
    expect(res.timestamp).toMatch(/^[A-Z][a-z]{2} [A-Z][a-z]{2} \d{2} \d{4}$/);
  });

  it("supports the 'unix' timestamp format", () => {
    const res = apiResponse(200, "OK", null, { timestampFormat: "unix" });
    expect(typeof res.timestamp).toBe("number");
  });

  it("throws on a non-numeric statusCode", () => {
    // @ts-expect-error intentionally passing a bad type at the JS boundary
    expect(() => apiResponse("200", "OK")).toThrow(TypeError);
  });

  it("throws on an empty message", () => {
    expect(() => apiResponse(200, "")).toThrow(TypeError);
  });
});

describe("successResponse", () => {
  it("always sets success: true, regardless of status code", () => {
    expect(successResponse(200, "OK").success).toBe(true);
    expect(successResponse(500, "Recovered").success).toBe(true);
  });
});

describe("errorResponse", () => {
  it("always sets success: false, regardless of status code", () => {
    expect(errorResponse(404, "Not found").success).toBe(false);
    expect(errorResponse(200, "Soft failure").success).toBe(false);
  });

  it("carries structured errors", () => {
    const res = errorResponse(422, "Validation failed", null, {
      errors: [{ field: "email", message: "Required" }],
    });
    expect(res.errors).toHaveLength(1);
    expect(res.errors?.[0].field).toBe("email");
  });
});
