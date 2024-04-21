"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpNotFoundError = exports.HttpUnAuthorizedError = exports.HttpInternalServerError = exports.HttpBadRequestError = exports.ApiError = void 0;
const axios_1 = require("axios");
class ApiError extends Error {
    statusCode;
    rawErrors;
    constructor(statusCode, message, rawErrors) {
        super(message);
        this.statusCode = statusCode;
        if (rawErrors) {
            this.rawErrors = rawErrors;
        }
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.ApiError = ApiError;
class HttpBadRequestError extends ApiError {
    constructor(message, errors) {
        super(axios_1.HttpStatusCode.BadRequest, message, errors);
    }
}
exports.HttpBadRequestError = HttpBadRequestError;
class HttpInternalServerError extends ApiError {
    constructor(message, errors) {
        super(axios_1.HttpStatusCode.InternalServerError, message, errors);
    }
}
exports.HttpInternalServerError = HttpInternalServerError;
class HttpUnAuthorizedError extends ApiError {
    constructor(message) {
        super(axios_1.HttpStatusCode.Unauthorized, message);
    }
}
exports.HttpUnAuthorizedError = HttpUnAuthorizedError;
class HttpNotFoundError extends ApiError {
    constructor(message, errors) {
        super(axios_1.HttpStatusCode.NotFound, message, errors);
    }
}
exports.HttpNotFoundError = HttpNotFoundError;
//# sourceMappingURL=errors.js.map