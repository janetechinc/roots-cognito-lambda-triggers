import { UserData } from './jane-service'

type Attributes = { [key: string]: any } // eslint-disable-line @typescript-eslint/no-explicit-any

const BLACKLISTED_ATTRIBUTES = ['sub', 'email_verified']
const COGNITO_JANE_MAPPING = {
  email: 'email',
  birthdate: 'birth_date',
  family_name: 'last_name',
  given_name: 'first_name',
  phone_number: 'phone',
}

export const mapUserAttributes = (userAttributes: Attributes): UserData => {
  const userData: UserData = {
    email: userAttributes.email,
    user_attributes: {},
  }

  const customKeys: Array<string> = Object.keys(userAttributes)
    .filter((k) => k.startsWith('custom:'))
    .map((k) => k.replace('custom:', ''))

  customKeys.forEach((k) => {
    if (Object.values(COGNITO_JANE_MAPPING).includes(k)) {
      userData[k as keyof UserData] = userAttributes[`custom:${k}`]
    } else if (userData.user_attributes) {
      userData.user_attributes[k] = userAttributes[`custom:${k}`]
    }
  })

  const keys: Array<string> = Object.keys(userAttributes).filter(
    (k) =>
      !k.startsWith('custom:') &&
      !k.startsWith('cognito:') &&
      !BLACKLISTED_ATTRIBUTES.includes(k)
  )

  keys.forEach((k) => {
    const typedKey = k as keyof typeof COGNITO_JANE_MAPPING
    if (COGNITO_JANE_MAPPING[typedKey] !== undefined) {
      const janeKey = COGNITO_JANE_MAPPING[typedKey]
      userData[janeKey as keyof UserData] = userAttributes[k]
    } else if (userData.user_attributes) {
      userData.user_attributes[k] = userAttributes[k]
    }
  })

  return userData
}
