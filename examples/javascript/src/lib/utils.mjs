const BLACKLISTED_ATTRIBUTES = ['sub', 'email_verified']
const COGNITO_JANE_MAPPING = {
  email: 'email',
  birthdate: 'birth_date',
  family_name: 'last_name',
  given_name: 'first_name',
  phone_number: 'phone',
}

export const mapUserAttributes = (userAttributes) => {
  const userData = {
    email: userAttributes.email,
    user_attributes: {},
  }

  const customKeys = Object.keys(userAttributes)
    .filter((k) => k.startsWith('custom:'))
    .map((k) => k.replace('custom:', ''))

  customKeys.forEach((k) => {
    if (Object.values(COGNITO_JANE_MAPPING).includes(k)) {
      userData[k] = userAttributes[`custom:${k}`]
    } else if (userData.user_attributes) {
      userData.user_attributes[k] = userAttributes[`custom:${k}`]
    }
  })

  const keys = Object.keys(userAttributes).filter(
    (k) =>
      !k.startsWith('custom:') &&
      !k.startsWith('cognito:') &&
      !BLACKLISTED_ATTRIBUTES.includes(k)
  )

  keys.forEach((k) => {
    const typedKey = k
    if (COGNITO_JANE_MAPPING[typedKey] !== undefined) {
      const janeKey = COGNITO_JANE_MAPPING[typedKey]
      userData[janeKey] = userAttributes[k]
    } else if (userData.user_attributes) {
      userData.user_attributes[k] = userAttributes[k]
    }
  })

  return userData
}

export const addAreaCodeToPhone = (phone) => {
  let partial = phone.startsWith("+") ? phone.substring(1) : phone

  // Missing + and country code, 2223334444
  if (phone.length === 10) {
    return `+1${partial}`
  }

  // If was already correct, just return the +
  return `+${partial}`
}
