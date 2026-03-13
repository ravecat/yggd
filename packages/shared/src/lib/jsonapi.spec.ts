import { describe, expect, test } from "@jest/globals";
import { ApiError, isErrorResponse } from "./jsonapi.js";

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

  test("groups field errors without a custom error class", () => {
    const error = new ApiError({
      errors: [
        {
          detail: "is required",
          source: { pointer: "/data/attributes/title" },
        },
        {
          detail: "is invalid",
          source: { pointer: "/data/attributes/status" },
        },
        {
          detail: "Something went wrong",
        },
      ],
    });

    expect(
      error.toFieldErrors(["title", "status", "content"] as const),
    ).toEqual({
      title: ["is required"],
      status: ["is invalid"],
      content: [],
      general: ["Something went wrong"],
    });
  });
});
