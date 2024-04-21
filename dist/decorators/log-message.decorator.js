"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const decorators_1 = require("../utils/decorators");
const descriptorFn = ({ message }) => {
    console.log(message);
};
/**
 * This is a sample decorator created using the `createDecorator()` method.
 * The same format can be used to create your own custom decorators.
 */
const LogMessage = (args) => {
    return (0, decorators_1.createDecorator)(descriptorFn, args);
};
exports.default = LogMessage;
//# sourceMappingURL=log-message.decorator.js.map