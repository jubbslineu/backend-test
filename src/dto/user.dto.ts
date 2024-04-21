import {
  Validate,
  IsOptional,
  ValidatorConstraint,
  type ValidatorConstraintInterface,
  type ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'string-or-number', async: false })
export class IsNumberOrString implements ValidatorConstraintInterface {
  validate(text: any, args: ValidationArguments) {
    return typeof text === 'number' || typeof text === 'string';
  }

  defaultMessage(args: ValidationArguments) {
    return '($value) must be number or string';
  }
}

export class CreateUserDto {
  @IsOptional()
  @Validate(IsNumberOrString)
  user: string;

  @IsOptional()
  @Validate(IsNumberOrString)
  referrer: string;
}
