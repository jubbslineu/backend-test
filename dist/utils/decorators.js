"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createContextDecorator = exports.createDecorator = void 0;
const logger_1 = __importDefault(require("../lib/logger"));
/**
 * Creates a decorator that wraps the original method with an additional function.
 * @param descriptorFn - The additional function to execute before the original method.
 * @param descriptorArgs - Arguments for the descriptor function.
 * @returns The generated decorator function.
 */
function createDecorator(descriptorFn, descriptorArgs) {
    return function (_target, key, descriptor) {
        const originalMethod = descriptor.value;
        descriptor.value = async function (...args) {
            logger_1.default.info(`Executing decorator before method: ${key}`);
            descriptorFn(descriptorArgs);
            logger_1.default.info('Decorator executed');
            return originalMethod ? originalMethod.apply(this, args) : null;
        };
        return descriptor;
    };
}
exports.createDecorator = createDecorator;
/**
 * Creates a context-aware decorator.
 * @param context - The context for the decorator.
 * @param _target - The target context.
 * @param descriptorFn - The additional function to execute before the original method.
 * @param descriptorArgs - Arguments for the descriptor function.
 * @returns The generated context-aware decorator.
 */
function createContextDecorator(context, _target, descriptorFn, descriptorArgs) {
    const methodName = String(context.name);
    logger_1.default.info(`Executing decorator for ${methodName}`);
    return function (_target, _key, descriptor) {
        const originalMethod = descriptor.value;
        descriptor.value = async function (...args) {
            descriptorFn(descriptorArgs);
            return originalMethod ? originalMethod.apply(this, args) : null;
        };
        return descriptor;
    };
}
exports.createContextDecorator = createContextDecorator;
//# sourceMappingURL=decorators.js.map