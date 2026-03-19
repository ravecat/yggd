import { describe, expect, test } from "@jest/globals";
import { encodeTodoSortRules, parseTodoSortRules } from "~/features/todos/sort";

describe("todo sorting", () => {
  test("parses repeated and comma-separated sort params", () => {
    expect(parseTodoSortRules(["-priority,title", "-created_at"])).toEqual([
      { field: "priority", direction: "desc" },
      { field: "title", direction: "asc" },
      { field: "created_at", direction: "desc" },
    ]);
  });

  test("encodes rules as a csv string", () => {
    expect(
      encodeTodoSortRules([
        { field: "priority", direction: "desc" },
        { field: "title", direction: "asc" },
      ]),
    ).toBe("-priority,title");
  });
});
