"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const users_controller_1 = __importDefault(require("./users.controller"));
const user_dto_1 = require("../../dto/user.dto");
const request_validator_1 = __importDefault(require("../../middlewares/request-validator"));
// import { verifyAuthToken } from '../../middlewares/auth';
const users = (0, express_1.Router)();
const controller = new users_controller_1.default();
users.post('/authenticate', request_validator_1.default.validate(user_dto_1.CreateUserDto), controller.authenticate);
exports.default = users;
/**
 * Create user body
 * @typedef {object} CreateUserBody
 * @property {string} referee.required - id of referee
 * @property {string} referrer.required - id of referrer
 * @property {string} firstName - first name
 * @property {string} lastName - last name
 * @property {string} username - username
 * @property {string} languageCode - language code
 */
/**
 * User
 * @typedef {object} User
 * @property {string} referee - id of referee
 * @property {string} referrer - id of referrer
 * @property {string} firstName - first name
 * @property {string} lastName - last name
 * @property {string} username - username
 * @property {string} languageCode - language code
 */
/**
 * Response
 * @typedef {object} ResponseToken
 * @property {string} token - jwt token
 */
/**
 * POST /users/create
 * @summary Create user
 * @tags users
 * @param {CreateUserBody} request.body.required
 * @return {ResponseToken} 201 - user created
 */
//# sourceMappingURL=users.route.js.map