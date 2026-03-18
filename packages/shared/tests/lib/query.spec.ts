import { describe, test, expect } from "@jest/globals";
import { getTodosQueryParamsSchema } from "~/api/zod/getTodosSchema";
import { createQueryCodec } from "~/lib/query";

const todosQueryCodec = createQueryCodec(getTodosQueryParamsSchema);
const queryParams = {
  sort: ["-priority", "-updated_at"],
  include: ["board"],
  fields: {
    todo: ["title", "content"],
  },
  filter: {
    title: {
      contains: "report",
    },
  },
  page: {
    limit: 10,
    offset: 20,
  },
};

describe("createQueryCodec", () => {
  describe("parse", () => {
    test("parses a query string into the expected typed query params object", () => {
      const result = todosQueryCodec.parse(
        "?sort=-priority%2C-updated_at&include=board&fields[todo]=title%2Ccontent&filter[title][contains]=report&page[limit]=10&page[offset]=20",
      );

      expect(result).toEqual({
        ...queryParams,
        page: {
          ...queryParams.page,
          count: false,
        },
      });
    });
  });

  describe("stringify", () => {
    test("serializes a typed query params object into the expected query string", () => {
      const result = todosQueryCodec.stringify(queryParams);

      expect(result).toBe(
        "sort=-priority,-updated_at&include=board&fields[todo]=title,content&filter[title][contains]=report&page[limit]=10&page[offset]=20",
      );
    });
  });

  describe("toHref", () => {
    test("merges typed query params into an existing href and preserves the hash fragment", () => {
      const result = todosQueryCodec.toHref(
        "/todos?sort=-priority%2C-updated_at&include=board&fields[todo]=title%2Ccontent&filter[title][contains]=report&page[limit]=10&page[offset]=20#filters",
        {
          filter: {
            title: {
              contains: "done",
            },
          },
          page: {
            offset: 30,
          },
        },
      );

      expect(result).toBe(
        "/todos?sort=-priority,-updated_at&include=board&fields[todo]=title,content&filter[title][contains]=done&page[limit]=10&page[offset]=30#filters",
      );
    });
  });
});
