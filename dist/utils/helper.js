"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.envFileNotFoundError = exports.HR = void 0;
const chalk_1 = __importDefault(require("chalk"));
const environment_enum_1 = require("../enums/environment.enum");
const HR = (color = 'white', char = '-', length = 60) => {
    return chalk_1.default[color](char.repeat(length));
};
exports.HR = HR;
const envScriptChalk = (fileName) => {
    const scriptChalk = chalk_1.default.bgBlueBright.bold;
    return `${scriptChalk(` cp .env.example ${fileName} `)}`;
};
const envFileNotFoundError = (key) => {
    const divider = (0, exports.HR)('red', '~', 40);
    const envFile = environment_enum_1.EnvironmentFile[key];
    const defaultEnvFile = environment_enum_1.EnvironmentFile.DEFAULT;
    const envNotFoundMessage = chalk_1.default.red.bold('Environment file not found!!');
    const fileNotFoundMessage = `${chalk_1.default.greenBright(defaultEnvFile)} or ${chalk_1.default.greenBright(envFile)} is required`;
    return `
    \r${divider}\n
    \r${envNotFoundMessage}\n
    \r${divider}\n
    \r${fileNotFoundMessage}\n
    \r${chalk_1.default.bold('Try one of the following')}:\n
    \r${envScriptChalk(envFile)}\n
    \r${envScriptChalk(defaultEnvFile)}\n
    \r${divider}
  `;
};
exports.envFileNotFoundError = envFileNotFoundError;
//# sourceMappingURL=helper.js.map