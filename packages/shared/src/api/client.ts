import axios, { AxiosError } from 'axios'
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

export class ValidationError extends Error {
  public readonly errors: JsonApiError[]
  public readonly status: number

  constructor(errors: JsonApiError[], status: number) {
    super('Validation failed')
    this.name = 'ValidationError'
    this.errors = errors
    this.status = status
  }

  /**
   * Extracts field name from JSON Pointer path following JSON:API specification
   * @param pointer - JSON Pointer path (e.g., '/data/attributes/title')
   * @returns Extracted field name or null
   * @example
   * extractFieldName('/data/attributes/title') // 'title'
   * extractFieldName('/data/relationships/author') // 'author'
   * extractFieldName('/data/attributes/author_id') // 'author_id'
   */
  private extractFieldName(pointer?: string): string | null {
    if (!pointer) return null

    const parts = pointer.split('/').filter(Boolean)

    // JSON:API structure: /data/attributes/fieldName or /data/relationships/fieldName
    if (parts.length >= 3 && (parts[1] === 'attributes' || parts[1] === 'relationships')) {
      return parts[2]
    }

    // Fallback: return last segment
    return parts[parts.length - 1] || null
  }

  /**
   * Formats error message from JSON:API error object
   * @param err - JSON:API error object
   * @returns Formatted error message
   */
  private formatErrorMessage(err: JsonApiError): string {
    return err.title || err.detail || 'Validation error'
  }

  /**
   * Traverse errors and group by specified fields
   * Automatically collects unmatched errors in 'general' field
   * 
   * @param fields - Array of field names to extract
   * @returns Object with errors grouped by field names + 'general' for unmatched errors
   * 
   * @example
   * error.traverseErrors(['title', 'content'])
   * // Returns: { title: string[], content: string[], general: string[] }
   * 
   * @example
   * error.traverseErrors(['email', 'password', 'username'])
   * // Returns: { email: string[], password: string[], username: string[], general: string[] }
   */
  traverseErrors<T extends readonly string[]>(
    fields: T
  ): Record<T[number] | 'general', string[]> {
    const result: Record<string, string[]> = {}
    const fieldSet = new Set(fields)

    // Initialize all requested fields with empty arrays
    fields.forEach(field => {
      result[field] = []
    })
    result.general = []

    // Group errors by extracted field name
    this.errors.forEach(err => {
      const fieldName = this.extractFieldName(err.source?.pointer)
      const message = this.formatErrorMessage(err)

      if (fieldName && fieldSet.has(fieldName)) {
        result[fieldName].push(message)
      } else {
        result.general.push(message)
      }
    })

    return result as Record<T[number] | 'general', string[]>
  }
}

export const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || process.env.NEXTJS_API_URL || 'http://localhost:4000/api',
  headers: {
    'Accept': 'application/vnd.api+json',
    'Content-Type': 'application/vnd.api+json',
  },
})

axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ errors?: JsonApiError[] }>) => {
    if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
      const { errors } = error.response.data
      const status = error.response.status

      if (status === 400 || status === 422) {
        throw new ValidationError(errors, status)
      }

      error.message = errors[0]?.detail || errors[0]?.title || error.message
    }

    return Promise.reject(error)
  }
)

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const client = async <TData, TError = unknown, TVariables = unknown>(
  config: RequestConfig<TVariables>
): Promise<ResponseConfig<TData>> => {
  return axiosInstance.request<TVariables, ResponseConfig<TData>>({ ...config })
}

export default client
