import apiService, { Response } from './api-service'

const COGNITO_API = '/roots/store_operations_api/v1/cognito'

/** ----- HELPERS ----- */

const buildErrorMessage = (message: string, response: Response) => {
  return `${message} ${JSON.stringify({
    status: response.statusCode,
    message: response.statusMessage,
  })}`
}

/** ----- CREATE USER ----- */

export interface UserData {
  email: string
  birth_date?: Date
  first_name?: string
  last_name?: string
  phone?: string
  user_attributes?: {
    [key: string]: any // eslint-disable-line @typescript-eslint/no-explicit-any
  }
}

interface CreateUserData extends UserData {
  pool_id: string
  external_id: string
  app_client_id: string
}

const createUser = async (
  data: CreateUserData,
  token: string
): Promise<{ success: boolean; errorMessage?: string }> => {
  const response = await apiService.post(`${COGNITO_API}/create_user`, data, token)

  return {
    success: response.statusCode === 200,
    errorMessage: response.statusMessage,
  }
}

/** ----- USER EXISTS ----- */

interface UserExistsData {
  email: string
  app_client_id: string
}

const userExists = async (data: UserExistsData, token: string): Promise<boolean> => {
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

interface UserCanResetPasswordData {
  email: string
  app_client_id: string
}

const userCanResetPassword = async (
  data: UserCanResetPasswordData,
  token: string
): Promise<{
  valid: boolean
  errorMessage: string
}> => {
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

interface VerifyCredentialsData {
  email: string
  password: string
}

const verifyCredentials = async (
  data: VerifyCredentialsData,
  token: string
): Promise<{
  valid: boolean
  errorMessage: string
}> => {
  const response = await apiService.post(
    `${COGNITO_API}/verify_credentials`,
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

/** ----- VALIDATE USER ----- */

interface ValidateUserData extends UserData {
  pool_id: string
}

const validateUser = async (
  data: ValidateUserData,
  token: string
): Promise<{
  valid: boolean
  errorMessage: string
}> => {
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

interface AppClient {
  id: number
  operator_id: number
  pool_id: string
  region: string
  app_client_id: string
  auto_confirm_email: boolean
}

const getAppClient = async (appClientId: string, token: string): Promise<AppClient | null> => {
  const response = await apiService.get(
    `${COGNITO_API}/app_clients/${appClientId}`,
    token
  )
  if (response.statusCode === 404) {
    return null
  }
  return response.body as AppClient
}



export default {
  userCanResetPassword,
  createUser,
  getAppClient,
  userExists,
  verifyCredentials,
  validateUser
}
