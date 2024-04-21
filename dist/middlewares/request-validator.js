"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const errors_1 = require("../lib/errors");
const logger_1 = __importDefault(require("../lib/logger"));
class RequestValidator {
    static validate = (classInstance) => {
        return async (req, _res, next) => {
            const validationErrorText = 'Request validation failed!';
            try {
                const convertedObject = (0, class_transformer_1.plainToInstance)(classInstance, req.body);
                const errors = await (0, class_validator_1.validate)(convertedObject);
                if (!errors.length) {
                    next();
                    return;
                }
                const rawErrors = [
                    ...new Set([
                        ...errors.flatMap((error) => Object.values(error.constraints ?? [])),
                    ]),
                ];
                logger_1.default.error(rawErrors);
                next(new errors_1.HttpBadRequestError(validationErrorText, rawErrors));
            }
            catch (e) {
                console.log('eee', e.message, e);
                logger_1.default.error(e);
                next(new errors_1.HttpBadRequestError(validationErrorText, [e.message]));
            }
        };
    };
}
exports.default = RequestValidator;
//# sourceMappingURL=request-validator.js.map