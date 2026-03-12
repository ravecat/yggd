import { describe, test, expect } from "@jest/globals";
import { getTodosQueryParamsSchema } from "../api/zod/getTodosSchema.js";
import { z } from "zod/v4";
import {
  mergeQueryHref,
  parseQueryString,
  toQueryString,
  toQueryHref,
} from "./query.js";

const queryStructureSchema = z.record(z.string(), z.any());

function deserializeQueryParams(
  params: Record<string, string | string[] | undefined>,
): Record<string, unknown> {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      value.forEach((item) => searchParams.append(key, item));
      continue;
    }
    searchParams.append(key, value);
  }

  return parseQueryString(searchParams.toString(), queryStructureSchema);
}

function serializeQueryParams<TQueryParams extends Record<string, unknown>>(
  params: Partial<TQueryParams>,
): [string, string][] {
  return Array.from(new URLSearchParams(toQueryString(params)).entries());
}

describe("Query utilities", () => {
  describe("deserializeQueryParams", () => {
    test("handles simple keys", () => {
      const result = deserializeQueryParams({ sort: "title" });

      expect(result).toEqual({ sort: "title" });
    });

    test("handles nested keys with bracket notation", () => {
      const result = deserializeQueryParams({
        "page[limit]": "10",
        "page[offset]": "20",
      });

      expect(result).toEqual({
        page: { limit: "10", offset: "20" },
      });
    });

    test("handles deep nesting", () => {
      const result = deserializeQueryParams({
        "filter[title][contains]": "test",
        "filter[author][eq]": "john",
      });

      expect(result).toEqual({
        filter: {
          title: { contains: "test" },
          author: { eq: "john" },
        },
      });
    });

    test("keeps numeric strings as strings", () => {
      const result = deserializeQueryParams({
        "page[limit]": "10",
        count: "42",
      });

      expect(result).toEqual({
        page: { limit: "10" },
        count: "42",
      });
    });

    test("keeps boolean strings as strings", () => {
      const result = deserializeQueryParams({
        active: "true",
        deleted: "false",
      });

      expect(result).toEqual({
        active: "true",
        deleted: "false",
      });
    });

    test("handles arrays with bracket notation", () => {
      const result = deserializeQueryParams({
        "tags[]": ["javascript", "typescript"],
      });

      expect(result).toEqual({
        tags: ["javascript", "typescript"],
      });
    });

    test("keeps array values as strings", () => {
      const result = deserializeQueryParams({
        "ids[]": ["1", "2", "3"],
        "flags[]": ["true", "false"],
      });

      expect(result).toEqual({
        ids: ["1", "2", "3"],
        flags: ["true", "false"],
      });
    });

    test("skips undefined values", () => {
      const result = deserializeQueryParams({
        sort: "title",
        filter: undefined,
      });

      expect(result).toEqual({ sort: "title" });
      expect(result).not.toHaveProperty("filter");
    });

    test("handles mixed simple and nested keys", () => {
      const result = deserializeQueryParams({
        sort: "-created_at",
        "page[limit]": "10",
        "page[offset]": "0",
      });

      expect(result).toEqual({
        sort: "-created_at",
        page: { limit: "10", offset: "0" },
      });
    });

    test("handles empty strings", () => {
      const result = deserializeQueryParams({
        search: "",
      });

      expect(result).toEqual({ search: "" });
    });

    test("preserves whitespace in strings", () => {
      const result = deserializeQueryParams({
        count: "  42  ",
      });

      expect(result).toEqual({ count: "  42  " });
    });
  });

  describe("serializeQueryParams", () => {
    test("handles simple keys", () => {
      const result = serializeQueryParams({ sort: "title" });

      expect(result).toEqual([["sort", "title"]]);
    });

    test("handles nested objects with bracket notation", () => {
      const result = serializeQueryParams({
        page: { limit: 10, offset: 20 },
      });

      expect(result).toEqual([
        ["page[limit]", "10"],
        ["page[offset]", "20"],
      ]);
    });

    test("handles deep nesting", () => {
      const result = serializeQueryParams({
        filter: {
          title: { contains: "test" },
          author: { eq: "john" },
        },
      });

      expect(result).toEqual([
        ["filter[title][contains]", "test"],
        ["filter[author][eq]", "john"],
      ]);
    });

    test("converts numbers to strings", () => {
      const result = serializeQueryParams({
        page: { limit: 10 },
        count: 42,
      });

      expect(result).toEqual([
        ["page[limit]", "10"],
        ["count", "42"],
      ]);
    });

    test("converts booleans to strings", () => {
      const result = serializeQueryParams({
        active: true,
        deleted: false,
      });

      expect(result).toEqual([
        ["active", "true"],
        ["deleted", "false"],
      ]);
    });

    test("handles arrays with bracket notation", () => {
      const result = serializeQueryParams({
        tags: ["javascript", "typescript"],
      });

      expect(result).toEqual([
        ["tags[0]", "javascript"],
        ["tags[1]", "typescript"],
      ]);
    });

    test("skips null values", () => {
      const result = serializeQueryParams({
        sort: "title",
        filter: null,
      });

      expect(result).toEqual([["sort", "title"]]);
    });

    test("skips undefined values", () => {
      const result = serializeQueryParams({
        sort: "title",
        filter: undefined,
      });

      expect(result).toEqual([["sort", "title"]]);
    });

    test("skips null values in arrays", () => {
      const result = serializeQueryParams({
        tags: ["js", null, "ts", undefined],
      });

      expect(result).toEqual([
        ["tags[0]", "js"],
        ["tags[2]", "ts"],
      ]);
    });

    test("handles mixed simple and nested keys", () => {
      const result = serializeQueryParams({
        sort: "-created_at",
        page: { limit: 10, offset: 0 },
      });

      expect(result).toEqual([
        ["sort", "-created_at"],
        ["page[limit]", "10"],
        ["page[offset]", "0"],
      ]);
    });

    test("handles empty strings", () => {
      const result = serializeQueryParams({
        search: "",
      });

      expect(result).toEqual([["search", ""]]);
    });
  });

  describe("roundtrip serialization", () => {
    test("deserialize -> serialize produces equivalent result", () => {
      const original = {
        sort: "-created_at",
        "page[limit]": "10",
        "page[offset]": "0",
        "filter[title][contains]": "test",
        "tags[]": ["js", "ts"],
      };

      const deserialized = deserializeQueryParams(original);
      const serialized = serializeQueryParams(deserialized);

      expect(deserialized).toEqual({
        sort: "-created_at",
        page: { limit: "10", offset: "0" },
        filter: { title: { contains: "test" } },
        tags: ["js", "ts"],
      });

      expect(serialized).toEqual([
        ["sort", "-created_at"],
        ["page[limit]", "10"],
        ["page[offset]", "0"],
        ["filter[title][contains]", "test"],
        ["tags[0]", "js"],
        ["tags[1]", "ts"],
      ]);
    });

    test("supports complex filter arrays for and/or conditions", () => {
      const query = {
        filter: {
          and: [
            { user_id: { eq: "user-1" } },
            {
              or: [
                { title: { contains: "report" } },
                { content: { contains: "report" } },
              ],
            },
          ],
        },
      };

      const serialized = serializeQueryParams(query);
      const deserialized = deserializeQueryParams(
        Object.fromEntries(serialized),
      );

      expect(deserialized).toEqual({
        filter: {
          and: [
            { user_id: { eq: "user-1" } },
            {
              or: [
                { title: { contains: "report" } },
                { content: { contains: "report" } },
              ],
            },
          ],
        },
      });
    });
  });
});

