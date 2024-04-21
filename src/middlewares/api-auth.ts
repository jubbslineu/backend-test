import { type NextFunction, type Request, type Response } from 'express';
import { HttpBadRequestError } from '@/lib/errors';
import environment from '@/lib/environment';

export const verifyXApiAuthKey = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const xApiAuthKey = req.headers['x-api-auth-key'];

  if (!xApiAuthKey || typeof xApiAuthKey !== 'string') {
    next(
      new HttpBadRequestError('API key not provided', [
        'No x-api-auth-key header',
      ])
    );

    return;
  }

  if (!environment.apiAuthKeys?.includes(xApiAuthKey)) {
    next(
      new HttpBadRequestError('Invalid API key', ['API key does not match'])
    );

    return;
  }

  next();
};
