"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const jane_service_1 = __importDefault(require("../lib/jane-service"));
const api_service_1 = __importDefault(require("../lib/api-service"));
const AUTH_TRIGGER = 'UserMigration_Authentication';
const FORGOT_PASSWORD_TRIGGER = 'UserMigration_ForgotPassword';
const EMAIL_VERIFIED = 'true';
const CONFIRMED_STATUS = 'CONFIRMED';
const SUPPRESS_ACTION = 'SUPPRESS';
const authHandler = async (event, token) => {
    const userExists = await jane_service_1.default.userExists({
        email: event.userName,
        app_client_id: event.callerContext.clientId,
    }, token);
    if (!userExists) {
        throw new Error('User not found');
    }
    const { valid, errorMessage } = await jane_service_1.default.verifyCredentials({
        email: event.userName,
        password: event.request.password,
    }, token);
    if (valid) {
        event.response.userAttributes = {
            email: event.userName,
            email_verified: EMAIL_VERIFIED,
        };
        event.response.finalUserStatus = CONFIRMED_STATUS;
        event.response.messageAction = SUPPRESS_ACTION;
    }
    else {
        throw new Error(errorMessage);
    }
    return event;
};
const forgotPasswordHandler = async (event, token) => {
    const { valid, errorMessage } = await jane_service_1.default.userCanResetPassword({
        email: event.userName,
        app_client_id: event.callerContext.clientId,
    }, token);
    if (!valid) {
        throw new Error(errorMessage);
    }
    event.response.userAttributes = {
        email: event.userName,
        email_verified: EMAIL_VERIFIED,
    };
    event.response.messageAction = SUPPRESS_ACTION;
    return event;
};
const handler = async (event) => {
    const token = await api_service_1.default.authenticateClient();
    const sanitizedEvent = {
        ...event,
        request: {
            ...event.request,
            password: 'REDACTED',
        },
    };
    console.log(sanitizedEvent);
    if (event.triggerSource === AUTH_TRIGGER) {
        event = await authHandler(event, token);
    }
    else if (event.triggerSource === FORGOT_PASSWORD_TRIGGER) {
        event = await forgotPasswordHandler(event, token);
    }
    return event;
};
exports.handler = handler;
