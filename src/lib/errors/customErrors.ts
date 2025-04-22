export class UnauthorizedError extends Error {
  constructor(message = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends Error {
  constructor(message = 'Forbidden') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

export class ResourceNotFound extends Error {
  status: number;

  constructor(message = 'Resource not found') {
    super(message);
    this.name = 'ResourceNotFound';
    this.status = 404;
  }
}

export class ValidationError extends Error {
  constructor(message = 'Validation Error') {
    super(message);
    this.name = 'ValidationError';
  }
}
