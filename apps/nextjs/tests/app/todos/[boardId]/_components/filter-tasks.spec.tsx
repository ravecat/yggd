import { act } from "react";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  jest,
  test,
} from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react";

const replaceMock = jest.fn();

let pathnameMock = "/";
let searchParamsStringMock = "";

jest.mock("next/navigation", () => ({
  usePathname: () => pathnameMock,
  useRouter: () => ({
    replace: replaceMock,
  }),
  useSearchParams: () => new URLSearchParams(searchParamsStringMock),
}));

jest.mock("@rvct/shared", () => ({
  createQueryCodec: () => ({
    parse: (queryString: string) => {
      const searchParams = new URLSearchParams(queryString);
      const titleContains = searchParams.get("filter[title][contains]");

      return titleContains
        ? {
            filter: {
              title: {
                contains: titleContains,
              },
            },
          }
        : {};
    },
    toHref: (
      href: string,
      params: {
        filter?: {
          title?: {
            contains?: string;
          };
        };
      },
    ) => {
      const url = new URL(href, "https://example.com");
      const titleContains = params.filter?.title?.contains;

      if (titleContains) {
        url.searchParams.set("filter[title][contains]", titleContains);
      } else {
        url.searchParams.delete("filter[title][contains]");
      }

      return `${url.pathname}${url.search}`;
    },
  }),
  getTodosQueryParamsSchema: {},
}));

describe("FilterTasks", () => {
  beforeEach(() => {
    pathnameMock = "/todos/board-1";
    searchParamsStringMock = "";
    replaceMock.mockReset();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  test("hydrates from the current query and updates the title filter in the url", async () => {
    searchParamsStringMock =
      "sort=-updated_at&filter[status][eq]=backlog&filter[title][contains]=roadmap";

    const { FilterTasks } =
      await import("~/app/todos/[boardId]/_components/filter-tasks");

    render(<FilterTasks />);

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(replaceMock).not.toHaveBeenCalled();

    const input = screen.getByRole("searchbox", {
      name: "Filter tasks",
    }) as HTMLInputElement;

    expect(input.value).toBe("roadmap");

    fireEvent.change(input, { target: { value: "bug" } });

    act(() => {
      jest.advanceTimersByTime(299);
    });

    expect(replaceMock).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(1);
    });

    expect(replaceMock).toHaveBeenCalledTimes(1);
    expect(replaceMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ scroll: false }),
    );

    const [href] = replaceMock.mock.calls[0] as [string, { scroll: boolean }];
    const url = new URL(href, "https://example.com");

    expect(url.pathname).toBe("/todos/board-1");
    expect(url.searchParams.get("sort")).toBe("-updated_at");
    expect(url.searchParams.get("filter[status][eq]")).toBe("backlog");
    expect(url.searchParams.get("filter[title][contains]")).toBe("bug");
  });

  test("does not replace the current url on mount when the filter is unchanged", async () => {
    searchParamsStringMock =
      "filter[title][contains]=roadmap&page[offset]=20&page[limit]=10";

    const { FilterTasks } =
      await import("~/app/todos/[boardId]/_components/filter-tasks");

    render(<FilterTasks />);

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(replaceMock).not.toHaveBeenCalled();
  });

  test("removes the title filter and preserves existing query params when the input is cleared", async () => {
    searchParamsStringMock =
      "filter[title][contains]=roadmap&page[offset]=20&page[limit]=10";

    const { FilterTasks } =
      await import("~/app/todos/[boardId]/_components/filter-tasks");

    render(<FilterTasks />);

    const input = screen.getByRole("searchbox", {
      name: "Filter tasks",
    });

    fireEvent.change(input, { target: { value: "" } });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(replaceMock).toHaveBeenCalledTimes(1);

    const [href] = replaceMock.mock.calls[0] as [string, { scroll: boolean }];
    const url = new URL(href, "https://example.com");

    expect(url.searchParams.get("filter[title][contains]")).toBeNull();
    expect(url.searchParams.get("page[offset]")).toBe("20");
    expect(url.searchParams.get("page[limit]")).toBe("10");
  });
});
