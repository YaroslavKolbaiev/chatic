export class ApiError extends Error {
  constructor(status, message, errors = {}) {
    super(message);

    this.status = status;
    this.errors = errors;
  }

  static BadRequest(message) {
    return new ApiError(400, message)
  }

  static Unauthorized() {
    return new ApiError(401, 'User is not authorized')
  }

  static NotFound() {
    return new ApiError(404, 'Not found')
  }
}
