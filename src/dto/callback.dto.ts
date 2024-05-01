import {
  IsString,
  IsOptional,
  IsEmail,
  IsUrl,
  IsEnum,
  IsUUID,
  IsDateString,
  IsUppercase,
  IsNumberString,
  IsISO31661Alpha2,
  IsIP,
} from 'class-validator';
import {
  ChangellyCryptoPaymentState,
  ChangellyFiatPaymentStatus,
  ChangellyFiatProviderCode,
  ChangellyFiatPaymentMethod,
} from '@/types/changelly-api.type';

export class ChangellyCryptoCallbackDTO {
  @IsUUID()
  payment_id!: string;

  @IsOptional()
  @IsString()
  order_id: string;

  @IsOptional()
  @IsString()
  customer_id: string;

  @IsOptional()
  @IsEmail()
  customer_email: string;

  @IsEnum(ChangellyCryptoPaymentState)
  state!: ChangellyCryptoPaymentState;

  @IsDateString()
  updated_at!: string;
}

export class ChangellyFiatCallbackDTO {
  @IsUrl()
  redirectUrl: string;

  @IsString()
  order_id!: string;

  @IsEnum(ChangellyFiatPaymentStatus)
  status!: ChangellyFiatPaymentStatus;

  @IsString()
  externalUserId: string;

  @IsString()
  externalOrderId: string;

  @IsEnum(ChangellyFiatProviderCode)
  providerCode!: ChangellyFiatProviderCode;

  @IsUppercase()
  currencyFrom!: string;

  @IsUppercase()
  currencyTo!: string;

  @IsNumberString()
  amountFrom!: string;

  @IsISO31661Alpha2()
  country: string;

  @IsOptional()
  @IsString()
  state: string;

  @IsOptional()
  @IsIP()
  ip: string;

  @IsString()
  walletAddress!: string;

  @IsOptional()
  @IsString()
  walletExtraId: string;

  @IsEnum(ChangellyFiatPaymentMethod)
  paymentMethod!: ChangellyFiatPaymentMethod;

  @IsOptional()
  @IsString()
  userAgent: string;

  @IsOptional()
  metadata: any;

  @IsDateString()
  createdAt!: string;

  @IsNumberString()
  payinAmount!: string;

  @IsNumberString()
  payoutAmount!: string;

  @IsUppercase()
  payinCurrency!: string;

  @IsUppercase()
  payoutCurrency!: string;
}
