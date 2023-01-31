import { request } from './http.mjs'
import { URL } from "url";

const headers = { 'Content-Type': 'application/json' }

const authenticateClient = async () => {
  const clientId = process.env.CLIENT_ID || ''
  const clientSecret = process.env.CLIENT_SECRET || ''
  const janeApiHost = process.env.JANE_API_HOST

  const resp = await request({
    method: 'post',
    url: `${janeApiHost}/oauth/token`,
    grant_type: 'client_credentials'
  }, {
    auth: {
      username: clientId,
      password: clientSecret
    }
  })

  return resp.data.access_token
}

const makeRequest = async (options) => {

  const host = process.env.API_HOST

  if (!host) {
    throw Error('No API_HOST configured')
  }

  const url = new URL(options.path, host);

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
