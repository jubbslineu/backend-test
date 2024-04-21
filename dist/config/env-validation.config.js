"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const envalid_1 = require("envalid");
const app_config_1 = __importDefault(require("./app.config"));
const environment_enum_1 = require("../enums/environment.enum");
const envValidationConfig = {
    NODE_ENV: (0, envalid_1.str)({
        default: environment_enum_1.Environments.DEV,
        choices: [...Object.values(environment_enum_1.Environments)],
    }),
    PORT: (0, envalid_1.num)({ default: app_config_1.default.defaultPort }),
    APP_BASE_URL: (0, envalid_1.str)(),
    DATABASE_URL: (0, envalid_1.str)(),
    JWT_SECRET: (0, envalid_1.str)(),
    JWT_EXPIRES_IN: (0, envalid_1.num)({ default: app_config_1.default.defaultJwtExpiresIn }),
};
exports.default = envValidationConfig;
//# sourceMappingURL=env-validation.config.js.map