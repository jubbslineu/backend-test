import { Router } from 'express';
import Controller from './users.controller';
import { CreateUserDto } from '@/dto/user.dto';
import RequestValidator from '@/middlewares/request-validator';

const users: Router = Router();
const controller = new Controller();

users.post(
  '/authenticate',
  RequestValidator.validate(CreateUserDto),
  controller.authenticate
);

export default users;

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
