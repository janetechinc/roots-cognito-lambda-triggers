import fetch from 'node-fetch'
import apiService from './api-service'

const { Response } = jest.requireActual('node-fetch')

jest.mock('node-fetch', () => jest.fn())

const mockedFetch = fetch as jest.MockedFunction<typeof fetch>

describe('api service', () => {
  describe('if no API_HOST is set', () => {
    test('it throws an error', async () => {
      await expect(async () => {
        await apiService.post('/api/path', {})
      }).rejects.toEqual(new Error('No API_HOST configured'))
    })
  })

  describe('#get', () => {
    beforeEach(() => {
      process.env.API_HOST = 'test.com'
    })

    test('it calls fetch with method "get"', async () => {
      mockedFetch.mockImplementation(
        () => new Response(JSON.stringify('ok'), { ok: true, status: 200 })
      )

      await apiService.get('/api/path')

      expect(mockedFetch).toHaveBeenCalledWith('https://test.com/api/path', {
        method: 'get',
        headers: { 'Content-Type': 'application/json' },
      })
    })

    test('it returns statusCode, statusMessage, and body', async () => {
      mockedFetch.mockImplementation(
        () =>
          new Response(JSON.stringify('ok'), {
            ok: true,
            status: 200,
            statusText: 'Results',
          })
      )

      const response = await apiService.get('/api/path')

      expect(response).toEqual({
        statusCode: 200,
        body: 'ok',
        statusMessage: 'Results',
      })
    })
  })

  describe('#post', () => {
    beforeEach(() => {
      process.env.API_HOST = 'test.com'
    })

    test('it calls fetch with method "post" and body data', async () => {
      mockedFetch.mockImplementation(
        () => new Response(JSON.stringify('ok'), { ok: true, status: 200 })
      )

      const data = { foo: 'bar' }
      await apiService.post('/api/path', data)

      expect(mockedFetch).toHaveBeenCalledWith('https://test.com/api/path', {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    })

    test('it returns statusCode, statusMessage, and body', async () => {
      mockedFetch.mockImplementation(
        () =>
          new Response(JSON.stringify('ok'), {
            ok: true,
            status: 200,
            statusText: 'Results',
          })
      )

      const data = { foo: 'bar' }
      const response = await apiService.post('/api/path', data)

      expect(response).toEqual({
        statusCode: 200,
        body: 'ok',
        statusMessage: 'Results',
      })
    })
  })
})
