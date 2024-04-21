"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../utils/constants");
const appConfig = {
    api: {
        basePath: 'api',
        version: 'v1',
    },
    docs: {
        swaggerUIPath: '/v1/swagger',
        apiDocsPath: '/v1/api-docs',
    },
    logs: {
        dir: './logs',
        logFile: 'app.log',
        errorLogFile: 'error.log',
    },
    defaultPort: constants_1.DEFAULT_PORT,
    defaultJwtExpiresIn: constants_1.DEFAULT_JWT_EXPIRES_IN,
};
exports.default = appConfig;
//# sourceMappingURL=app.config.js.map