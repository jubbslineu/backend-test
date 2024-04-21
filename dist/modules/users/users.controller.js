"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
const users_service_1 = __importDefault(require("./users.service"));
const api_1 = __importDefault(require("../../lib/api"));
class UserController extends api_1.default {
    userService = new users_service_1.default();
    authenticate = async (req, res, next) => {
        try {
            if (req.headers.authorization) {
                const userJwt = await this.userService.verifyUserToken(req.headers.authorization);
                this.send(res, { token: userJwt }, axios_1.HttpStatusCode.Accepted, 'User JWT Accepted');
                return;
            }
            if (!req.body.referrer) {
                const userJwt = await this.userService.createUserJwt(req.body.referee);
                this.send(res, { token: userJwt }, axios_1.HttpStatusCode.Accepted, 'User JWT Created');
                return;
            }
            const userJwt = await this.userService.createUser(req.body);
            this.send(res, { token: userJwt }, axios_1.HttpStatusCode.Created, 'User created');
        }
        catch (e) {
            next(e);
        }
    };
}
exports.default = UserController;
//# sourceMappingURL=users.controller.js.map