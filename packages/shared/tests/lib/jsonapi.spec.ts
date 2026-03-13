import { describe, expect, test } from "@jest/globals";
import { ApiError, isErrorResponse } from "~/lib/jsonapi";

describe("jsonapi utilities", () => {
  test("detects json:api error documents", () => {
    expect(
      isErrorResponse({
        errors: [{ detail: "Board not found", status: "404" }],
      }),
    ).toBe(true);

    expect(
      isErrorResponse({
        data: { id: "board-1" },
      }),
    ).toBe(false);
  });

  test("ApiError derives the first error status", () => {
    expect(
      new ApiError({
        errors: [
          { detail: "Board not found", status: "404" },
          { detail: "Ignored", status: "422" },
        ],
      }).status,
    ).toBe(404);
  });

  test("ApiError derives the first error message", () => {
    expect(
      new ApiError({
        errors: [
          { detail: "Board not found", status: "404" },
          { title: "Ignored" },
        ],
      }).message,
    ).toBe("Board not found");
  });

  test("ApiError traverses json:api errors into a field map", () => {
    const error = new ApiError({
      errors: [
        {
          detail: "First name must contain at least two characters.",
          source: { pointer: "/data/attributes/firstName" },
        },
        {
          detail: "Missing punctuation character.",
          source: { pointer: "/data/attributes/password" },
        },
        {
          title: "Password confirmation does not match.",
          source: { pointer: "/data/attributes/password" },
        },
        {
          detail: "Board query parameter is invalid.",
          source: { parameter: "boardId" },
        },
        {
          code: "unknown_error",
        },
      ],
    });

    expect(error.raw).toEqual([
      {
        detail: "First name must contain at least two characters.",
        source: { pointer: "/data/attributes/firstName" },
      },
      {
        detail: "Missing punctuation character.",
        source: { pointer: "/data/attributes/password" },
      },
      {
        title: "Password confirmation does not match.",
        source: { pointer: "/data/attributes/password" },
      },
      {
        detail: "Board query parameter is invalid.",
        source: { parameter: "boardId" },
      },
      {
        code: "unknown_error",
      },
    ]);
    expect(error.errors).toEqual({
      firstName: ["First name must contain at least two characters."],
      password: [
        "Missing punctuation character.",
        "Password confirmation does not match.",
      ],
      boardId: ["Board query parameter is invalid."],
      general: ["unknown_error"],
    });
  });
});
