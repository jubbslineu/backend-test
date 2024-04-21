"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnvironmentFile = exports.Environments = void 0;
var Environments;
(function (Environments) {
    Environments["PRODUCTION"] = "production";
    Environments["DEV"] = "development";
    Environments["TEST"] = "test";
    Environments["STAGING"] = "staging";
})(Environments || (exports.Environments = Environments = {}));
var EnvironmentFile;
(function (EnvironmentFile) {
    EnvironmentFile["DEFAULT"] = ".env";
    EnvironmentFile["PRODUCTION"] = ".env.prod";
    EnvironmentFile["DEV"] = ".env.dev";
    EnvironmentFile["TEST"] = ".env.test";
    EnvironmentFile["STAGING"] = ".env.stage";
})(EnvironmentFile || (exports.EnvironmentFile = EnvironmentFile = {}));
//# sourceMappingURL=environment.enum.js.map