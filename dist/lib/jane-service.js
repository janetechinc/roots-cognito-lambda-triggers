"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const api_service_1 = __importDefault(require("./api-service"));
const COGNITO_API = '/roots/store_operations_api/v1/cognito';
/** ----- HELPERS ----- */
const buildErrorMessage = (message, response) => {
    return `${message} ${JSON.stringify({
        status: response.statusCode,
        message: response.statusMessage,
    })}`;
};
const createUser = async (data, token) => {
    const response = await api_service_1.default.post(`${COGNITO_API}/create_user`, data, token);
    return {
        success: response.statusCode === 200,
        errorMessage: response.statusMessage,
    };
};
const userExists = async (data, token) => {
    const response = await api_service_1.default.post(`${COGNITO_API}/user_exists`, data, token);
    switch (response.statusCode) {
        case 200:
            return true;
        case 404:
            return false;
        default:
            throw new Error(buildErrorMessage(`Error checking user existence`, response));
    }
};
const userCanResetPassword = async (data, token) => {
    const response = await api_service_1.default.post(`${COGNITO_API}/user_can_reset_password`, data, token);
    const result = {
        valid: false,
        errorMessage: '',
    };
    switch (response.statusCode) {
        case 200:
            result.valid = true;
            break;
        case 404:
            result.errorMessage = response.body
                ? JSON.stringify(response.body)
                : 'Could not find account with that email';
            break;
        default:
            result.errorMessage = buildErrorMessage('Error verifying password reset', response);
    }
    return result;
};
const verifyCredentials = async (data, token) => {
    const response = await api_service_1.default.post(`${COGNITO_API}/verify_credentials`, data, token);
    const result = {
        valid: false,
        errorMessage: '',
    };
    switch (response.statusCode) {
        case 200:
            result.valid = true;
            break;
        case 401:
            result.errorMessage = 'Invalid password';
            break;
        case 404:
            result.errorMessage = 'User not found';
            break;
        default:
            result.errorMessage = buildErrorMessage('Error verifying user', response);
    }
    return result;
};
const validateUser = async (data, token) => {
    const response = await api_service_1.default.post(`${COGNITO_API}/validate_user`, data, token);
    const result = {
        valid: false,
        errorMessage: '',
    };
    switch (response.statusCode) {
        case 200:
            result.valid = true;
            break;
        case 400:
            result.errorMessage = JSON.stringify(response.body);
            break;
        default:
            result.errorMessage = buildErrorMessage('Error validating user', response);
    }
    return result;
};
const getAppClient = async (appClientId, token) => {
    const response = await api_service_1.default.get(`${COGNITO_API}/app_clients/${appClientId}`, token);
    if (response.statusCode === 404) {
        return null;
    }
    return response.body;
};
exports.default = {
    userCanResetPassword,
    createUser,
    getAppClient,
    userExists,
    verifyCredentials,
    validateUser
};
