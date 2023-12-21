import { mapUserAttributes } from '../lib/utils.mjs'
import Jane from '../lib/jane-service.mjs'
import apiService from '../lib/api-service.mjs'

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
const ADMIN_CREATE_USER = 'PreSignUp_AdminCreateUser'

export const handler = async (event) => {
  const token = await apiService.authenticateClient()
  const userData = mapUserAttributes(event.request.userAttributes)

  console.log(event)

  if (event.triggerSource === ADMIN_CREATE_USER) {
    const { success, errorMessage } = await Jane.ensureExternalUserExists({
      pool_id: event.userPoolId,
      external_id: event.userName,
      email: userData.email,
      user_attributes: userData.user_attributes,
    }, token)

    if (!success) {
      throw new Error(`ensureExternalUserExists was not successful: ${errorMessage}`)
    } else {
      console.log('ensureExternalUserExists successful')
    }

    return event
  }

  const email = event.request.userAttributes.email
  const appClientId = event.callerContext.clientId

  const appClientPromise = Jane.getAppClient(appClientId, token)
  const userExistsPromise = Jane.userExists({
    email,
    app_client_id: appClientId,
  }, token)
  const validUserPromise = Jane.validateUser({
    pool_id: event.userPoolId,
    ...mapUserAttributes(event.request.userAttributes),
  }, token)

  return Promise.all([
    appClientPromise,
    userExistsPromise,
    validUserPromise,
  ]).then(([appClient, userExists, validUserResponse]) => {
    if (!appClient) {
      throw Error(`App Client ID ${appClientId} was not found`)
    }

    if (userExists) {
      // Caveat, flow is "wrong" because SSO is sinup/sign in is the same thing, so it calls signup when
      // we actually want is signin

      // Eg:
      // Here we should check event.triggerSource === 'PreSignUp_ExternalProvider'
      //  User should be confirmed (just like a migration)
      //  No message to user since it already had an account before (just like a migration)
      //  And move flow along to Post-Confirmation, where it can finish the migration
      if (event.triggerSource === 'PreSignUp_ExternalProvider') {
        event.response.autoConfirmUser = true
        event.response.autoVerifyEmail = true

        return event
      }
      throw Error('User already exists, please log in')
    }

    if (!validUserResponse.valid) {
      throw Error(validUserResponse.errorMessage)
    }

    if (appClient.auto_confirm_email) {
      event.response.autoConfirmUser = true
      event.response.autoVerifyEmail = true
    }

    return event
  })
}
