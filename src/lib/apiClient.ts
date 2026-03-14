import { getToken } from './token'

const BASE_URL = import.meta.env.VITE_API_BASE_URL as string
const APPLICATION_ID = import.meta.env.VITE_APPLICATION_ID as string

function getHeaders(): HeadersInit {
  const token = getToken()
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    throw new Error(`HTTP error ${res.status}`)
  }
  const text = await res.text()
  return (text ? JSON.parse(text) : null) as T
}

export const apiClient = {
  get: <T>(path: string, params?: Record<string, string>): Promise<T> => {
    const url = new URL(BASE_URL + path)
    if (APPLICATION_ID) url.searchParams.set('ApplicationId', APPLICATION_ID)
    if (params) {
      Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
    }
    return fetch(url.toString(), { headers: getHeaders() }).then(handleResponse<T>)
  },

  post: <T>(path: string, body?: unknown): Promise<T> =>
    fetch(BASE_URL + path, {
      method: 'POST',
      headers: getHeaders(),
      body: body !== undefined ? JSON.stringify({ applicationId: APPLICATION_ID, ...(body as object) }) : undefined,
    }).then(handleResponse<T>),

  put: <T>(path: string, body?: unknown): Promise<T> =>
    fetch(BASE_URL + path, {
      method: 'PUT',
      headers: getHeaders(),
      body: body !== undefined ? JSON.stringify({ applicationId: APPLICATION_ID, ...(body as object) }) : undefined,
    }).then(handleResponse<T>),

  delete: <T>(path: string): Promise<T> =>
    fetch(BASE_URL + path, {
      method: 'DELETE',
      headers: getHeaders(),
    }).then(handleResponse<T>),
}
