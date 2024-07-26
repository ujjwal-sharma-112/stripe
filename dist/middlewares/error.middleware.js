"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ErrorMiddleware extends Error {
    constructor(message, errorType, statusCode) {
        super(message);
        this.message = message;
        this.errorType = errorType;
        this.statusCode = statusCode;
        this.errorType = errorType;
        this.message = message;
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor);
    }
    static notFound(message, errorType) {
        return new ErrorMiddleware(message, errorType, 404);
    }
    static internal(message, errorType) {
        return new ErrorMiddleware(message, errorType, 500);
    }
    static badRequest(message, errorType) {
        return new ErrorMiddleware(message, errorType, 400);
    }
    static unauthorized(message, errorType) {
        return new ErrorMiddleware(message, errorType, 401);
    }
    static forbidden(message, errorType) {
        return new ErrorMiddleware(message, errorType, 403);
    }
    static conflict(message, errorType) {
        return new ErrorMiddleware(message, errorType, 409);
    }
    static unprocessable(message, errorType) {
        return new ErrorMiddleware(message, errorType, 422);
    }
    static notAcceptable(message, errorType) {
        return new ErrorMiddleware(message, errorType, 406);
    }
    static tooMany(message, errorType) {
        return new ErrorMiddleware(message, errorType, 429);
    }
    static custom(message, statusCode, errorType) {
        return new ErrorMiddleware(message, errorType, statusCode);
    }
}
exports.default = ErrorMiddleware;
//# sourceMappingURL=error.middleware.js.map