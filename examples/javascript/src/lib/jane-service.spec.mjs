import Jane from './jane-service.mjs'
import apiService from './api-service.mjs'
import { jest } from '@jest/globals'

describe('jane service', () => {
  describe('#createUser', () => {
    test('returns successful with no error message when the status code is 200', async () => {
      jest.spyOn(apiService, 'post').mockImplementationOnce(() => {
        return new Promise((resolve) => resolve({ statusCode: 200 }))
      })

      const result = await Jane.createUser({
        email: 'test@test.com',
        pool_id: 'us-east-1_abc',
        app_client_id: 'test-client-id',
        external_id: '123',
      })

      expect(result).toEqual({
        success: true,
        errorMessage: undefined,
      })
    })

    test('returns unsuccessful with an error message when the status code is not 200', async () => {
      jest.spyOn(apiService, 'post').mockImplementationOnce(() => {
        return new Promise((resolve) =>
          resolve({
            statusCode: 400,
            statusMessage: 'Bad request',
          })
        )
      })

      const result = await Jane.createUser({
        email: 'test@test.com',
        pool_id: 'us-east-1_abc',
        external_id: '123',
        app_client_id: 'test-client-id',
      })

      expect(result).toEqual({
        success: false,
        errorMessage: 'Bad request',
      })
    })
  })

  describe('#userExists', () => {
    test('returns true when the status code is 200', async () => {
      jest.spyOn(apiService, 'post').mockImplementationOnce(() => {
        return new Promise((resolve) => resolve({ statusCode: 200 }))
      })

      const result = await Jane.userExists({
        email: 'test@test.com',
        app_client_id: '123',
      })

      expect(result).toBe(true)
    })

    test('returns false when the status code is 404', async () => {
      jest.spyOn(apiService, 'post').mockImplementationOnce(() => {
        return new Promise((resolve) => resolve({ statusCode: 404 }))
      })

      const result = await Jane.userExists({
        email: 'test@test.com',
        app_client_id: '123',
      })

      expect(result).toBe(false)
    })

    test('throws an error when the status code is not 200 or 404', async () => {
      jest.spyOn(apiService, 'post').mockImplementationOnce(() => {
        return new Promise((resolve) => resolve({ statusCode: 204 }))
      })

      await expect(async () => {
        await Jane.userExists({
          email: 'test@test.com',
          app_client_id: '123',
        })
      }).rejects.toThrowError('Error checking user existence {"status":204}')
    })
  })

  describe('#userCanResetPassword', () => {
    test('returns valid when the status code is 200', async () => {
      jest.spyOn(apiService, 'post').mockImplementationOnce(() => {
        return new Promise((resolve) => resolve({ statusCode: 200 }))
      })

      const { valid } = await Jane.userCanResetPassword({
        email: 'test@test.com',
        app_client_id: '123',
      })

      expect(valid).toBe(true)
    })

    test('returns invalid with an error message when the status code is 404', async () => {
      const body = {
        errors: 'Please sign in with your Google account',
      }

      jest.spyOn(apiService, 'post').mockImplementationOnce(() => {
        return new Promise((resolve) => resolve({ statusCode: 404, body }))
      })

      let response = await Jane.userCanResetPassword({
        email: 'test@test.com',
        app_client_id: '123',
      })

      expect(response.valid).toBe(false)
      expect(response.errorMessage).toBe(JSON.stringify(body))

      jest.spyOn(apiService, 'post').mockImplementationOnce(() => {
        return new Promise((resolve) => resolve({ statusCode: 404 }))
      })

      response = await Jane.userCanResetPassword({
        email: 'test@test.com',
        app_client_id: '123',
      })

      expect(response.valid).toBe(false)
      expect(response.errorMessage).toBe(
        'Could not find account with that email'
      )
    })

    test('returns invalid with an error message when the status is anything other than 200 or 404', async () => {
      jest.spyOn(apiService, 'post').mockImplementationOnce(() => {
        return new Promise((resolve) =>
          resolve({
            statusCode: 500,
            statusMessage: 'Something went wrong',
          })
        )
      })

      const { valid, errorMessage } = await Jane.userCanResetPassword({
        email: 'test@test.com',
        app_client_id: '123',
      })

      expect(valid).toBe(false)
      expect(errorMessage).toBe(
        'Error verifying password reset {"status":500,"message":"Something went wrong"}'
      )
    })
  })

  describe('#verifyCredentials', () => {
    test('returns valid when the status code is 200', async () => {
      jest.spyOn(apiService, 'post').mockImplementationOnce(() => {
        return new Promise((resolve) =>
          resolve({
            statusCode: 200,
            body: {
              user: {
               
                email: "omar@email.com",
                nickname: "omar816",
                phone: "1112224444",
                first_name: "Omar",
                last_name: "Scher",
                name: "Omar Scher",
                birth_date: "",
                created_at: "2022-06-28T16:28:21.412Z",
              },
            },
          })
        );
      })

      const { valid, user } = await Jane.verifyCredentials({
        email: 'test@test.com',
        password: 'password',
      })

      expect(valid).toBe(true)
      expect(user).toBeDefined()
    })

    test('returns invalid with an error message when the status code is 401', async () => {
      jest.spyOn(apiService, 'post').mockImplementationOnce(() => {
        return new Promise((resolve) => resolve({ statusCode: 401 }))
      })

      const { valid, errorMessage, user } = await Jane.verifyCredentials({
        email: 'test@test.com',
        password: 'password',
      })

      expect(valid).toBe(false)
      expect(errorMessage).toBe('Invalid password')
      expect(user).not.toBeDefined();
    })

    test('returns invalid with an error message when the status code not 200, 401 or 404', async () => {
      jest.spyOn(apiService, 'post').mockImplementationOnce(() => {
        return new Promise((resolve) =>
          resolve({
            statusCode: 500,
            statusMessage: 'Something went wrong',
          })
        )
      })

      const { valid, errorMessage, user } = await Jane.verifyCredentials({
        email: 'test@test.com',
        password: 'password',
      })

      expect(valid).toBe(false)
      expect(errorMessage).toBe(
        'Error verifying user {"status":500,"message":"Something went wrong"}'
      )
      expect(user).not.toBeDefined();
    })
  })

  describe('#validateUser', () => {
    test('returns valid when the status code is 200', async () => {
      jest.spyOn(apiService, 'post').mockImplementationOnce(() => {
        return new Promise((resolve) => resolve({ statusCode: 200 }))
      })

      const { valid } = await Jane.validateUser({
        email: 'test@test.com',
        birth_date: new Date('1980-05-10'),
        first_name: 'Jane',
        last_name: 'Doe',
        pool_id: '',
      })

      expect(valid).toBe(true)
    })

    test('returns invalid with an error message when the status code is 400', async () => {
      const body = {
        errors: {
          phone: ['is an invalid number'],
        },
      }
      jest.spyOn(apiService, 'post').mockImplementationOnce(() => {
        return new Promise((resolve) =>
          resolve({
            statusCode: 400,
            body,
          })
        )
      })

      const { valid, errorMessage } = await Jane.validateUser({
        email: 'test@test.com',
        phone: 'notreal',
        pool_id: '',
      })

      expect(valid).toBe(false)
      expect(errorMessage).toEqual(JSON.stringify(body))
    })
  })

  describe('#ensureExternalUserExists', () => {
    test('returns valid when the status code is 200', async () => {
      jest.spyOn(apiService, 'post').mockImplementationOnce(() => {
        return new Promise((resolve) => resolve({ statusCode: 200 }))
      })

      const { success } = await Jane.ensureExternalUserExists({
        email: 'test@test.com',
        external_id: 'test-external-user-id',
        pool_id: 'test-pool-id',
        user_attributes: {
          test_attribute: 'test-value'
        }
      })

      expect(success).toBe(true)
    })

    test('returns invalid with an error message when the status code is 4xx', async () => {
      jest.spyOn(apiService, 'post').mockImplementationOnce(() => {
        return new Promise((resolve) =>
          resolve({
            statusCode: 404,
            statusMessage: 'Not Found'
          })
        )
      })

      const { success, errorMessage } = await Jane.ensureExternalUserExists({
        email: 'test@test.com',
        external_id: 'test-external-user-id',
        pool_id: 'test-pool-id',
        user_attributes: {
          test_attribute: 'test-value'
        }
      })

      expect(success).toBe(false)
      expect(errorMessage).toEqual('Not Found')
    })
  })

  describe('#getAppClient', () => {
    const exampleAppClient = {
      id: 12,
      operator_id: 5,
      pool_id: 'abc_def-123',
      region: 'us-east-1',
      app_client_id: '123456',
      auto_confirm_email: false,
    }

    test('returns an app client if one is found', async () => {
      jest.spyOn(apiService, 'get').mockImplementationOnce(() => {
        return new Promise((resolve) =>
          resolve({ statusCode: 200, body: exampleAppClient })
        )
      })

      const appClient = await Jane.getAppClient(exampleAppClient.app_client_id)

      expect(appClient).toEqual(exampleAppClient)
    })

    test('returns null if no app client is found', async () => {
      jest.spyOn(apiService, 'get').mockImplementationOnce(() => {
        return new Promise((resolve) => resolve({ statusCode: 404 }))
      })

      const appClient = await Jane.getAppClient('does-not-exist-123')

      expect(appClient).toBeNull()
    })
  })
})
