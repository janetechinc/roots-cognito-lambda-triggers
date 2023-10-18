import apiService from './api-service.mjs'

const COGNITO_API = '/roots/store_operations_api/v1/cognito'

/** ----- HELPERS ----- */

const buildErrorMessage = (message, response) => {
  return `${message} ${JSON.stringify({
    status: response.statusCode,
    message: response.statusMessage,
  })}`
}

/** ----- CREATE USER ----- */

const createUser = async (data, token) => {
  const response = await apiService.post(`${COGNITO_API}/create_user`, data, token)

  return {
    success: response.statusCode === 200,
    errorMessage: response.statusMessage,
  }
}

// /** ----- ENSURE EXTERNAL USER ----- */
// export interface ExternalUserData {
//   email: string,
//   external_id: string,
//   pool_id: string,
//   user_attributes?: {
//     [key: string]: any // eslint-disable-line @typescript-eslint/no-explicit-any
//   }
// }

const ensureExternalUserExists = async (data) => {
  const response = await apiService.post(`${COGNITO_API}/ensure_external_user_exists`, data)

  return {
    success: response.statusCode === 200,
    errorMessage: response.statusMessage,
  }
}

/** ----- USER EXISTS ----- */

const userExists = async (data, token) => {
  const response = await apiService.post(`${COGNITO_API}/user_exists`, data, token)

  switch (response.statusCode) {
    case 200:
      return true
    case 404:
      return false
    default:
      throw new Error(
        buildErrorMessage(`Error checking user existence`, response)
      )
  }
}

/** ----- CAN USER RESET PASSWORD ----- */

const userCanResetPassword = async (data, token) => {
  const response = await apiService.post(
    `${COGNITO_API}/user_can_reset_password`,
    data,
    token
  )

  const result = {
    valid: false,
    errorMessage: '',
  }

  switch (response.statusCode) {
    case 200:
      result.valid = true
      break
    case 404:
      result.errorMessage = response.body
        ? JSON.stringify(response.body)
        : 'Could not find account with that email'
      break
    default:
      result.errorMessage = buildErrorMessage(
        'Error verifying password reset',
        response
      )
  }

  return result
}

/** ----- VERIFY CREDENTIALS ----- */


const verifyCredentials = async (data, token) => {
  const response = await apiService.post(
    `${COGNITO_API}/verify_credentials`,
    data,
    token
  )

  const result = {
    valid: false,
    errorMessage: '',
    user: response.body?.user
  }

  switch (response.statusCode) {
    case 200:
      result.valid = true
      break
    case 401:
      result.errorMessage = 'Invalid password'
      break
    case 404:
      result.errorMessage = 'User not found'
      break
    default:
      result.errorMessage = buildErrorMessage('Error verifying user', response)
  }

  return result
}

/** ----- GET SSO USER ATTRIBUTES ----- */

const verifySSOUser = async (data, token) => {
  // user_attributes.identities is already a stringified object and
  // unfortunately if you call JSON.stringify on it, the object breaks
  // on the backend when it attempts to re-parse it.
  // The solution here is to parse identities before stringifying it.
  const parsedData = {
    ...data,
    user_attributes: {
    ...data.user_attributes,
      identities: JSON.parse(data.user_attributes.identities)
     }
 }
  const response = await apiService.post(
    `${COGNITO_API}/verify_sso_user`,
    parsedData,
    token
  )
  
  const result = {
    errorMessage: "",
    user: response.body?.user,
  }

  switch (response.statusCode) {
    case 200:
      break
    case 404:
      result.errorMessage = "User not found"
      break
    default:
      result.errorMessage = buildErrorMessage(
        "Error verifying SSO user",
        response
      )
  }

  return result
}

/** ----- VALIDATE USER ----- */


const validateUser = async (data, token) => {
  const response = await apiService.post(`${COGNITO_API}/validate_user`, data, token)

  const result = {
    valid: false,
    errorMessage: '',
  }

  switch (response.statusCode) {
    case 200:
      result.valid = true
      break
    case 400:
      result.errorMessage = JSON.stringify(response.body)
      break
    default:
      result.errorMessage = buildErrorMessage('Error validating user', response)
  }

  return result
}

/** ----- GET COGNITO APP CLIENT ----- */

const getAppClient = async (appClientId, token) => {
  const response = await apiService.get(
    `${COGNITO_API}/app_clients/${appClientId}`,
    token
  )
  if (response.statusCode === 404) {
    return null
  }
  return response.body
}



export default {
  userCanResetPassword,
  createUser,
  getAppClient,
  userExists,
  ensureExternalUserExists,
  verifyCredentials,
  verifySSOUser,
  validateUser
}
