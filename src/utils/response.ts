/**
 * Success response wrapper
 */
export interface SuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
  timestamp: string;
}

/**
 * Error response wrapper
 */
export interface ErrorResponse {
  success: false;
  message: string;
  error: string;
  details?: unknown;
  requestId?: string;
  timestamp: string;
}

/**
 * Create a success response
 */
export function successResponse<T>(
  data: T,
  message?: string,
): SuccessResponse<T> {
  return {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Create an error response
 */
export function errorResponse(
  message: string,
  error: string,
  details?: unknown,
  requestId?: string,
): ErrorResponse {
  return {
    success: false,
    message,
    error,
    details,
    requestId,
    timestamp: new Date().toISOString(),
  };
}
