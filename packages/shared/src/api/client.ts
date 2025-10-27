import axios from 'axios'
import type { AxiosRequestConfig, AxiosResponse } from 'axios'

export type RequestConfig<TData = unknown> = {
  url?: string
  method: 'GET' | 'PUT' | 'PATCH' | 'POST' | 'DELETE'
  params?: unknown
  data?: TData
  responseType?: 'arraybuffer' | 'blob' | 'document' | 'json' | 'text' | 'stream'
  signal?: AbortSignal
  headers?: AxiosRequestConfig['headers']
}

export type ResponseConfig<TData = unknown> = {
  data: TData
  status: number
  statusText: string
  headers?: AxiosResponse['headers']
}

export type JsonApiError = {
  status?: string
  code?: string
  title?: string
  detail?: string
  source?: {
    pointer?: string
    parameter?: string
  }
  meta?: Record<string, unknown>
}

export type ResponseErrorConfig<TError = unknown> = {
  data: TError
  status: number
  statusText: string
}

export const axiosInstance = axios.create({
  baseURL: process.env.PUBLIC_API_URL,
  headers: {
    'Accept': 'application/vnd.api+json',
    'Content-Type': 'application/vnd.api+json',
  },
})

const client = async <TData, TError = unknown, TVariables = unknown>(
  config: RequestConfig<TVariables>
): Promise<ResponseConfig<TData>> => {
  return axiosInstance.request<TVariables, ResponseConfig<TData>>({ ...config })
}

export default client
