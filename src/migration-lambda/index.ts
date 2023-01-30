import { UserMigrationTriggerEvent, UserMigrationTriggerHandler } from 'aws-lambda';
import Jane from '../lib/jane-service';
import apiService from '../lib/api-service';

const AUTH_TRIGGER = 'UserMigration_Authentication';
const FORGOT_PASSWORD_TRIGGER = 'UserMigration_ForgotPassword';
const EMAIL_VERIFIED = 'true';
const CONFIRMED_STATUS = 'CONFIRMED';
const SUPPRESS_ACTION = 'SUPPRESS';

const authHandler = async (event: UserMigrationTriggerEvent, token: string): Promise<UserMigrationTriggerEvent> => {
  const userExists = await Jane.userExists({
    email: event.userName,
    app_client_id: event.callerContext.clientId,
  }, token);

  if (!userExists) {
    throw new Error('User not found');
  }

  const { valid, errorMessage } = await Jane.verifyCredentials({
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
  } else {
    throw new Error(errorMessage);
  }

  return event;
};

const forgotPasswordHandler = async (event: UserMigrationTriggerEvent, token: string): Promise<UserMigrationTriggerEvent> => {
  const { valid, errorMessage } = await Jane.userCanResetPassword({
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

export const handler: UserMigrationTriggerHandler = async (event) => {
  const token = await apiService.authenticateClient();

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
  } else if (event.triggerSource === FORGOT_PASSWORD_TRIGGER) {
    event = await forgotPasswordHandler(event, token);
  }

  return event;
};
