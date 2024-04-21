"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const nocache_1 = __importDefault(require("nocache"));
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const express_jsdoc_swagger_1 = __importDefault(require("express-jsdoc-swagger"));
const home_1 = __importDefault(require("./home"));
const environment_1 = __importDefault(require("./lib/environment"));
const express_jsdoc_swagger_config_1 = __importDefault(require("./config/express-jsdoc-swagger.config"));
const app_config_1 = __importDefault(require("./config/app.config"));
const error_handler_1 = __importDefault(require("./middlewares/error-handler"));
const index_1 = __importDefault(require("./modules/index"));
const prisma_1 = __importDefault(require("./lib/prisma"));
class App {
    express;
    constructor() {
        this.express = (0, express_1.default)();
        this.setMiddlewares();
        this.disableSettings();
        this.setRoutes();
        this.setErrorHandler();
        this.initializeDocs();
    }
    setMiddlewares() {
        this.express.use((0, cors_1.default)());
        this.express.use((0, morgan_1.default)('dev'));
        this.express.use((0, nocache_1.default)());
        this.express.use(express_1.default.json());
        this.express.use(express_1.default.urlencoded({ extended: true }));
        this.express.use((0, helmet_1.default)());
        this.express.use(express_1.default.static('public'));
    }
    disableSettings() {
        this.express.disable('x-powered-by');
    }
    setRoutes() {
        const { api: { version }, } = app_config_1.default;
        const { env } = environment_1.default;
        this.express.use('/', home_1.default);
        this.express.use(`/api/${version}/${env}`, index_1.default);
    }
    setErrorHandler() {
        this.express.use(error_handler_1.default);
    }
    initializeDocs() {
        (0, express_jsdoc_swagger_1.default)(this.express)(express_jsdoc_swagger_config_1.default);
    }
    async connectPrisma() {
        await prisma_1.default.$connect();
    }
}
exports.default = App;
//# sourceMappingURL=app.js.map