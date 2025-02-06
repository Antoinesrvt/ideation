export class BaseError extends Error {
  public readonly name: string;
  public readonly httpCode: number;
  public readonly isOperational: boolean;
  public readonly context?: Record<string, any>;

  constructor(
    name: string,
    httpCode: number,
    description: string,
    isOperational: boolean,
    context?: Record<string, any>
  ) {
    super(description);

    Object.setPrototypeOf(this, new.target.prototype);

    this.name = name;
    this.httpCode = httpCode;
    this.isOperational = isOperational;
    this.context = context;

    Error.captureStackTrace(this);
  }
}

export class APIError extends BaseError {
  constructor(
    name: string,
    httpCode = 500,
    description = 'Internal server error',
    context?: Record<string, any>
  ) {
    super(name, httpCode, description, true, context);
  }
}

export class ValidationError extends BaseError {
  constructor(description: string, context?: Record<string, any>) {
    super('ValidationError', 400, description, true, context);
  }
}

export class NotFoundError extends BaseError {
  constructor(description: string, context?: Record<string, any>) {
    super('NotFoundError', 404, description, true, context);
  }
}

export class AuthorizationError extends BaseError {
  constructor(description: string, context?: Record<string, any>) {
    super('AuthorizationError', 403, description, true, context);
  }
}

export class ServiceError extends BaseError {
  constructor(
    name: string,
    description: string,
    context?: Record<string, any>
  ) {
    super(name, 500, description, true, context);
  }
}

export type ErrorType = BaseError | Error; 