"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logWithoutConsole = void 0;
const fs_1 = require("fs");
const winston_1 = require("winston");
const environment_1 = __importDefault(require("./environment"));
const constants_1 = require("../utils/constants");
const app_config_1 = __importDefault(require("../config/app.config"));
const { logs: { dir: logDir, logFile, errorLogFile }, } = app_config_1.default;
if (!(0, fs_1.existsSync)(logDir)) {
    (0, fs_1.mkdirSync)(logDir);
}
const logTransports = [new winston_1.transports.Console()];
const fileTransports = [
    new winston_1.transports.File({
        filename: `${logDir}/${errorLogFile}`,
        level: 'error',
    }),
    new winston_1.transports.File({ filename: `${logDir}/${logFile}` }),
];
if (!environment_1.default.isDev()) {
    logTransports.push(...fileTransports);
}
const { printf, combine, label, timestamp, json, prettyPrint } = winston_1.format;
const logFormattter = printf(({ level, message, label, timestamp }) => {
    return `[${String(label)}] ${String(timestamp)} ${level}: ${String(message)}`;
});
const logger = (0, winston_1.createLogger)({
    format: combine(label({ label: environment_1.default.env }), timestamp({ format: constants_1.LOG_DATE_FORMAT }), json(), prettyPrint({ colorize: true }), logFormattter),
    transports: logTransports,
});
const logWithoutConsole = (logEntry) => {
    const consoleTransport = logger.transports.find((transport) => transport instanceof winston_1.transports.Console);
    const fileTransport = logger.transports.find((transport) => transport instanceof winston_1.transports.File);
    if (!fileTransport) {
        fileTransports.forEach((transport) => logger.add(transport));
    }
    if (!consoleTransport) {
        logger.log(logEntry);
        return;
    }
    logger.remove(consoleTransport);
    logger.log(logEntry);
    logger.add(consoleTransport);
};
exports.logWithoutConsole = logWithoutConsole;
exports.default = logger;
//# sourceMappingURL=logger.js.map