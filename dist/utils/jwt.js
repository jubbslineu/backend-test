"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeJwt = exports.signJwt = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const environment_1 = __importDefault(require("../lib/environment"));
const signJwt = (user) => {
    return jsonwebtoken_1.default.sign({
        id: user,
        timestamp: Date.now(),
    }, environment_1.default.jwtSecret, {
        expiresIn: environment_1.default.jwtExpiresIn,
    });
};
exports.signJwt = signJwt;
const decodeJwt = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, environment_1.default.jwtSecret);
    }
    catch (e) {
        if (e instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            throw new Error('JsonWebtokenError');
        }
        if (e instanceof jsonwebtoken_1.default.TokenExpiredError) {
            throw new Error('TokenExpiredError');
        }
    }
    throw new Error('Unknown JWT error');
};
exports.decodeJwt = decodeJwt;
//# sourceMappingURL=jwt.js.map