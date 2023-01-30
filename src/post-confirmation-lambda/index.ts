import { mapUserAttributes } from '../lib/utils';
import Jane from '../lib/jane-service';
import { PostConfirmationTriggerHandler } from 'aws-lambda';
import apiService from '../lib/api-service';

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

export const handler: PostConfirmationTriggerHandler = async (event) => {
  const token = await apiService.authenticateClient();

  console.log(event);

  if (event.triggerSource !== SIGN_UP_CONFIRMATION) {
    console.log(
      `Trigger source does not match "${SIGN_UP_CONFIRMATION}", returning.`
    );
    return event;
  }

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
