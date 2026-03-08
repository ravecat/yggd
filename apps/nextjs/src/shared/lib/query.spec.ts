import { getTodosQueryParamsSchema } from "@rvct/shared";
import { parseQuery, stringifyQuery } from "./query";

describe("parseQuery", () => {
  describe("simple keys", () => {
    test("parses simple string values", () => {
      const input = { sort: "-created_at", search: "test" };
      const result = parseQuery(input);

      expect(result).toEqual({
        sort: "-created_at",
        search: "test",
      });
    });

    test("handles undefined values", () => {
      const input = { sort: "-created_at", search: undefined };
      const result = parseQuery(input);

      expect(result).toEqual({
        sort: "-created_at",
      });
    });

    test("keeps numeric strings as strings", () => {
      const input = { limit: "10", offset: "20" };
      const result = parseQuery(input);

      expect(result).toEqual({
        limit: "10",
        offset: "20",
      });
    });

    test("keeps boolean strings as strings", () => {
      const input = { active: "true", deleted: "false" };
      const result = parseQuery(input);

      expect(result).toEqual({
        active: "true",
        deleted: "false",
      });
    });
  });

  describe("nested keys with single level", () => {
    test("parses single-level nested keys", () => {
      const input = {
        "page[number]": "1",
        "page[size]": "10",
      };
      const result = parseQuery(input);

      expect(result).toEqual({
        page: {
          number: "1",
          size: "10",
        },
      });
    });

    test("mixes simple and nested keys", () => {
      const input = {
        sort: "-created_at",
        "page[number]": "1",
        "page[size]": "10",
      };
      const result = parseQuery(input);

      expect(result).toEqual({
        sort: "-created_at",
        page: {
          number: "1",
          size: "10",
        },
      });
    });
  });

  describe("deeply nested keys", () => {
    test("parses two-level nested keys", () => {
      const input = {
        "filter[title][contains]": "test",
        "filter[status][eq]": "published",
      };
      const result = parseQuery(input);

      expect(result).toEqual({
        filter: {
          title: {
            contains: "test",
          },
          status: {
            eq: "published",
          },
        },
      });
    });

    test("parses three-level nested keys", () => {
      const input = {
        "filter[author][name][like]": "John",
      };
      const result = parseQuery(input);

      expect(result).toEqual({
        filter: {
          author: {
            name: {
              like: "John",
            },
          },
        },
      });
    });

    test("combines multiple nesting levels", () => {
      const input = {
        sort: "-created_at",
        "page[number]": "1",
        "filter[title][contains]": "test",
        "filter[status][in]": "draft",
      };
      const result = parseQuery(input);

      expect(result).toEqual({
        sort: "-created_at",
        page: {
          number: "1",
        },
        filter: {
          title: {
            contains: "test",
          },
          status: {
            in: "draft",
          },
        },
      });
    });
  });

  describe("array values", () => {
    test("handles array values", () => {
      const input = {
        "tags[]": ["javascript", "typescript"],
      };
      const result = parseQuery(input);

      expect(result).toEqual({
        tags: ["javascript", "typescript"],
      });
    });

    test("keeps numeric array values as strings", () => {
      const input = {
        "ids[]": ["1", "2", "3"],
      };
      const result = parseQuery(input);

      expect(result).toEqual({
        ids: ["1", "2", "3"],
      });
    });

    test("handles mixed array values as strings", () => {
      const input = {
        "values[]": ["true", "42", "text"],
      };
      const result = parseQuery(input);

      expect(result).toEqual({
        values: ["true", "42", "text"],
      });
    });
  });

  describe("edge cases", () => {
    test("handles empty string values", () => {
      const input = { search: "" };
      const result = parseQuery(input);

      expect(result).toEqual({
        search: "",
      });
    });

    test("handles empty object", () => {
      const input = {};
      const result = parseQuery(input);

      expect(result).toEqual({});
    });

    test("handles special characters in values", () => {
      const input = {
        search: "hello@world.com",
        "filter[email][eq]": "test+tag@example.com",
      };
      const result = parseQuery(input);

      expect(result).toEqual({
        search: "hello@world.com",
        filter: {
          email: {
            eq: "test+tag@example.com",
          },
        },
      });
    });

    test("handles values with spaces", () => {
      const input = {
        search: "hello world",
        "filter[title][contains]": "test value",
      };
      const result = parseQuery(input);

      expect(result).toEqual({
        search: "hello world",
        filter: {
          title: {
            contains: "test value",
          },
        },
      });
    });

    test("preserves non-numeric strings that start with numbers", () => {
      const input = {
        code: "123abc",
        "filter[id][eq]": "456def",
      };
      const result = parseQuery(input);

      expect(result).toEqual({
        code: "123abc",
        filter: {
          id: {
            eq: "456def",
          },
        },
      });
    });

    test("keeps negative numbers as strings", () => {
      const input = {
        offset: "-10",
        "page[delta]": "-5",
      };
      const result = parseQuery(input);

      expect(result).toEqual({
        offset: "-10",
        page: {
          delta: "-5",
        },
      });
    });

    test("keeps decimal numbers as strings", () => {
      const input = {
        price: "19.99",
        "filter[rating][gte]": "4.5",
      };
      const result = parseQuery(input);

      expect(result).toEqual({
        price: "19.99",
        filter: {
          rating: {
            gte: "4.5",
          },
        },
      });
    });
  });

  describe("real-world JSON:API examples", () => {
    test("parses typical pagination parameters", () => {
      const input = {
        "page[number]": "2",
        "page[size]": "25",
        "page[count]": "true",
      };
      const result = parseQuery(input);

      expect(result).toEqual({
        page: {
          number: "2",
          size: "25",
          count: "true",
        },
      });
    });

    test("parses offset-based pagination", () => {
      const input = {
        "page[limit]": "10",
        "page[offset]": "20",
      };
      const result = parseQuery(input);

      expect(result).toEqual({
        page: {
          limit: "10",
          offset: "20",
        },
      });
    });

    test("parses complex filter combinations", () => {
      const input = {
        sort: "-created_at,title",
        "page[number]": "1",
        "page[size]": "10",
        "filter[title][contains]": "test",
        "filter[created_at][gte]": "2024-01-01",
        "filter[status][in]": "published",
      };
      const result = parseQuery(input);

      expect(result).toEqual({
        sort: "-created_at,title",
        page: {
          number: "1",
          size: "10",
        },
        filter: {
          title: {
            contains: "test",
          },
          created_at: {
            gte: "2024-01-01",
          },
          status: {
            in: "published",
          },
        },
      });
    });

    test("parses fields sparse fieldsets", () => {
      const input = {
        "fields[post]": "title,content,created_at",
        "fields[user]": "name,email",
      };
      const result = parseQuery(input);

      expect(result).toEqual({
        fields: {
          post: "title,content,created_at",
          user: "name,email",
        },
      });
    });

    test("parses and validates generated query contracts via schema", () => {
      const input = {
        sort: "-updated_at,title",
        include: "user",
        "page[limit]": "10",
        "page[offset]": "20",
      };

      const result = parseQuery(getTodosQueryParamsSchema, input);

      expect(result).toEqual({
        sort: "-updated_at,title",
        include: "user",
        page: {
          count: false,
          limit: 10,
          offset: 20,
        },
      });
    });
  });
});

