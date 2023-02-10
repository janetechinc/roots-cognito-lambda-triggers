import { request } from './http.mjs'
import { URL } from "url";

const headers = { 'Content-Type': 'application/json' }
const defaultHost = "https://api.iheartjane.com"

const authenticateClient = async () => {
  const clientId = process.env.JANE_CLIENT_ID || ''
  const clientSecret = process.env.JANE_CLIENT_SECRET || ''
  const apiUrl = process.env.JANE_API_URL || defaultHost

  const resp = await request({
    // Prevent exceptions when requests have status code different from 2xx
    validateStatus: false,
    method: 'post',
    url: `${apiUrl}/oauth/token`,
    data: {
      grant_type: 'client_credentials',
    },
    auth: {
      username: clientId,
      password: clientSecret
    }
  })

  return resp.data.access_token
}

const makeRequest = async (options) => {
  const apiUrl = process.env.JANE_API_URL || defaultHost

  if (!apiUrl) {
    throw Error('No JANE_API_URL configured')
  }

  const url = new URL(options.path, apiUrl);

  try {
    const response = await request({
      url: url.toString(),
      method: options.method || 'get',
      headers: {...headers, 'Authorization': `Bearer ${options.token}`},
      data: options.body
    })
    return {
      statusCode: response.status,
      body: response.data,
      statusMessage: response.statusText
    }
  } catch (e) {
    return Promise.reject(e)
  }
}

const get = async (path, token) => makeRequest({ path, token })

const post = async (path, data, token) =>
  makeRequest({
    path,
    token,
    method: 'post',
    body: JSON.stringify(data),
  })

export default { get, post, authenticateClient }
