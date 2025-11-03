import { deserializeQueryParams, serializeQueryParams } from "./query";

describe("deserializeQueryParams", () => {
  describe("simple keys", () => {
    test("parses simple string values", () => {
      const input = { sort: "-created_at", search: "test" };
      const result = deserializeQueryParams(input);

      expect(result).toEqual({
        sort: "-created_at",
        search: "test",
      });
    });

    test("handles undefined values", () => {
      const input = { sort: "-created_at", search: undefined };
      const result = deserializeQueryParams(input);

      expect(result).toEqual({
        sort: "-created_at",
      });
    });

    test("converts numeric strings to numbers", () => {
      const input = { limit: "10", offset: "20" };
      const result = deserializeQueryParams(input);

      expect(result).toEqual({
        limit: 10,
        offset: 20,
      });
    });

    test("converts boolean strings to booleans", () => {
      const input = { active: "true", deleted: "false" };
      const result = deserializeQueryParams(input);

      expect(result).toEqual({
        active: true,
        deleted: false,
      });
    });
  });

  describe("nested keys with single level", () => {
    test("parses single-level nested keys", () => {
      const input = {
        "page[number]": "1",
        "page[size]": "10",
      };
      const result = deserializeQueryParams(input);

      expect(result).toEqual({
        page: {
          number: 1,
          size: 10,
        },
      });
    });

    test("mixes simple and nested keys", () => {
      const input = {
        sort: "-created_at",
        "page[number]": "1",
        "page[size]": "10",
      };
      const result = deserializeQueryParams(input);

      expect(result).toEqual({
        sort: "-created_at",
        page: {
          number: 1,
          size: 10,
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
      const result = deserializeQueryParams(input);

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
      const result = deserializeQueryParams(input);

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
      const result = deserializeQueryParams(input);

      expect(result).toEqual({
        sort: "-created_at",
        page: {
          number: 1,
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
      const result = deserializeQueryParams(input);

      expect(result).toEqual({
        tags: ["javascript", "typescript"],
      });
    });

    test("converts numeric array values", () => {
      const input = {
        "ids[]": ["1", "2", "3"],
      };
      const result = deserializeQueryParams(input);

      expect(result).toEqual({
        ids: [1, 2, 3],
      });
    });

    test("handles mixed array values", () => {
      const input = {
        "values[]": ["true", "42", "text"],
      };
      const result = deserializeQueryParams(input);

      expect(result).toEqual({
        values: [true, 42, "text"],
      });
    });
  });

  describe("edge cases", () => {
    test("handles empty string values", () => {
      const input = { search: "" };
      const result = deserializeQueryParams(input);

      expect(result).toEqual({
        search: "",
      });
    });

    test("handles empty object", () => {
      const input = {};
      const result = deserializeQueryParams(input);

      expect(result).toEqual({});
    });

    test("handles special characters in values", () => {
      const input = {
        search: "hello@world.com",
        "filter[email][eq]": "test+tag@example.com",
      };
      const result = deserializeQueryParams(input);

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
      const result = deserializeQueryParams(input);

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
      const result = deserializeQueryParams(input);

      expect(result).toEqual({
        code: "123abc",
        filter: {
          id: {
            eq: "456def",
          },
        },
      });
    });

    test("handles negative numbers", () => {
      const input = {
        offset: "-10",
        "page[delta]": "-5",
      };
      const result = deserializeQueryParams(input);

      expect(result).toEqual({
        offset: -10,
        page: {
          delta: -5,
        },
      });
    });

    test("handles decimal numbers", () => {
      const input = {
        price: "19.99",
        "filter[rating][gte]": "4.5",
      };
      const result = deserializeQueryParams(input);

      expect(result).toEqual({
        price: 19.99,
        filter: {
          rating: {
            gte: 4.5,
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
      const result = deserializeQueryParams(input);

      expect(result).toEqual({
        page: {
          number: 2,
          size: 25,
          count: true,
        },
      });
    });

    test("parses offset-based pagination", () => {
      const input = {
        "page[limit]": "10",
        "page[offset]": "20",
      };
      const result = deserializeQueryParams(input);

      expect(result).toEqual({
        page: {
          limit: 10,
          offset: 20,
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
      const result = deserializeQueryParams(input);

      expect(result).toEqual({
        sort: "-created_at,title",
        page: {
          number: 1,
          size: 10,
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
      const result = deserializeQueryParams(input);

      expect(result).toEqual({
        fields: {
          post: "title,content,created_at",
          user: "name,email",
        },
      });
    });
  });
});

describe("serializeQueryParams", () => {
  describe("simple values", () => {
    test("serializes simple string values", () => {
      const result = serializeQueryParams({ sort: "title", search: "test" });

      expect(result).toEqual([
        ["sort", "title"],
        ["search", "test"],
      ]);
    });

    test("serializes numeric values", () => {
      const result = serializeQueryParams({ limit: 10, offset: 20 });

      expect(result).toEqual([
        ["limit", "10"],
        ["offset", "20"],
      ]);
    });

    test("serializes boolean values", () => {
      const result = serializeQueryParams({ active: true, deleted: false });

      expect(result).toEqual([
        ["active", "true"],
        ["deleted", "false"],
      ]);
    });

    test("skips undefined values", () => {
      const result = serializeQueryParams({ sort: "title", search: undefined });

      expect(result).toEqual([["sort", "title"]]);
    });

    test("skips null values", () => {
      const result = serializeQueryParams({ sort: "title", search: null });

      expect(result).toEqual([["sort", "title"]]);
    });
  });

  describe("nested objects", () => {
    test("serializes single-level nested objects", () => {
      const result = serializeQueryParams({
        page: { limit: 10, offset: 0 },
      });

      expect(result).toEqual([
        ["page[limit]", "10"],
        ["page[offset]", "0"],
      ]);
    });

    test("serializes multi-level nested objects", () => {
      const result = serializeQueryParams({
        filter: { title: { contains: "test" } },
      });

      expect(result).toEqual([["filter[title][contains]", "test"]]);
    });

    test("serializes mixed simple and nested values", () => {
      const result = serializeQueryParams({
        page: { limit: 10, offset: 0 },
        sort: "title",
      });

      expect(result).toEqual([
        ["page[limit]", "10"],
        ["page[offset]", "0"],
        ["sort", "title"],
      ]);
    });
  });

  describe("arrays", () => {
    test("serializes string arrays", () => {
      const result = serializeQueryParams({
        tags: ["typescript", "react"],
      });

      expect(result).toEqual([
        ["tags[]", "typescript"],
        ["tags[]", "react"],
      ]);
    });

    test("serializes number arrays", () => {
      const result = serializeQueryParams({
        ids: [1, 2, 3],
      });

      expect(result).toEqual([
        ["ids[]", "1"],
        ["ids[]", "2"],
        ["ids[]", "3"],
      ]);
    });

    test("skips undefined and null values in arrays", () => {
      const result = serializeQueryParams({
        tags: ["a", undefined, "b", null, "c"],
      });

      expect(result).toEqual([
        ["tags[]", "a"],
        ["tags[]", "b"],
        ["tags[]", "c"],
      ]);
    });
  });

  describe("round-trip conversion", () => {
    test("parse -> serialize -> parse yields same result for simple values", () => {
      const original = { sort: "title", limit: "10" };
      const parsed = deserializeQueryParams(original);
      const serialized = serializeQueryParams(parsed);
      const reParsed = deserializeQueryParams(
        Object.fromEntries(serialized) as Record<string, string>
      );

      expect(reParsed).toEqual(parsed);
    });

    test("parse -> serialize -> parse yields same result for nested objects", () => {
      const original = { "page[limit]": "10", "page[offset]": "0" };
      const parsed = deserializeQueryParams(original);
      const serialized = serializeQueryParams(parsed);
      const reParsed = deserializeQueryParams(
        Object.fromEntries(serialized) as Record<string, string>
      );

      expect(reParsed).toEqual(parsed);
    });

    test("serialize -> parse yields correct structure", () => {
      const original = {
        page: { limit: 10, offset: 0 },
        sort: "title",
      };
      const serialized = serializeQueryParams(original);
      const parsed = deserializeQueryParams(
        Object.fromEntries(serialized) as Record<string, string>
      );

      expect(parsed).toEqual(original);
    });
  });

  describe("edge cases", () => {
    test("handles empty object", () => {
      const result = serializeQueryParams({});

      expect(result).toEqual([]);
    });

    test("handles object with only undefined values", () => {
      const result = serializeQueryParams({
        sort: undefined,
        search: undefined,
      });

      expect(result).toEqual([]);
    });

    test("handles deeply nested objects", () => {
      const result = serializeQueryParams({
        filter: {
          user: {
            profile: {
              age: { gte: 18 },
            },
          },
        },
      });

      expect(result).toEqual([["filter[user][profile][age][gte]", "18"]]);
    });
  });
});
