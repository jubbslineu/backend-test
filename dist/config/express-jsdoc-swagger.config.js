"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = __importStar(require("path"));
const app_config_1 = __importDefault(require("./app.config"));
const environment_1 = __importDefault(require("../lib/environment"));
const { env, port } = environment_1.default;
const { api: { basePath, version }, docs: { swaggerUIPath, apiDocsPath }, } = app_config_1.default;
const baseDir = path.join(__dirname, '../../');
const expressJSDocSwaggerConfig = {
    info: {
        version: '1.0.0',
        title: 'Rest Api',
        description: 'Api specs for',
        license: {
            name: 'MIT',
        },
    },
    servers: [
        {
            url: `${environment_1.default.appUrl}:${port}/{basePath}/{version}/{env}`,
            description: 'Express Server',
            variables: {
                port: {
                    default: port,
                },
                basePath: {
                    default: basePath,
                },
                version: {
                    default: version,
                },
                env: {
                    default: env,
                },
            },
        },
    ],
    security: {
        BearerAuth: {
            type: 'http',
            scheme: 'bearer',
        },
    },
    baseDir,
    // Glob pattern to find your jsdoc files (multiple patterns can be added in an array)
    filesPattern: `${baseDir}/src/**/*.route.ts`,
    // URL where SwaggerUI will be rendered
    swaggerUIPath,
    // Expose OpenAPI UI
    exposeSwaggerUI: true,
    // Expose Open API JSON Docs documentation in `apiDocsPath` path.
    exposeApiDocs: true,
    // Open API JSON Docs endpoint.
    apiDocsPath,
    // Set non-required fields as nullable by default
    notRequiredAsNullable: false,
    // You can customize your UI options.
    // you can extend swagger-ui-express config. You can checkout an example of this
    // in the `example/configuration/swaggerOptions.js`
    swaggerUiOptions: {},
    // multiple option in case you want more that one instance
    multiple: true,
};
exports.default = expressJSDocSwaggerConfig;
//# sourceMappingURL=express-jsdoc-swagger.config.js.map