"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Environment = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = require("dotenv");
const envalid_1 = require("envalid");
const environment_enum_1 = require("../enums/environment.enum");
const env_validation_config_1 = __importDefault(require("../config/env-validation.config"));
const helper_1 = require("../utils/helper");
const app_config_1 = __importDefault(require("../config/app.config"));
class Environment {
    _port;
    _env;
    _appUrl;
    _jwtSecret;
    _jwtExpiresIn;
    constructor() {
        this.port = +process.env.PORT ?? app_config_1.default.defaultPort;
        this.setEnvironment(process.env.NODE_ENV ?? environment_enum_1.Environments.DEV);
    }
    get env() {
        return this._env;
    }
    set env(value) {
        this._env = value;
    }
    get port() {
        return this._port;
    }
    set port(value) {
        this._port = value;
    }
    get appUrl() {
        return this._appUrl;
    }
    set appUrl(value) {
        this._appUrl = value;
    }
    get jwtSecret() {
        return this._jwtSecret;
    }
    set jwtSecret(value) {
        this._jwtSecret = value;
    }
    get jwtExpiresIn() {
        return this._jwtExpiresIn;
    }
    set jwtExpiresIn(value) {
        this._jwtExpiresIn = value;
    }
    resolveEnvPath(key) {
        // On priority bar, .env.[NODE_ENV] has higher priority than default env file (.env)
        // If both are not resolved, error is thrown.
        const rootDir = path_1.default.resolve(__dirname, '../../');
        const envPath = path_1.default.resolve(rootDir, environment_enum_1.EnvironmentFile[key]);
        const defaultEnvPath = path_1.default.resolve(rootDir, environment_enum_1.EnvironmentFile.DEFAULT);
        if (!fs_1.default.existsSync(envPath) && !fs_1.default.existsSync(defaultEnvPath)) {
            throw new Error((0, helper_1.envFileNotFoundError)(key));
        }
        return fs_1.default.existsSync(envPath) ? envPath : defaultEnvPath;
    }
    validateEnvValues() {
        const env = (0, envalid_1.cleanEnv)(process.env, env_validation_config_1.default);
        this.port = env.PORT;
        this.appUrl = env.APP_BASE_URL;
        this.jwtSecret = env.JWT_SECRET;
        this.jwtExpiresIn = env.JWT_EXPIRES_IN;
    }
    setEnvironment(env = environment_enum_1.Environments.DEV) {
        this.env = env;
        const envKey = Object.keys(environment_enum_1.Environments).find((key) => environment_enum_1.Environments[key] === this.env);
        const envPath = this.resolveEnvPath(envKey);
        (0, dotenv_1.config)({ path: envPath });
        this.validateEnvValues();
    }
    getCurrentEnvironment() {
        return this.env;
    }
    isProd() {
        return this.env === environment_enum_1.Environments.PRODUCTION;
    }
    isDev() {
        return this.env === environment_enum_1.Environments.DEV;
    }
    isStage() {
        return this.env === environment_enum_1.Environments.STAGING;
    }
    isTest() {
        return this.env === environment_enum_1.Environments.TEST;
    }
}
exports.Environment = Environment;
exports.default = new Environment();
//# sourceMappingURL=environment.js.map