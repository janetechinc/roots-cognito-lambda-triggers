import axios from 'axios'
const headers = { 'Content-Type': 'application/json' }

interface RequestOptions {
  path: string
  method?: string
  body?: string
  headers?: {
    [key: string]: string
  }
  token: string
}

export interface Response {
  statusCode: number
  statusMessage?: string
  body?: unknown
}

const authenticateClient = async () => {
  const clientId = process.env.CLIENT_ID || ''
  const clientSecret = process.env.CLIENT_SECRET || ''
  const janeApiHost = process.env.JANE_API_HOST

  const resp = await axios.post(`${janeApiHost}/oauth/token`, {
    grant_type: 'client_credentials'
  }, {
    auth: {
      username: clientId,
      password: clientSecret
    }
  })

  return resp.data.access_token
}

const makeRequest = async (options: RequestOptions): Promise<Response> => {

  const host = process.env.API_HOST

  if (!host) {
    throw Error('No API_HOST configured')
  }

  try {
    const response = await axios({
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

const get = async (path: string, token: string): Promise<Response> => makeRequest({ path, token })

const post = async (path: string, data: unknown, token: string): Promise<Response> =>
  makeRequest({
    path,
    token,
    method: 'post',
    body: JSON.stringify(data),
  })

export default { get, post, authenticateClient }
