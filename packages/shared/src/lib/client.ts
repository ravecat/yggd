import axios from "axios";
import type { AxiosRequestConfig, AxiosResponse } from "axios";
import { isErrorResponse, toApiError } from "./jsonapi";

export type RequestConfig<TData = unknown> = AxiosRequestConfig<TData>;
export type ResponseConfig<TData = unknown> = AxiosResponse<TData>;
export type { ResponseErrorConfig } from "./jsonapi";

const instance = axios.create({
  headers: {
    Accept: "application/vnd.api+json",
    "Content-Type": "application/vnd.api+json",
  } as const,
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