describe("stringifyQuery", () => {
  describe("simple values", () => {
    test("serializes simple string values", () => {
      const result = stringifyQuery({ sort: "title", search: "test" });

      expect(result).toBe("sort=title&search=test");
    });

    test("serializes numeric values", () => {
      const result = stringifyQuery({ limit: 10, offset: 20 });

      expect(result).toBe("limit=10&offset=20");
    });

    test("serializes boolean values", () => {
      const result = stringifyQuery({ active: true, deleted: false });

      expect(result).toBe("active=true&deleted=false");
    });

    test("skips undefined values", () => {
      const result = stringifyQuery({ sort: "title", search: undefined });

      expect(result).toBe("sort=title");
    });

    test("skips null values", () => {
      const result = stringifyQuery({ sort: "title", search: null });

      expect(result).toBe("sort=title");
    });
  });

  describe("nested objects", () => {
    test("serializes single-level nested objects", () => {
      const result = stringifyQuery({
        page: { limit: 10, offset: 0 },
      });

      expect(result).toBe("page[limit]=10&page[offset]=0");
    });

    test("serializes multi-level nested objects", () => {
      const result = stringifyQuery({
        filter: { title: { contains: "test" } },
      });

      expect(result).toBe("filter[title][contains]=test");
    });

    test("serializes mixed simple and nested values", () => {
      const result = stringifyQuery({
        page: { limit: 10, offset: 0 },
        sort: "title",
      });

      expect(result).toBe("page[limit]=10&page[offset]=0&sort=title");
    });
  });

  describe("arrays", () => {
    test("serializes string arrays", () => {
      const result = stringifyQuery({
        tags: ["typescript", "react"],
      });

      expect(result).toBe("tags[0]=typescript&tags[1]=react");
    });

    test("serializes number arrays", () => {
      const result = stringifyQuery({
        ids: [1, 2, 3],
      });

      expect(result).toBe("ids[0]=1&ids[1]=2&ids[2]=3");
    });

    test("skips undefined and null values in arrays", () => {
      const result = stringifyQuery({
        tags: ["a", undefined, "b", null, "c"],
      });

      expect(result).toBe("tags[0]=a&tags[2]=b&tags[4]=c");
    });
  });

  describe("round-trip conversion", () => {
    test("parse -> serialize -> parse yields same result for simple values", () => {
      const original = { sort: "title", limit: "10" };
      const parsed = parseQuery(original);
      const serialized = stringifyQuery(parsed);
      const reParsed = parseQuery(
        Object.fromEntries(new URLSearchParams(serialized).entries()) as Record<
          string,
          string
        >,
      );

      expect(reParsed).toEqual(parsed);
    });

    test("parse -> serialize -> parse yields same result for nested objects", () => {
      const original = { "page[limit]": "10", "page[offset]": "0" };
      const parsed = parseQuery(original);
      const serialized = stringifyQuery(parsed);
      const reParsed = parseQuery(
        Object.fromEntries(new URLSearchParams(serialized).entries()) as Record<
          string,
          string
        >,
      );

      expect(reParsed).toEqual(parsed);
    });

    test("serialize -> parse yields correct structure", () => {
      const original = {
        page: { limit: 10, offset: 0 },
        sort: "title",
      };
      const serialized = stringifyQuery(original);
      const parsed = parseQuery(
        Object.fromEntries(new URLSearchParams(serialized).entries()) as Record<
          string,
          string
        >,
      );

      expect(parsed).toEqual({
        page: { limit: "10", offset: "0" },
        sort: "title",
      });
    });
  });

  describe("edge cases", () => {
    test("handles empty object", () => {
      const result = stringifyQuery({});

      expect(result).toBe("");
    });

    test("handles object with only undefined values", () => {
      const result = stringifyQuery({
        sort: undefined,
        search: undefined,
      });

      expect(result).toBe("");
    });

    test("handles deeply nested objects", () => {
      const result = stringifyQuery({
        filter: {
          user: {
            profile: {
              age: { gte: 18 },
            },
          },
        },
      });

      expect(result).toBe("filter[user][profile][age][gte]=18");
    });
  });
});
