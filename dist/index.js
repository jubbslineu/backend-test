"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
const server_1 = __importDefault(require("./server"));
const print_app_info_1 = require("./utils/print-app-info");
const app_config_1 = __importDefault(require("./config/app.config"));
const prisma_1 = __importDefault(require("./lib/prisma"));
const environment_1 = __importDefault(require("./lib/environment"));
(0, dotenv_1.config)();
server_1.default.listen(process.env.PORT, () => {
    const { port, env, appUrl: _appUrl } = environment_1.default;
    const { api: { basePath, version }, } = app_config_1.default;
    const appUrl = `${_appUrl}:${port}`;
    const apiUrl = `${appUrl}/${basePath}/${version}/${env}`;
    (0, print_app_info_1.printAppInfo)(port, env, appUrl, apiUrl);
});
process.on('SIGINT', () => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    prisma_1.default.$disconnect();
    console.log('Prisma Disconnected.');
    process.exit(0);
});
//# sourceMappingURL=index.js.map