import axios from "axios";
import type { AxiosRequestConfig, AxiosResponse } from "axios";
import { isErrorResponse, toApiError } from "./jsonapi";

export type RequestConfig<TData = unknown> = AxiosRequestConfig<TData>;
export type ResponseConfig<TData = unknown> = AxiosResponse<TData>;
export type { ResponseErrorConfig } from "./jsonapi";

function appendSearchParam(
  searchParams: URLSearchParams,
  path: string[],
  value: unknown,
) {
  if (value === undefined || value === null) {
    return;
  }

  const key = path.reduce((result, segment, index) => {
    if (index === 0) {
      return segment;
    }

    return `${result}[${segment}]`;
  }, "");

  if (Array.isArray(value)) {
    if (!value.length) {
      return;
    }

    if (path.length === 1) {
      searchParams.append(key, value.join(","));
      return;
    }

    for (const item of value) {
      appendSearchParam(searchParams, [...path, ""], item);
    }

    return;
  }

  if (value instanceof Date) {
    searchParams.append(key, value.toISOString());
    return;
  }

  if (typeof value === "object") {
    for (const [nestedKey, nestedValue] of Object.entries(value)) {
      appendSearchParam(searchParams, [...path, nestedKey], nestedValue);
    }

    return;
  }

  searchParams.append(key, String(value));
}

export function serializeParams(params: Record<string, unknown>) {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    appendSearchParam(searchParams, [key], value);
  }

  return searchParams.toString();
}

const instance = axios.create({
  headers: {
    Accept: "application/vnd.api+json",
    "Content-Type": "application/vnd.api+json",
  } as const,
  paramsSerializer: {
    serialize: serializeParams,
  },
});

const client = async <TData, TError = unknown, TVariables = unknown>(
  config: RequestConfig<TVariables>,
): Promise<ResponseConfig<TData>> => {
  try {
    return await instance.request<TData, ResponseConfig<TData>, TVariables>({
      ...config,
    });
  } catch (error) {
    if (axios.isAxiosError<TError>(error)) {
      const response = error.response as ResponseConfig<TError> | undefined;
      const data = response?.data;

      if (isErrorResponse(data)) {
        throw toApiError(data, response?.status, error);
      }
    }

    throw error;
  }
};

export type Client = typeof client;

export default client;
