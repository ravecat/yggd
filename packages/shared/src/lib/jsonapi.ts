import type { Error } from "../api/models/Error";
import type { Errors } from "../api/models/Errors";
import { errorsSchema } from "../api/zod/errorsSchema";
import { z } from "zod/v4";

export const responseErrorSchema = z.object({
  errors: errorsSchema,
});

export type ResponseErrorConfig = z.infer<typeof responseErrorSchema>;

export function isErrorResponse(data: unknown): data is ResponseErrorConfig {
  return responseErrorSchema.safeParse(data).success;
}

function getErrorStatus(errors: Errors): number | null {
  const rawStatus = errors[0]?.status;

  if (!rawStatus) {
    return null;
  }

  const status = Number(rawStatus);

  return Number.isInteger(status) ? status : null;
}

function getErrorMessage(errors: Errors, fallback = "Request failed"): string {
  return errors[0]?.detail || errors[0]?.title || fallback;
}

export class ApiError extends Error {
  override readonly name = "ApiError";
  readonly status: number | null;
  readonly errors: Errors;

  constructor({
    errors,
    status,
    message,
    cause,
  }: {
    errors: Errors;
    status?: number | null;
    message?: string;
    cause?: unknown;
  }) {
    super(message ?? getErrorMessage(errors), { cause });

    this.status = status ?? getErrorStatus(errors);
    this.errors = errors;
  }

  hasStatus(...statuses: number[]): boolean {
    return this.status !== null && statuses.includes(this.status);
  }

  toFieldErrors<T extends readonly string[]>(
    fields: T,
  ): Record<T[number] | "general", string[]> {
    return toFieldErrors(this.errors, fields);
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

function extractFieldName(pointer?: string): string | null {
  if (!pointer) {
    return null;
  }

  const parts = pointer.split("/").filter(Boolean);

  if (
    parts.length >= 3 &&
    (parts[1] === "attributes" || parts[1] === "relationships")
  ) {
    return parts[2];
  }

  return parts[parts.length - 1] || null;
}

function formatErrorMessage(error: Error): string {
  return error.title || error.detail || "Validation error";
}

function toFieldErrors<T extends readonly string[]>(
  errors: Errors,
  fields: T,
): Record<T[number] | "general", string[]> {
  const result: Record<string, string[]> = {};
  const fieldSet = new Set(fields);

  fields.forEach((field) => {
    result[field] = [];
  });
  result.general = [];

  errors.forEach((error) => {
    const fieldName = extractFieldName(error.source?.pointer);
    const message = formatErrorMessage(error);

    if (fieldName && fieldSet.has(fieldName)) {
      result[fieldName].push(message);
      return;
    }

    result.general.push(message);
  });

  return result as Record<T[number] | "general", string[]>;
}

export function toApiError(
  data: ResponseErrorConfig,
  status?: number | null,
  cause?: unknown,
): ApiError {
  return new ApiError({
    errors: data.errors,
    status: status ?? getErrorStatus(data.errors),
    message: getErrorMessage(
      data.errors,
      cause instanceof Error ? cause.message : "Request failed",
    ),
    cause,
  });
}
