import { addAreaCodeToPhone, mapUserAttributes } from "../lib/utils.mjs"
import Jane from "../lib/jane-service.mjs"
import apiService from "../lib/api-service.mjs"
import {
  AdminUpdateUserAttributesCommand,
  CognitoIdentityProviderClient,
} from "@aws-sdk/client-cognito-identity-provider"

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

export const handler = async (event) => {
  const token = await apiService.authenticateClient();

  console.log(event);

  if (event.triggerSource !== SIGN_UP_CONFIRMATION) {
    console.log(
      `Trigger source does not match "${SIGN_UP_CONFIRMATION}", returning.`
    );
    return event;
  }
  
  event = await handleUserMigration(event, token);

  const { success, errorMessage } = await Jane.createUser({
    pool_id: event.userPoolId,
    external_id: event.userName,
    app_client_id: event.callerContext.clientId,
    ...mapUserAttributes(event.request.userAttributes),
  }, token);

  if (!success) {
    throw new Error(`User creation was not successful: ${errorMessage}`);
  } else {
    console.log('User creation successful');
  }

  return event;
};
/* Cognito SSO flows do not go through our migration handler
  instead we handle those migrations here, after signup.
  If a user is signing up via sso, we check for a Jane SSO user
  associated with this client and use that users data for the migration */
  const handleUserMigration = async (event, token) => {
    let userIdentities;
    try {
      userIdentities = JSON.parse(event.request.userAttributes.identities);
    } catch (err) {
      console.error("userIdentities unable to parse", err);
      return event;
    }

    const userGoogleIdentity = userIdentities.find(
      (i) => i.providerType === "Google"
    );
    if (!userGoogleIdentity) {
      return event;
    }

    const { errorMessage, user } = await Jane.verifySSOUser({
      email: event.request.userAttributes.email,
      user_attributes: event.request.userAttributes,
      app_client_id: event.callerContext.clientId,
    }, token);
    if (errorMessage === "User not found") {
      // Jane user for this client was not found, continue normal sign up
      return event;
    } else if (errorMessage || !user) {
      // something went wrong, continue normal sign up and log error
      console.error(`failed to retrieve data for migration: ${errorMessage}`);
      return event;
    }
    const attributes = {};
    const { first_name, last_name, phone, birth_date } = user;

    const attributesToUpdate = [];
    first_name &&
      (attributes.given_name = first_name) &&
      attributesToUpdate.push({
        Name: "given_name",
        Value: first_name,
      });
    last_name &&
      (attributes.family_name = last_name) &&
      attributesToUpdate.push({
        Name: "family_name",
        Value: last_name,
      });
    phone &&
      (attributes.phone_number = addAreaCodeToPhone(phone)) &&
      attributesToUpdate.push({
        Name: "phone_number",
        Value: addAreaCodeToPhone(phone),
      });
    birth_date &&
      (attributes.birthdate = birth_date) &&
      attributesToUpdate.push({
        Name: "birthdate",
        Value: birth_date,
      });
    const cognitoIdServiceProvider = new CognitoIdentityProviderClient({
      region: "us-east-1",
    });
    const command = new AdminUpdateUserAttributesCommand({
      UserAttributes: attributesToUpdate,
      UserPoolId: event.userPoolId,
      Username: event.userName,
    });
    await cognitoIdServiceProvider
      .send(command)
      .then((data) => console.log("Cognito user updated!", data))
      .catch((err) => {
        console.error("Cognito Attribute Update Unsuccessful", err);
      });

    event.request.userAttributes = {
      ...event.request.userAttributes,
      ...attributes,
    };
    return event;
  };
