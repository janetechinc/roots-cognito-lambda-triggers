"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const headers = { 'Content-Type': 'application/json' };
const authenticateClient = async () => {
    const clientId = process.env.CLIENT_ID || '';
    const clientSecret = process.env.CLIENT_SECRET || '';
    const janeApiHost = process.env.JANE_API_HOST;
    const resp = await axios_1.default.post(`${janeApiHost}/oauth/token`, {
        grant_type: 'client_credentials'
    }, {
        auth: {
            username: clientId,
            password: clientSecret
        }
    });
    return resp.data.access_token;
};
const makeRequest = async (options) => {
    const host = process.env.API_HOST;
    if (!host) {
        throw Error('No API_HOST configured');
    }
    try {
        const response = await (0, axios_1.default)({
            method: options.method || 'get',
            headers: { ...headers, 'Authorization': `Bearer ${options.token}` },
            data: options.body
        });
        return {
            statusCode: response.status,
            body: response.data,
            statusMessage: response.statusText
        };
    }
    catch (e) {
        return Promise.reject(e);
    }
};
const get = async (path, token) => makeRequest({ path, token });
const post = async (path, data, token) => makeRequest({
    path,
    token,
    method: 'post',
    body: JSON.stringify(data),
});
exports.default = { get, post, authenticateClient };
