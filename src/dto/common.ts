import {
  ValidatorConstraint,
  type ValidationArguments,
  type ValidatorConstraintInterface,
  IsObject,
  IsString,
  Validate,
  IsBase64,
  Equals,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

@ValidatorConstraint({ name: 'string-or-number', async: false })
export class IsNumberOrString implements ValidatorConstraintInterface {
  public validate(text: any, _args: ValidationArguments) {
    return typeof text === 'number' || typeof text === 'string';
  }

  public defaultMessage(_args: ValidationArguments) {
    return '($value) must be number or string';
  }
}

@ValidatorConstraint({ name: 'uint32-string', async: false })
export class IsUint32String implements ValidatorConstraintInterface {
  public validate(numberString: string, _args: ValidationArguments): boolean {
    return (
      Number.isInteger(parseFloat(numberString)) &&
      BigInt.asUintN(32, BigInt(numberString)) === BigInt(numberString)
    );
  }

  public defaultMessage(_args: ValidationArguments): string {
    return 'Not a valid uint32 string';
  }
}

@ValidatorConstraint({ name: 'timestamp-64bit', async: false })
export class IsTimestamp64Bit implements ValidatorConstraintInterface {
  public validate(timestamp: string, _args: ValidationArguments): boolean {
    return timestamp.length <= 8 && new Date(timestamp).getTime() > 0;
  }

  public defaultMessage(_args: ValidationArguments): string {
    return 'Not a valid 64-bit timestamp string';
  }
}

@ValidatorConstraint({ name: 'string-length-equal', async: false })
export class IsStringLengthEqualTo implements ValidatorConstraintInterface {
  public validate(str: string, args: ValidationArguments): boolean {
    if (typeof args.constraints[0] !== 'string') return false;
    return str.length === parseInt(args.object[args.constraints[0]]);
  }

  public defaultMessage(args: ValidationArguments): string {
    if (
      args.constraints.length !== 1 ||
      typeof args.constraints[0] !== 'string'
    )
      return 'Constraint should be an unitary array of the field be equal to length';
    return `Length doesn't match the one specified by ${args.constraints[0]} property`;
  }
}

class TonProofDomainDto {
  @Validate(IsUint32String)
  lengthBytes!: string;

  @Validate(IsStringLengthEqualTo, ['lengthBytes'])
  value!: string;
}

export class TonProofDto {
  @Validate(IsTimestamp64Bit)
  timestamp!: string;

  @IsObject()
  @ValidateNested()
  @Type(() => TonProofDomainDto)
  domain!: TonProofDomainDto;

  @IsBase64()
  signature!: string;

  @IsString()
  payload!: string;
}

export class TonProofItemReplySuccessDto {
  @Equals('ton_proof')
  name!: string;

  @IsObject()
  @ValidateNested()
  @Type(() => TonProofDto)
  proof!: TonProofDto;
}
