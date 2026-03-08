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

  test("builds JSON:API title filter query for search", () => {
    expect(
      todoQuery.search.build(
        {
          sort: "-priority",
          page: { count: true, limit: 10, offset: 30 },
          filter: {
            status: { eq: "in_progress" },
            title: { contains: "draft" },
          },
        },
        "  roadmap  ",
      ),
    ).toEqual({
      sort: "-priority",
      page: { count: true, limit: 10 },
      filter: {
        status: { eq: "in_progress" },
        title: { contains: "roadmap" },
      },
    });
  });

  test("normalizes default page[count]=false out of UI queries", () => {
    expect(
      todoQuery.normalize({
        page: { count: false, limit: 10, offset: 30 },
        filter: {},
      }),
    ).toEqual({
      page: { limit: 10, offset: 30 },
    });
  });

  test("reads search value from JSON:API title filter", () => {
    expect(
      todoQuery.search.getValue({
        filter: {
          title: { contains: "roadmap" },
        },
      }),
    ).toBe("roadmap");
  });
});
