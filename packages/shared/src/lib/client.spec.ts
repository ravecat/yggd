import axios from "axios";
import { afterEach, describe, expect, jest, test } from "@jest/globals";
import { isApiError } from "./jsonapi.js";

describe("client transport", () => {
  afterEach(() => {
    jest.resetModules();
    jest.restoreAllMocks();
  });

  test("converts json:api error documents into ApiError", async () => {
    const request = jest.fn().mockRejectedValue({
      isAxiosError: true,
      response: {
        status: 422,
        data: {
          errors: [
            {
              status: "422",
              source: { pointer: "/data/attributes/title" },
              detail: "is required",
            },
          ],
        },
      },
    });
    jest.spyOn(axios, "create").mockReturnValue({ request } as never);

    const { default: client } = await import("./client.js");

    try {
      await client({
        method: "POST",
        url: "/todos",
        data: {
          data: {
            type: "todo",
          },
        },
      });
    } catch (error) {
      expect(isApiError(error)).toBe(true);

      if (!isApiError(error)) {
        throw error;
      }

      expect(error.status).toBe(422);
      expect(error.message).toBe("is required");
      expect(error.raw).toEqual([
        {
          status: "422",
          source: { pointer: "/data/attributes/title" },
          detail: "is required",
        },
      ]);
      expect(error.errors).toEqual({
        title: ["is required"],
      });

      return;
    }

    throw new Error("Expected client to throw");
  });
});
