import { type NextFunction, type Response } from 'express';
import type { RequestWithUser } from '@/types/extended-request.type';
import { HttpBadRequestError } from '@/lib/errors';
import { verifyCallbackSignature, ApiOptions } from '@/lib/changelly-client';
import {
  ChangellyErrorType,
  ChangellyErrorReason,
} from '@/types/changelly-api.type';

const verifyChangellyCallbackHeader = async (
  apiOption: ApiOptions,
  req: RequestWithUser,
  _res: Response,
  next: NextFunction
) => {
  try {
    verifyCallbackSignature(
      apiOption,
      req.body,
      req.headers as Record<string, string>
    ) && next();
  } catch (e) {
    next(e);
  }

  next(
    new HttpBadRequestError('Invalid Changelly signature', [
      ChangellyErrorType.BAD_REQUEST,
      ChangellyErrorReason.INVALID_REQUEST,
      `Invalid header for ${apiOption}`,
      'X-Signature',
    ])
  );
};

export const verifyCryptoCallbackHeader = verifyChangellyCallbackHeader.bind(
  undefined,
  ApiOptions.CRYPTO
);

export const verifyFiatCallbackHeader = verifyChangellyCallbackHeader.bind(
  undefined,
  ApiOptions.FIAT
);
