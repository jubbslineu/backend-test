import jwt from 'jsonwebtoken';
import environment from '@/lib/environment';

export enum JwtDecodeErrorReason {
  INVALID_TOKEN = 'Invalid Token',
  EXPIRED = 'Token Expired',
  UNKNOWN = 'Unknown',
}

export class JwtDecodeError extends Error {
  readonly reason: JwtDecodeErrorReason;

  constructor(reason: JwtDecodeErrorReason) {
    super(`Failed decoding user JWT, reason: ${reason.toString()}`);
    this.reason = reason;
  }
}

export const signJwt = (user: string): string => {
  return jwt.sign(
    {
      id: user,
    },
    environment.jwtSecret,
    {
      expiresIn: environment.jwtExpiresIn,
    }
  );
};

export const decodeJwt = (token: string): jwt.JwtPayload => {
  try {
    return jwt.verify(token, environment.jwtSecret) as jwt.JwtPayload;
  } catch (e) {
    if (e instanceof jwt.JsonWebTokenError) {
      throw new JwtDecodeError(JwtDecodeErrorReason.INVALID_TOKEN);
    }
    if (e instanceof jwt.TokenExpiredError) {
      throw new JwtDecodeError(JwtDecodeErrorReason.EXPIRED);
    }
  }

  throw new JwtDecodeError(JwtDecodeErrorReason.UNKNOWN);
};
