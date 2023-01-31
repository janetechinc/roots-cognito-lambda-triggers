import { mapUserAttributes } from './utils.mjs'

describe('#mapUserAttributes', () => {
  test('it excludes any blacklisted fields', () => {
    const userAttributes = {
      email: 'test@test.com',
      sub: '12345-12345',
      email_verified: false,
    }

    const userData = mapUserAttributes(userAttributes)

    expect(userData).toEqual({
      email: userAttributes.email,
      user_attributes: {},
    })
  })

  test('it excludes any custom "cognito:" fields', () => {
    const userAttributes = {
      email: 'test@test.com',
      'cognito:email_alias': 'test@test.com',
      'cognito:user_status': 'CONFIRMED',
      'custom:first_name': 'Trogdor',
    }

    const userData = mapUserAttributes(userAttributes)

    expect(userData).toEqual({
      email: userAttributes.email,
      first_name: userAttributes['custom:first_name'],
      user_attributes: {},
    })
  })

  describe('if we get jane user attributes from cognito', () => {
    test('it returns jane user attributes at the top level', () => {
      const userAttributes = {
        email: 'test@test.com',
        birthdate: '01-01-1980',
        family_name: 'Doe',
        given_name: 'Jamie',
        phone_number: '555-123-4567',
        website: 'www.jamiedoe.com',
      }

      const userData = mapUserAttributes(userAttributes)

      expect(userData).toEqual({
        email: userAttributes.email,
        birth_date: userAttributes.birthdate,
        last_name: userAttributes.family_name,
        first_name: userAttributes.given_name,
        phone: userAttributes.phone_number,
        user_attributes: {
          website: userAttributes.website,
        },
      })
    })
  })

  describe('if custom user attributes are set', () => {
    test('it returns any jane user attributes at the top level', () => {
      const userAttributes = {
        email: 'test@test.com',
        'custom:birth_date': '01-01-1980',
        'custom:last_name': 'Doe',
        'custom:first_name': 'Jamie',
        'custom:phone': '555-123-4567',
        website: 'www.jamiedoe.com',
      }

      const userData = mapUserAttributes(userAttributes)

      expect(userData).toEqual({
        email: userAttributes.email,
        birth_date: userAttributes['custom:birth_date'],
        last_name: userAttributes['custom:last_name'],
        first_name: userAttributes['custom:first_name'],
        phone: userAttributes['custom:phone'],
        user_attributes: {
          website: userAttributes.website,
        },
      })
    })

    test('any additional attributes are included in userAttributes', () => {
      const userAttributes = {
        email: 'test@test.com',
        website: 'www.jamiedoe.com',
        'custom:last_name': 'Doe',
        'custom:first_name': 'Jamie',
        'custom:home_dispensary': 'Joes Weed Shack',
      }

      const userData = mapUserAttributes(userAttributes)

      expect(userData).toEqual({
        email: userAttributes.email,
        last_name: userAttributes['custom:last_name'],
        first_name: userAttributes['custom:first_name'],
        user_attributes: {
          home_dispensary: userAttributes['custom:home_dispensary'],
          website: userAttributes.website,
        },
      })
    })
  })
})
