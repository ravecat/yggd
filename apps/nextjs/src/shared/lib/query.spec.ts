import { parseQueryParams } from "./query";

describe("parseQueryParams", () => {
  describe("simple keys", () => {
    test("parses simple string values", () => {
      const input = { sort: "-created_at", search: "test" };
      const result = parseQueryParams(input);

      expect(result).toEqual({
        sort: "-created_at",
        search: "test",
      });
    });

    test("handles undefined values", () => {
      const input = { sort: "-created_at", search: undefined };
      const result = parseQueryParams(input);

      expect(result).toEqual({
        sort: "-created_at",
      });
    });

    test("converts numeric strings to numbers", () => {
      const input = { limit: "10", offset: "20" };
      const result = parseQueryParams(input);

      expect(result).toEqual({
        limit: 10,
        offset: 20,
      });
    });

    test("converts boolean strings to booleans", () => {
      const input = { active: "true", deleted: "false" };
      const result = parseQueryParams(input);

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
      const result = parseQueryParams(input);

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
      const result = parseQueryParams(input);

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
      const result = parseQueryParams(input);

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
      const result = parseQueryParams(input);

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
      const result = parseQueryParams(input);

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
      const result = parseQueryParams(input);

      expect(result).toEqual({
        tags: ["javascript", "typescript"],
      });
    });

    test("converts numeric array values", () => {
      const input = {
        "ids[]": ["1", "2", "3"],
      };
      const result = parseQueryParams(input);

      expect(result).toEqual({
        ids: [1, 2, 3],
      });
    });

    test("handles mixed array values", () => {
      const input = {
        "values[]": ["true", "42", "text"],
      };
      const result = parseQueryParams(input);

      expect(result).toEqual({
        values: [true, 42, "text"],
      });
    });
  });

  describe("edge cases", () => {
    test("handles empty string values", () => {
      const input = { search: "" };
      const result = parseQueryParams(input);

      expect(result).toEqual({
        search: "",
      });
    });

    test("handles empty object", () => {
      const input = {};
      const result = parseQueryParams(input);

      expect(result).toEqual({});
    });

    test("handles special characters in values", () => {
      const input = {
        search: "hello@world.com",
        "filter[email][eq]": "test+tag@example.com",
      };
      const result = parseQueryParams(input);

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
      const result = parseQueryParams(input);

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
      const result = parseQueryParams(input);

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
      const result = parseQueryParams(input);

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
      const result = parseQueryParams(input);

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
      const result = parseQueryParams(input);

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
      const result = parseQueryParams(input);

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
      const result = parseQueryParams(input);

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
      const result = parseQueryParams(input);

      expect(result).toEqual({
        fields: {
          post: "title,content,created_at",
          user: "name,email",
        },
      });
    });
  });
});
