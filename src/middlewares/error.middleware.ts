class ErrorMiddleware extends Error {
  constructor(
    public message: string,
    public errorType: string,
    public statusCode: number,
  ) {
    super(message);
    this.errorType = errorType;
    this.message = message;
    this.statusCode = statusCode;

    Error.captureStackTrace(this, this.constructor);
  }

  static notFound(message: string, errorType: string) {
    return new ErrorMiddleware(message, errorType, 404);
  }

  static internal(message: string, errorType: string) {
    return new ErrorMiddleware(message, errorType, 500);
  }

  static badRequest(message: string, errorType: string) {
    return new ErrorMiddleware(message, errorType, 400);
  }

  static unauthorized(message: string, errorType: string) {
    return new ErrorMiddleware(message, errorType, 401);
  }

  static forbidden(message: string, errorType: string) {
    return new ErrorMiddleware(message, errorType, 403);
  }

  static conflict(message: string, errorType: string) {
    return new ErrorMiddleware(message, errorType, 409);
  }

  static unprocessable(message: string, errorType: string) {
    return new ErrorMiddleware(message, errorType, 422);
  }

  static notAcceptable(message: string, errorType: string) {
    return new ErrorMiddleware(message, errorType, 406);
  }

  static tooMany(message: string, errorType: string) {
    return new ErrorMiddleware(message, errorType, 429);
  }

  static custom(message: string, statusCode: number, errorType: string) {
    return new ErrorMiddleware(message, errorType, statusCode);
  }
}

export default ErrorMiddleware;
