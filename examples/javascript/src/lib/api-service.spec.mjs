import { jest } from '@jest/globals'

const requestMock = jest.fn()

jest.unstable_mockModule('./http.mjs', () => {
  return { request: requestMock }
})

const { request } = await import('./http.mjs')
const { default: apiService } = await import('./api-service.mjs')

describe('api service', () => {
  beforeEach(() => {
    requestMock.mockImplementation(
      () => Promise.resolve({ status: 200, statusText: 'OK', data: JSON.stringify('ok') })
    )
  })

  describe('#get', () => {
    beforeEach(() => {
      process.env.JANE_API_URL = 'https://test.localhost'
    })

    test('it calls fetch with method "get"', async () => {
      const token = 'someToken'

      await apiService.get('/api/path', token)

      expect(requestMock).toHaveBeenCalledWith(
        expect.objectContaining({
          url: 'https://test.localhost/api/path',
          method: 'get',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        })
      )
    })

    test('it returns statusCode, statusMessage, and body', async () => {
      const token = 'someToken'

      const response = await apiService.get('/api/path', token)

      expect(response).toEqual({
        statusCode: 200,
        body: JSON.stringify('ok'),
        statusMessage: 'OK',
      })
    })
  })

  describe('#post', () => {
    beforeEach(() => {
      process.env.JANE_API_URL = 'https://test.localhost'
    })

    test('it calls fetch with method "post" and body data', async () => {
      const token = 'someToken'
      const data = { foo: 'bar' }

      await apiService.post('/api/path', data, token)

      expect(requestMock).toHaveBeenCalledWith(
        expect.objectContaining({
          url: 'https://test.localhost/api/path',
          method: 'post',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          data: JSON.stringify(data),
        })
      )
    })

    test('it returns statusCode, statusMessage, and body', async () => {
      const token = 'someToken'
      const data = { foo: 'bar' }

      const response = await apiService.post('/api/path', data)

      expect(requestMock).toHaveBeenCalledWith(
        expect.objectContaining({
          url: 'https://test.localhost/api/path',
          method: 'post',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          data: JSON.stringify(data),
        })
      )
    })
  })
})
