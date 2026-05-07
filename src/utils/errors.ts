export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public details?: unknown,
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(400, message, details);
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class AuthError extends AppError {
  constructor(message: string = "Unauthorized", details?: unknown) {
    super(401, message, details);
    Object.setPrototypeOf(this, AuthError.prototype);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "Forbidden", details?: unknown) {
    super(403, message, details);
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = "Resource") {
    super(404, `${resource} not found`);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details?: unknown) {
    super(409, message, details);
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}

export class InternalServerError extends AppError {
  constructor(message: string = "Internal server error", details?: unknown) {
    super(500, message, details);
    Object.setPrototypeOf(this, InternalServerError.prototype);
  }
}
