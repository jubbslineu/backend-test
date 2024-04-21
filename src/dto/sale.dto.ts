import {
  Validate,
  IsDefined,
  IsArray,
  IsString,
  IsNumber,
  IsDecimal,
  isDecimal,
  ValidatorConstraint,
  type ValidatorConstraintInterface,
  type ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'TokensPerPhaseValidator', async: false })
export class TokensPerPhaseConstraint implements ValidatorConstraintInterface {
  validate(array: any[], args: ValidationArguments) {
    return (
      array.every((value) => typeof value === 'number') &&
      array.length === (args.object as any).phases
    );
  }

  defaultMessage(args: ValidationArguments) {
    return '($value) must a number array with lenght equal to the number of phases';
  }
}

@ValidatorConstraint({ name: 'PriceIncrementValidator', async: false })
export class PriceIncrementConstraint implements ValidatorConstraintInterface {
  validate(array: any[], args: ValidationArguments) {
    return (
      array.every((value) => isDecimal(value)) &&
      array.length === (args.object as any).phases - 1
    );
  }

  defaultMessage(args: ValidationArguments) {
    return '($value) must a number array with lenght equal to the number of phases';
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
