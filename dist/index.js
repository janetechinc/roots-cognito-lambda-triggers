"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PreSignupHandler = exports.PostConfirmationHandler = exports.MigrationHandler = void 0;
const migration_lambda_1 = require("./migration-lambda");
Object.defineProperty(exports, "MigrationHandler", { enumerable: true, get: function () { return migration_lambda_1.handler; } });
const post_confirmation_lambda_1 = require("./post-confirmation-lambda");
Object.defineProperty(exports, "PostConfirmationHandler", { enumerable: true, get: function () { return post_confirmation_lambda_1.handler; } });
const pre_signup_lambda_1 = require("./pre-signup-lambda");
Object.defineProperty(exports, "PreSignupHandler", { enumerable: true, get: function () { return pre_signup_lambda_1.handler; } });
