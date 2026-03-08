import { describe, expect, test } from "@jest/globals";
import {
  createQuerySortPreset,
  createSortModel,
  formatSortValue,
  getSortDirection,
  parseSortValue,
  toggleSortField,
  type SortCodecOptions,
} from "./sort.js";

type TodoSortField = "priority" | "title" | "updated_at";

const SORT_OPTIONS = {
  cycle: ["desc", "asc", "off"],
} as const satisfies SortCodecOptions;

describe("sort helpers", () => {
  test("parseSortValue converts wire format into structured sort items", () => {
    expect(parseSortValue<TodoSortField>("-priority,title")).toEqual([
      { field: "priority", direction: "desc" },
      { field: "title", direction: "asc" },
    ]);
  });

  test("formatSortValue converts structured sort items into wire format", () => {
    expect(
      formatSortValue<TodoSortField>([
        { field: "priority", direction: "desc" },
        { field: "title", direction: "asc" },
      ]),
    ).toBe("-priority,title");
  });

  test("getSortDirection resolves the direction for a field", () => {
    const items = parseSortValue<TodoSortField>("-priority,title");

    expect(getSortDirection(items, "priority")).toBe("desc");
    expect(getSortDirection(items, "title")).toBe("asc");
    expect(getSortDirection(items, "updated_at")).toBeNull();
  });

  test("toggleSortField cycles according to declarative configuration", () => {
    const start = parseSortValue<TodoSortField>("-priority,title");

    expect(toggleSortField(start, "priority", SORT_OPTIONS)).toEqual([
      { field: "priority", direction: "asc" },
      { field: "title", direction: "asc" },
    ]);

    expect(
      toggleSortField(
        toggleSortField(start, "priority", SORT_OPTIONS),
        "priority",
        SORT_OPTIONS,
      ),
    ).toEqual([{ field: "title", direction: "asc" }]);

    expect(toggleSortField(start, "updated_at", SORT_OPTIONS)).toEqual([
      { field: "priority", direction: "desc" },
      { field: "title", direction: "asc" },
      { field: "updated_at", direction: "desc" },
    ]);
  });

  test("helpers support custom formatting rules", () => {
    const options = {
      cycle: ["asc", "off"],
      descendingPrefix: "!",
      separator: ";",
    } as const satisfies SortCodecOptions;

    const parsed = parseSortValue<"name" | "status">("!name;status", options);

    expect(parsed).toEqual([
      { field: "name", direction: "desc" },
      { field: "status", direction: "asc" },
    ]);

    expect(formatSortValue(parsed, options)).toBe("!name;status");
    expect(toggleSortField(parsed, "status", options)).toEqual([
      { field: "name", direction: "desc" },
    ]);
  });

  test("createSortModel exposes a compact facade over the codec helpers", () => {
    const sort = createSortModel<TodoSortField>(
      "-priority,title",
      SORT_OPTIONS,
    );

    expect(sort.items).toEqual([
      { field: "priority", direction: "desc" },
      { field: "title", direction: "asc" },
    ]);
    expect(sort.getDirection("priority")).toBe("desc");
    expect(sort.getDirection("updated_at")).toBeNull();
    expect(sort.toggle("priority")).toBe("priority,title");
    expect(sort.toggle("updated_at")).toBe("-priority,title,-updated_at");
  });

  test("createQuerySortPreset builds framework-agnostic sort data", () => {
    const preset = createQuerySortPreset<
      { page?: { limit?: number }; sort?: string },
      TodoSortField
    >({
      fields: [{ field: "priority" }, { field: "updated_at" }],
      sort: SORT_OPTIONS,
    });

    expect(
      preset.build({
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
});
