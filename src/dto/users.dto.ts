import {
  Validate,
  IsOptional,
  ValidatorConstraint,
  type ValidatorConstraintInterface,
  type ValidationArguments,
  IsBase64,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TonProofItemReplySuccessDto } from './common';

@ValidatorConstraint({ name: 'string-or-number', async: false })
export class IsNumberOrString implements ValidatorConstraintInterface {
  validate(text: any, _args: ValidationArguments) {
    return typeof text === 'number' || typeof text === 'string';
  }

  defaultMessage(_args: ValidationArguments) {
    return '($value) must be number or string';
  }
}

export class AuthenticateDto {
  @IsOptional()
  @Validate(IsNumberOrString)
  user: string;

  @IsOptional()
  @Validate(IsNumberOrString)
  referrer: string;
}

export class RegisterTonAddressDto {
  @IsBase64()
  tonWalletAddress!: string;

  @IsObject()
  @ValidateNested()
  @Type(() => TonProofItemReplySuccessDto)
  tonProof!: TonProofItemReplySuccessDto;
}
