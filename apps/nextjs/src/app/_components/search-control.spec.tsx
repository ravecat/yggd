import {
  afterEach,
  beforeEach,
  describe,
  expect,
  jest,
  test,
} from "@jest/globals";
import { act, fireEvent, render, screen } from "@testing-library/react";

const replaceMock = jest.fn();

jest.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({
    replace: replaceMock,
  }),
}));

const { SearchControl } =
  require("./search-control") as typeof import("./search-control");

function getInput() {
  return screen.getByRole("searchbox", {
    name: "Search tasks",
  }) as HTMLInputElement;
}

function getSearchParams(href: string) {
  return new URL(href, "https://example.com").searchParams;
}

describe("SearchControl", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    replaceMock.mockReset();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  test("replaces the url automatically after the debounce window", () => {
    render(
      <SearchControl
        query={{
          sort: "-priority",
          page: { limit: 10, offset: 30 },
          filter: {
            status: { eq: "in_progress" },
          },
        }}
      />,
    );

    fireEvent.change(getInput(), { target: { value: "roadmap" } });

    act(() => {
      jest.advanceTimersByTime(299);
    });

    expect(replaceMock).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(1);
    });

    expect(replaceMock).toHaveBeenCalledTimes(1);

    const [href, options] = replaceMock.mock.calls[0] as [
      string,
      { scroll: boolean },
    ];
    const searchParams = getSearchParams(href);

    expect(new URL(href, "https://example.com").pathname).toBe("/");
    expect(searchParams.get("sort")).toBe("-priority");
    expect(searchParams.get("page[limit]")).toBe("10");
    expect(searchParams.get("page[offset]")).toBeNull();
    expect(searchParams.get("filter[status][eq]")).toBe("in_progress");
    expect(searchParams.get("filter[title][contains]")).toBe("roadmap");
    expect(options).toEqual({ scroll: false });
  });

  test("clears the title filter automatically when the input becomes empty", () => {
    render(
      <SearchControl
        query={{
          sort: "-priority",
          page: { limit: 10, offset: 30 },
          filter: {
            status: { eq: "in_progress" },
            title: { contains: "roadmap" },
          },
        }}
      />,
    );

    fireEvent.change(getInput(), { target: { value: "" } });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(replaceMock).toHaveBeenCalledTimes(1);

    const [href] = replaceMock.mock.calls[0] as [string];
    const searchParams = getSearchParams(href);

    expect(searchParams.get("sort")).toBe("-priority");
    expect(searchParams.get("page[limit]")).toBe("10");
    expect(searchParams.get("page[offset]")).toBeNull();
    expect(searchParams.get("filter[status][eq]")).toBe("in_progress");
    expect(searchParams.get("filter[title][contains]")).toBeNull();
  });

  test("does not navigate on mount when the input matches the current query", () => {
    render(
      <SearchControl
        query={{
          filter: {
            title: { contains: "roadmap" },
          },
        }}
      />,
    );

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(replaceMock).not.toHaveBeenCalled();
  });
});
