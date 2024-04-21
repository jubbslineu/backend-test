"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.printAppInfo = void 0;
const chalk_1 = __importDefault(require("chalk"));
const helper_1 = require("./helper");
const app_config_1 = __importDefault(require("../config/app.config"));
const environment_1 = __importDefault(require("../lib/environment"));
const logger_1 = require("../lib/logger");
const primaryChalk = chalk_1.default.green;
const label = (text) => {
    const labelChalk = chalk_1.default.white.bold;
    const icon = primaryChalk('✔');
    return `${icon} ${labelChalk(text)}`;
};
const printAppInfo = (port, env, appUrl, apiUrl) => {
    const { docs: { swaggerUIPath, apiDocsPath }, } = app_config_1.default;
    const divider = (0, helper_1.HR)('blue', '~', 55);
    const urlChalk = chalk_1.default.underline.blue;
    const serverSuccessMessage = primaryChalk.bold('🚀 Server successfully started');
    console.log(`
    \r${divider}\n
    \r${serverSuccessMessage}\n
    \r${divider}\n
    \r${label('Port')}: ${primaryChalk(port)}\n
    \r${label('ENV')}: ${primaryChalk(env)}\n
    \r${label('App URL')}: ${urlChalk(appUrl)}\n
    \r${label('Api URL')}: ${urlChalk(apiUrl)}\n
    \r${label('Swagger')}: ${urlChalk(`${appUrl}${swaggerUIPath}`)}\n
    \r${label('API Specs')}: ${urlChalk(`${appUrl}${apiDocsPath}`)}\n
    \r${divider}
  `);
    if (!environment_1.default.isDev()) {
        (0, logger_1.logWithoutConsole)({
            level: 'info',
            message: `Server started at ${appUrl}`,
        });
    }
};
exports.printAppInfo = printAppInfo;
//# sourceMappingURL=print-app-info.js.map