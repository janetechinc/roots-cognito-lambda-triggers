import Jane from "../lib/jane-service.mjs";
import apiService from "../lib/api-service.mjs";

const AUTH_TRIGGER = "UserMigration_Authentication";
const FORGOT_PASSWORD_TRIGGER = "UserMigration_ForgotPassword";
const EMAIL_VERIFIED = "true";
const CONFIRMED_STATUS = "CONFIRMED";
const SUPPRESS_ACTION = "SUPPRESS";

const authHandler = async (event, token) => {
  const userExists = await Jane.userExists(
    {
      email: event.userName,
      app_client_id: event.callerContext.clientId,
    },
    token
  );

  if (!userExists) {
    throw new Error("User not found");
  }

  const { valid, errorMessage, user } = await Jane.verifyCredentials(
    {
      email: event.userName,
      password: event.request.password,
      user: response.body?.user,
    },
    token
  );

  const attributes = {};

  if (user) {
    const { first_name, last_name, phone, birth_date } = user;

    first_name && (attributes.given_name = first_name);
    last_name && (attributes.family_name = last_name);
    phone && (attributes.phone_number = addAreaCodeToPhone(phone));
    birth_date && (attributes.birthdate = birth_date);
  }

  if (valid) {
    event.response.userAttributes = {
      email: event.userName,
      email_verified: EMAIL_VERIFIED,
      ...attributes,
    };
    event.response.finalUserStatus = CONFIRMED_STATUS;
    event.response.messageAction = SUPPRESS_ACTION;
  } else {
    throw new Error(errorMessage);
  }

  return event;
};

const forgotPasswordHandler = async (event, token) => {
  const { valid, errorMessage } = await Jane.userCanResetPassword(
    {
      email: event.userName,
      app_client_id: event.callerContext.clientId,
    },
    token
  );

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

export const handler = async (event) => {
  const token = await apiService.authenticateClient();

  const sanitizedEvent = {
    ...event,
    request: {
      ...event.request,
      password: "REDACTED",
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

const addAreaCodeToPhone = (phone) => {
  let partial = phone.startsWith("+") ? phone.substring(1) : phone;

  // Missing + and country code, 2223334444
  if (phone.length === 10) {
    return `+1${partial}`;
  }

  // If was already correct, just return the +
  return `+${partial}`;
};
