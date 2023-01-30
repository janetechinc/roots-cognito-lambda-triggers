"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLambdaHandler = exports.lambdaWrapper = void 0;
/* eslint-disable @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any */
const rollbar_1 = __importDefault(require("rollbar"));
const rollbar = new rollbar_1.default({
    accessToken: process.env.ROLLBAR_TOKEN,
    captureUncaught: true,
    captureUnhandledRejections: true,
});
// Pull out our custom wrapper for easy testing
const lambdaWrapper = async (lambdaHandler, event, context, callback) => {
    try {
        const modifiedEvent = await lambdaHandler(event, context, callback);
        callback(null, modifiedEvent);
    }
    catch (e) {
        callback(e, null);
    }
};
exports.lambdaWrapper = lambdaWrapper;
const createLambdaHandler = (lambdaHandler) => {
    return rollbar.lambdaHandler(async (event, context, callback) => {
        await (0, exports.lambdaWrapper)(lambdaHandler, event, context, callback);
    });
};
exports.createLambdaHandler = createLambdaHandler;
exports.default = {
    createLambdaHandler: exports.createLambdaHandler,
};
