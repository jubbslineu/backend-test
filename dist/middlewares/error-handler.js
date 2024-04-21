"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = __importDefault(require("util"));
const axios_1 = require("axios");
const logger_1 = __importDefault(require("../lib/logger"));
const environment_1 = __importDefault(require("../lib/environment"));
const errorHandler = (err, req, res, next) => {
    logger_1.default.error(`Request Error:
        \nError:\n${JSON.stringify(err)}
        \nHeaders:\n${util_1.default.inspect(req.headers)}
        \nParams:\n${util_1.default.inspect(req.params)}
        \nQuery:\n${util_1.default.inspect(req.query)}
        \nBody:\n${util_1.default.inspect(req.body)}`);
    const status = err.statusCode ?? axios_1.HttpStatusCode.InternalServerError;
    const errorBody = {
        success: false,
        message: err.message,
        rawErrors: err.rawErrors,
    };
    if (environment_1.default.isDev()) {
        errorBody.stack = err.stack;
    }
    res.status(status).send(errorBody);
    next();
};
exports.default = errorHandler;
//# sourceMappingURL=error-handler.js.map