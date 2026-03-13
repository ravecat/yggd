import { describe, expect, test } from "@jest/globals";
import {
  toSearchParamsString,
  type RouteSearchParams,
} from "~/shared/lib/search-params";

function toEntries(params: RouteSearchParams): [string, string][] {
  return Array.from(
    new URLSearchParams(toSearchParamsString(params)).entries(),
  );
}

describe("search params helpers", () => {
  test("serializes flat string params to query entries", () => {
    expect(
      toEntries({
        sort: "-priority",
        "filter[title][contains]": "roadmap",
      }),
    ).toEqual([
      ["sort", "-priority"],
      ["filter[title][contains]", "roadmap"],
    ]);
  });

  test("serializes array values as repeated keys", () => {
    expect(
      toEntries({
        "fields[todo]": ["title", "content"],
      }),
    ).toEqual([
      ["fields[todo]", "title"],
      ["fields[todo]", "content"],
    ]);
  });

  test("skips undefined values", () => {
    expect(
      toEntries({
        sort: "-priority",
        include: undefined,
      }),
    ).toEqual([["sort", "-priority"]]);
  });

  test("returns an empty string for empty params", () => {
    expect(toSearchParamsString({})).toBe("");
  });
});
