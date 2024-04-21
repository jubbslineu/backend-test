"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateUserDto = exports.IsNumberOrString = void 0;
const class_validator_1 = require("class-validator");
let IsNumberOrString = class IsNumberOrString {
    validate(text, args) {
        return typeof text === 'number' || typeof text === 'string';
    }
    defaultMessage(args) {
        return '($value) must be number or string';
    }
};
exports.IsNumberOrString = IsNumberOrString;
exports.IsNumberOrString = IsNumberOrString = __decorate([
    (0, class_validator_1.ValidatorConstraint)({ name: 'string-or-number', async: false })
], IsNumberOrString);
class CreateUserDto {
    user;
    referrer;
    firstName;
    lastName;
    username;
    languageCode;
}
exports.CreateUserDto = CreateUserDto;
__decorate([
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.Validate)(IsNumberOrString)
], CreateUserDto.prototype, "user", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Validate)(IsNumberOrString)
], CreateUserDto.prototype, "referrer", void 0);
__decorate([
    (0, class_validator_1.IsOptional)()
], CreateUserDto.prototype, "firstName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)()
], CreateUserDto.prototype, "lastName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)()
], CreateUserDto.prototype, "username", void 0);
__decorate([
    (0, class_validator_1.IsOptional)()
], CreateUserDto.prototype, "languageCode", void 0);
//# sourceMappingURL=user.dto.js.map