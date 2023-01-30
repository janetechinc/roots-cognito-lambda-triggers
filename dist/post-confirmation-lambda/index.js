"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const utils_1 = require("../lib/utils");
const jane_service_1 = __importDefault(require("../lib/jane-service"));
const api_service_1 = __importDefault(require("../lib/api-service"));
/**
 * Possible trigger sources:
 *
 *    "PostConfirmation_ConfirmSignUp"
 *        - User has confirmed their email after sign up
 *    "PostConfirmation_ConfirmForgotPassword"
 *        - User has confirmed their new password
 *
 * We only want to create a user on ConfirmSignUp.
 */
const SIGN_UP_CONFIRMATION = 'PostConfirmation_ConfirmSignUp';
const handler = async (event) => {
    const token = await api_service_1.default.authenticateClient();
    console.log(event);
    if (event.triggerSource !== SIGN_UP_CONFIRMATION) {
        console.log(`Trigger source does not match "${SIGN_UP_CONFIRMATION}", returning.`);
        return event;
    }
    const { success, errorMessage } = await jane_service_1.default.createUser({
        pool_id: event.userPoolId,
        external_id: event.userName,
        app_client_id: event.callerContext.clientId,
        ...(0, utils_1.mapUserAttributes)(event.request.userAttributes),
    }, token);
    if (!success) {
        throw new Error(`User creation was not successful: ${errorMessage}`);
    }
    else {
        console.log('User creation successful');
    }
    return event;
};
exports.handler = handler;
