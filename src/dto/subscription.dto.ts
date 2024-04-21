import {
  IsDefined,
  IsOptional,
  IsString,
  Validate,
  IsDateString,
  IsEmail,
} from 'class-validator';
import { IsNumberOrString } from './common';

export class SubscriptionDto {
  @IsDefined()
  @Validate(IsNumberOrString)
  telegramId: string | number;

  @IsOptional()
  @Validate(IsString)
  telegramUsername: string;

  @IsOptional()
  @Validate(IsString)
  phoneNumber: string;

  @IsOptional()
  @Validate(IsDateString)
  dateOfBirth: string;

  @IsOptional()
  @Validate(IsString)
  homeAddress: string;

  @IsOptional()
  @Validate(IsString)
  cityOfResidency: string;

  @IsOptional()
  @Validate(IsEmail)
  emailAddress: string;

  @IsOptional()
  @Validate(IsString)
  occupation: string;

  @IsOptional()
  @Validate(IsString)
  industry: string;

  @IsOptional()
  @Validate(IsString)
  indicative: string;

  @IsOptional()
  @Validate(IsString)
  joiningReasons: string;

  @IsOptional()
  @Validate(IsString)
  personalInterests: string;
}
