"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyUserToken = void 0;
const errors_1 = require("../lib/errors");
const jwt_1 = require("../utils/jwt");
const prisma_1 = __importDefault(require("../lib/prisma"));
const verifyUserToken = async (
// Remove underscore of params once you start using them
req, _res, next) => {
    if (!req.headers.authorization) {
        throw new errors_1.HttpBadRequestError('Invalid user token', [
            'No authorization header',
        ]);
    }
    try {
        const tokenInfo = (0, jwt_1.decodeJwt)(req.headers.authorization);
        const user = prisma_1.default.user.findUnique({
            where: { id: tokenInfo.id },
        });
        if (!user) {
            throw new errors_1.HttpBadRequestError('Invalid user token', [
                'User not registered',
            ]);
        }
    }
    catch (e) {
        throw new errors_1.HttpBadRequestError('Invalid user token', [e.message]);
    }
    next();
};
exports.verifyUserToken = verifyUserToken;
//# sourceMappingURL=auth.js.map