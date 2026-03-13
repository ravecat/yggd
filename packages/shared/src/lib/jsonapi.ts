import type { Error, Errors } from "../api/models";
import { errorsSchema } from "../api/zod/errorsSchema";
import { z } from "zod/v4";

export const responseErrorSchema = z.object({
  errors: errorsSchema,
});

export type ResponseErrorConfig = z.infer<typeof responseErrorSchema>;
export type ErrorMap = Partial<Record<string, string[]>>;

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

function getErrorMessage([error]: Errors): string {
  return error?.detail || error?.title || error?.code || "An error occurred";
}

function decodePointerSegment(segment: string): string {
  return segment.replace(/~1/g, "/").replace(/~0/g, "~");
}

function getErrorKey(error: Error): string {
  const pointer = error.source?.pointer;

  if (pointer) {
    const parts = pointer.split("/").filter(Boolean).map(decodePointerSegment);

    if (
      parts[0] === "data" &&
      (parts[1] === "attributes" || parts[1] === "relationships") &&
      parts[2]
    ) {
      return parts[2];
    }
  }

  if (error.source?.parameter) {
    return error.source.parameter;
  }

  return "general";
}

function getErrorText(error: Error): string {
  return error.detail || error.title || error.code || "An error occurred";
}

function traverseErrors(errors: Errors): ErrorMap {
  const result: ErrorMap = {};

  errors.forEach((error) => {
    const key = getErrorKey(error);

    result[key] ??= [];
    result[key].push(getErrorText(error));
  });

  return result;
}

export class ApiError extends Error {
  override readonly name = "ApiError";
  readonly status: number | null;
  readonly raw: Errors;
  readonly errors: ErrorMap;

  constructor({
    errors,
    status,
    cause,
  }: {
    errors: Errors;
    status?: number | null;
    cause?: unknown;
  }) {
    super(getErrorMessage(errors), { cause });

    this.status = status ?? getErrorStatus(errors);
    this.raw = errors;
    this.errors = traverseErrors(errors);
  }

  hasStatus(...statuses: number[]): boolean {
    return this.status !== null && statuses.includes(this.status);
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function toApiError(
  data: ResponseErrorConfig,
  status?: number | null,
  cause?: unknown,
): ApiError {
  return new ApiError({
    errors: data.errors,
    status,
    cause,
  });
}
