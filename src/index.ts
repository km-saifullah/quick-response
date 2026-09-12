import { apiResponse } from "./apiResponse";

export { apiResponse, successResponse, errorResponse } from "./apiResponse";
export type { ApiResponse, ApiResponseOptions, ApiError, ApiMeta } from "./types";

// Default export kept for backward compatibility with v1
// (`import apiResponse from "quick-response"` / `require("quick-response")`).
export default apiResponse;
