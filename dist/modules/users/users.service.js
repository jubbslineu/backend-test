"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// import { type User } from '@prisma/client';
const log_message_decorator_1 = __importDefault(require("../../decorators/log-message.decorator"));
const errors_1 = require("../../lib/errors");
const prisma_1 = __importDefault(require("../../lib/prisma"));
const jwt_1 = require("../../utils/jwt");
class UserService {
    async verifyUserToken(token) {
        try {
            const tokenInfo = (0, jwt_1.decodeJwt)(token);
            const user = await prisma_1.default.user.findUnique({
                where: { id: tokenInfo.id },
            });
            if (!user) {
                throw new errors_1.HttpBadRequestError('Authentication Failed', [
                    'Invalid user JWT',
                    'User not registered',
                ]);
            }
            return (0, jwt_1.signJwt)(tokenInfo.id);
        }
        catch (e) {
            throw new errors_1.HttpBadRequestError('Authentication Failed', [
                'Invalid JWT',
                e.message,
            ]);
        }
    }
    async createUserJwt(userId) {
        const user = await prisma_1.default.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new errors_1.HttpBadRequestError('Authentication Failed', [
                'User ID not found',
            ]);
        }
        return (0, jwt_1.signJwt)(userId);
    }
    async createUser(data) {
        const [existingUser, referrer] = await prisma_1.default.$transaction([
            prisma_1.default.user.findUnique({
                where: { id: String(data.user) },
            }),
            prisma_1.default.user.findUnique({
                where: { id: String(data.referrer) },
            }),
        ]);
        if (!existingUser) {
            if (!referrer) {
                throw new errors_1.HttpBadRequestError('Authentication Failed', [
                    'Referrer not registered',
                ]);
            }
            const user = await prisma_1.default.user.create({
                data: {
                    id: String(data.user),
                    referredById: referrer.id,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    username: data.username,
                    languageCode: data.languageCode,
                },
            });
            return (0, jwt_1.signJwt)(user.id);
        }
        return (0, jwt_1.signJwt)(existingUser.id);
    }
}
exports.default = UserService;
__decorate([
    (0, log_message_decorator_1.default)({ message: 'test-decorator' })
], UserService.prototype, "createUser", null);
//# sourceMappingURL=users.service.js.map