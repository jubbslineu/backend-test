import type { User } from '@prisma/client';
import { HttpStatusCode } from 'axios';
import { type NextFunction, type Request } from 'express';
import UserService from './users.service';
import { type CustomResponse } from '@/types/common.type';
import type { RequestWithUser } from '@/types/extended-request.type';
import Api from '@/lib/api';

export default class UserController extends Api {
  private readonly userService = new UserService();

  public authenticate = async (
    req: Request,
    res: CustomResponse<{ token: string }>,
    next: NextFunction
  ) => {
    try {
      if (req.headers.authorization) {
        const userJwt = await this.userService.verifyUserToken(
          req.headers.authorization,
          req.body.user
        );
        return this.send(
          res,
          { token: userJwt },
          HttpStatusCode.Accepted,
          'User JWT Accepted'
        );
      }

      if (!req.body.user) {
        return this.send(
          res,
          {},
          HttpStatusCode.BadRequest,
          'Neither user nor JWT was provided'
        );
      }

      if (!req.body.referrer) {
        const userJwt = await this.userService.createUserJwt(req.body.user);
        this.send(
          res,
          { token: userJwt },
          HttpStatusCode.Accepted,
          'User JWT Created'
        );
        return;
      }

      const { jwt: userJwt, created } =
        await this.userService.createUserRecordAndJWT(req.body);

      this.send(
        res,
        { token: userJwt },
        created ? HttpStatusCode.Created : HttpStatusCode.Found,
        created ? 'User created' : 'User already registered'
      );
    } catch (e) {
      next(e);
    }
  };

  public registerTonAddress = async (
    req: RequestWithUser,
    res: CustomResponse<User>,
    next: NextFunction
  ) => {
    try {
      const userTonAddress = this.userService.updateTonAddress(
        req.user.telegramId,
        req.body.tonWalletAddress
      );

      this.send(
        res,
        { userTonAddress },
        HttpStatusCode.Accepted,
        'User TON wallet address updated'
      );
    } catch (e) {
      next(e);
    }
  };
}
