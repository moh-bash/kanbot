import axios, { isAxiosError, type AxiosRequestConfig } from 'axios'
import type { ApiErrorBody, ErrorCode } from '../types/api'

type UnauthorizedHandler = () => void

let unauthorizedHandler: UnauthorizedHandler | undefined

export class ApiError extends Error {
  readonly status: number
  readonly code: ErrorCode | 'NETWORK_ERROR'
  readonly details: ApiErrorBody['error']['details']

  constructor(
    status: number,
    code: ErrorCode | 'NETWORK_ERROR',
    message: string,
    details: ApiErrorBody['error']['details'] = [],
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }
}

export function setUnauthorizedHandler(handler: UnauthorizedHandler | undefined) {
  unauthorizedHandler = handler
}

export function fieldErrors(error: ApiError) {
  return Object.fromEntries((error.details ?? []).map(({ path, message }) => [path, message]))
}

export async function request<T>(
  method: NonNullable<AxiosRequestConfig['method']>,
  path: string,
  body?: unknown,
): Promise<T | undefined> {
  const token = localStorage.getItem('kanbot_token')
  const headers: Record<string, string> = { Accept: 'application/json' }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  try {
    const response = await axios.request<T>({
      baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api',
      method,
      url: path,
      headers: body === undefined ? headers : { ...headers, 'Content-Type': 'application/json' },
      data: body,
    })

    return response.status === 204 ? undefined : response.data
  } catch (error) {
    if (!isAxiosError<ApiErrorBody>(error) || !error.response) {
      throw new ApiError(0, 'NETWORK_ERROR', 'Cannot reach the server. Is it running?')
    }

    const apiErrorBody = error.response.data?.error
    const apiError = new ApiError(
      error.response.status,
      apiErrorBody?.code ?? 'INTERNAL_ERROR',
      apiErrorBody?.message ?? 'Something went wrong.',
      apiErrorBody?.details ?? [],
    )

    if (error.response.status === 401 && path !== '/auth/login') {
      unauthorizedHandler?.()
    }

    throw apiError
  }
}
