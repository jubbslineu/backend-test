import {
  Validate,
  IsDefined,
  IsArray,
  IsString,
  IsNumber,
  IsDecimal,
  isDecimal,
  IsEmail,
  IsInt,
  ValidatorConstraint,
  type ValidatorConstraintInterface,
  type ValidationArguments,
  IsOptional,
} from 'class-validator';

@ValidatorConstraint({ name: 'TokensPerPhaseValidator', async: false })
export class TokensPerPhaseConstraint implements ValidatorConstraintInterface {
  validate(array: number[], args: ValidationArguments) {
    return (
      array.every((value) => typeof value === 'number') &&
      array.length === (args.object as any).phases
    );
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} must a number array with lenght equal to the number of phases`;
  }
}

@ValidatorConstraint({ name: 'PriceIncrementValidator', async: false })
export class PriceIncrementConstraint implements ValidatorConstraintInterface {
  validate(array: string[], args: ValidationArguments) {
    return (
      array.every((value) => isDecimal(value)) &&
      array.length === (args.object as any).phases - 1
    );
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} must a number array with lenght equal to the number of phases`;
  }
}

export class StartNewDto {
  @IsDefined()
  @IsString()
  name: string;

  @IsDefined()
  @IsNumber()
  phases: number;

  @IsDefined()
  @IsArray()
  @Validate(TokensPerPhaseConstraint)
  tokensPerPhase: number[];

  @IsDefined()
  @IsDecimal()
  initialPrice: string;

  @IsDefined()
  @IsArray()
  @Validate(PriceIncrementConstraint)
  priceIncrement: string[];
}

export class PurchaseWithCryptoDto {
  @IsInt()
  amount!: number;

  @IsOptional()
  @IsEmail()
  userEmail: string;
}
