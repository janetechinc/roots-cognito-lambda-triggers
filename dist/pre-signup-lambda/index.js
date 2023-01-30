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
 *    "PreSignUp_SignUp"            Normal sign up
 *    "PreSignUp_ExternalProvider"  Sign up via external provider
 *    "PreSignUp_AdminCreateUser"   Admin user creation, via the console or migration flows
 *
 * We skip this check on "PreSignUp_AdminCreateUser" so that we can create users manually
 * whenever necessary.
 */
const ADMIN_CREATE_USER = 'PreSignUp_AdminCreateUser';
const handler = async (event) => {
    const token = await api_service_1.default.authenticateClient();
    console.log(event);
    if (event.triggerSource === ADMIN_CREATE_USER) {
        console.log(`Trigger source matches "${ADMIN_CREATE_USER}", returning.`);
        return event;
    }
    const email = event.request.userAttributes.email;
    const appClientId = event.callerContext.clientId;
    const appClientPromise = jane_service_1.default.getAppClient(appClientId, token);
    const userExistsPromise = jane_service_1.default.userExists({
        email,
        app_client_id: appClientId,
    }, token);
    const validUserPromise = jane_service_1.default.validateUser({
        pool_id: event.userPoolId,
        ...(0, utils_1.mapUserAttributes)(event.request.userAttributes),
    }, token);
    return Promise.all([
        appClientPromise,
        userExistsPromise,
        validUserPromise,
    ]).then(([appClient, userExists, validUserResponse]) => {
        if (!appClient) {
            throw Error(`App Client ID ${appClientId} was not found`);
        }
        if (userExists) {
            throw Error('User already exists, please log in');
        }
        if (!validUserResponse.valid) {
            throw Error(validUserResponse.errorMessage);
        }
        if (appClient.auto_confirm_email) {
            event.response.autoConfirmUser = true;
            event.response.autoVerifyEmail = true;
        }
        return event;
    });
};
exports.handler = handler;
