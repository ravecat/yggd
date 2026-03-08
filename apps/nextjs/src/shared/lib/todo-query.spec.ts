import { describe, expect, test } from "@jest/globals";
import { todoQuery } from "./todo-query";

describe("todoQuery", () => {
  test("builds sort data from the contract query", () => {
    expect(
      todoQuery.sort.build({
        sort: "-priority",
        page: { limit: 10 },
      }),
    ).toEqual([
      {
        field: "title",
        direction: null,
        asc: false,
        desc: false,
        active: false,
        nextQuery: {
          sort: "-priority,-title",
          page: { limit: 10 },
        },
      },
      {
        field: "priority",
        direction: "desc",
        asc: false,
        desc: true,
        active: true,
        nextQuery: {
          sort: "priority",
          page: { limit: 10 },
        },
      },
      {
        field: "updated_at",
        direction: null,
        asc: false,
        desc: false,
        active: false,
        nextQuery: {
          sort: "-priority,-updated_at",
          page: { limit: 10 },
        },
      },
    ]);
  });
});