describe("string query helpers", () => {
  test("parseQueryString deserializes and validates nested structures from query string", () => {
    const result = parseQueryString(
      "?sort=-priority,-updated_at&include=user,comments&fields[todo]=title,content&filter[title][contains]=report&page[limit]=10&tags[0]=a&tags[1]=b",
      queryStructureSchema,
    );

    expect(result).toEqual({
      sort: "-priority,-updated_at",
      include: "user,comments",
      fields: { todo: "title,content" },
      filter: { title: { contains: "report" } },
      page: { limit: "10" },
      tags: ["a", "b"],
    });
  });

  test("toQueryString serializes nested structures to query string", () => {
    const result = toQueryString({
      sort: "-priority,-updated_at",
      include: "user,comments",
      fields: { todo: "title,content" },
      filter: { title: { contains: "report" } },
      page: { limit: 10 },
      tags: ["a", "b"],
    });

    expect(result).toBe(
      "sort=-priority%2C-updated_at&include=user%2Ccomments&fields[todo]=title%2Ccontent&filter[title][contains]=report&page[limit]=10&tags[0]=a&tags[1]=b",
    );
  });

  test("parseQueryString converts raw query string to generated transport params", () => {
    const result = parseQueryString(
      "?sort=-priority,-updated_at&include=user&fields[todo]=title,content&filter[title][contains]=report&page[limit]=10&page[offset]=20",
      getTodosQueryParamsSchema,
    );

    expect(result).toEqual({
      sort: "-priority,-updated_at",
      include: "user",
      fields: { todo: "title,content" },
      filter: { title: { contains: "report" } },
      page: { count: false, limit: 10, offset: 20 },
    });
  });

  test("toQueryHref appends the serialized query string to a pathname", () => {
    expect(
      toQueryHref("/todos", {
        sort: "-priority,-updated_at",
        page: { limit: 10 },
      }),
    ).toBe("/todos?sort=-priority%2C-updated_at&page[limit]=10");
  });

  test("toQueryHref returns the pathname unchanged when query params are empty", () => {
    expect(
      toQueryHref("/todos", {
        sort: undefined,
      }),
    ).toBe("/todos");
  });

  test("mergeQueryHref merges query params into an existing relative href", () => {
    expect(
      mergeQueryHref("/todos?page[limit]=10&page[offset]=20", {
        sort: "-priority",
      }),
    ).toBe("/todos?page[limit]=10&page[offset]=20&sort=-priority");
  });

  test("mergeQueryHref deep-merges nested query params", () => {
    expect(
      mergeQueryHref("/todos?page[limit]=10&page[offset]=20", {
        page: { limit: 30 },
      }),
    ).toBe("/todos?page[limit]=30&page[offset]=20");
  });

  test("mergeQueryHref removes keys assigned to undefined", () => {
    expect(
      mergeQueryHref("/todos?page[limit]=10&sort=-priority", {
        sort: undefined,
      }),
    ).toBe("/todos?page[limit]=10");
  });

  test("mergeQueryHref preserves hash fragments", () => {
    expect(
      mergeQueryHref("/todos?page[limit]=10#list", {
        sort: "-priority",
      }),
    ).toBe("/todos?page[limit]=10&sort=-priority#list");
  });

  test("mergeQueryHref supports absolute urls", () => {
    expect(
      mergeQueryHref("https://example.com/todos?page[limit]=10", {
        sort: "-priority",
      }),
    ).toBe("https://example.com/todos?page[limit]=10&sort=-priority");
  });
});
