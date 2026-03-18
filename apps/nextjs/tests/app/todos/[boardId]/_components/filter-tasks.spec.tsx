import { act, type ReactNode } from "react";
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
  getTodosQueryParamsSortEnum: {
    ID: "id",
    NEGATIVE_ID: "-id",
    TITLE: "title",
    NEGATIVE_TITLE: "-title",
    CONTENT: "content",
    NEGATIVE_CONTENT: "-content",
    STATUS: "status",
    NEGATIVE_STATUS: "-status",
    PRIORITY: "priority",
    NEGATIVE_PRIORITY: "-priority",
    CREATED_AT: "created_at",
    NEGATIVE_CREATED_AT: "-created_at",
    UPDATED_AT: "updated_at",
    NEGATIVE_UPDATED_AT: "-updated_at",
    BOARD_ID: "board_id",
    NEGATIVE_BOARD_ID: "-board_id",
  },
  todoSchema: {
    shape: {
      attributes: {
        unwrap: () => ({
          shape: {
            board_id: {},
            content: {},
            created_at: {},
            priority: {},
            status: {},
            title: {},
            updated_at: {},
          },
        }),
      },
    },
  },
}));

jest.mock("~/shared/ui/select", () => {
  const React = require("react");

  function SelectTrigger() {
    return null;
  }

  function SelectContent({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
  }

  function SelectItem() {
    return null;
  }

  function SelectValue() {
    return null;
  }

  function Select({
    value,
    onValueChange,
    children,
    disabled,
  }: {
    value: string;
    onValueChange?: (value: string) => void;
    children: React.ReactNode;
    disabled?: boolean;
  }) {
    let id: string | undefined;
    let ariaLabel: string | undefined;
    const items: Array<{ label: React.ReactNode; value: string }> = [];

    React.Children.forEach(children, (child: React.ReactNode) => {
      if (!React.isValidElement(child)) {
        return;
      }

      if (child.type === SelectTrigger) {
        id = child.props.id;
        ariaLabel = child.props["aria-label"];
        return;
      }

      if (child.type !== SelectContent) {
        return;
      }

      React.Children.forEach(child.props.children, (item: React.ReactNode) => {
        if (!React.isValidElement(item) || item.type !== SelectItem) {
          return;
        }

        items.push({
          label: item.props.children,
          value: item.props.value,
        });
      });
    });

    return (
      <select
        id={id}
        aria-label={ariaLabel}
        value={value}
        disabled={disabled}
        onChange={(event) => onValueChange?.(event.target.value)}
      >
        {items.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
    );
  }

  return {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  };
});

jest.mock("~/shared/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: { children?: ReactNode }) => (
    <div>{children}</div>
  ),
  DropdownMenuTrigger: ({ children }: { children?: ReactNode }) => (
    <>{children}</>
  ),
  DropdownMenuContent: ({ children }: { children?: ReactNode }) => (
    <div>{children}</div>
  ),
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
      "sort=-updated_at,status&filter[status][eq]=backlog&filter[title][contains]=roadmap";

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
    expect(url.searchParams.get("sort")).toBe("-updated_at,status");
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

  test("hydrates multiple sorting rules and exposes all sortable fields", async () => {
    searchParamsStringMock = "sort=-updated_at,status&page[offset]=20";

    const { FilterTasks } =
      await import("~/app/todos/[boardId]/_components/filter-tasks");

    render(<FilterTasks />);

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(replaceMock).not.toHaveBeenCalled();

    const sortField1 = screen.getByRole("combobox", {
      name: "Sort field 1",
    }) as HTMLSelectElement;
    const sortDirection1 = screen.getByRole("combobox", {
      name: "Sort direction 1",
    }) as HTMLSelectElement;
    const sortField2 = screen.getByRole("combobox", {
      name: "Sort field 2",
    }) as HTMLSelectElement;
    const sortDirection2 = screen.getByRole("combobox", {
      name: "Sort direction 2",
    }) as HTMLSelectElement;

    expect(sortField1.value).toBe("updated_at");
    expect(sortDirection1.value).toBe("desc");
    expect(sortField2.value).toBe("status");
    expect(sortDirection2.value).toBe("asc");
    expect(screen.getAllByRole("option", { name: "content" }).length).toBe(2);
    expect(screen.getAllByRole("option", { name: "board_id" }).length).toBe(2);

    fireEvent.click(screen.getByRole("button", { name: "Add" }));
    fireEvent.change(screen.getByRole("combobox", { name: "Sort field 3" }), {
      target: { value: "priority" },
    });
    fireEvent.change(
      screen.getByRole("combobox", { name: "Sort direction 3" }),
      {
        target: { value: "desc" },
      },
    );

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(replaceMock).toHaveBeenCalledTimes(1);

    const [href] = replaceMock.mock.calls[0] as [string, { scroll: boolean }];
    const url = new URL(href, "https://example.com");

    expect(url.searchParams.get("sort")).toBe("-updated_at,status,-priority");
    expect(url.searchParams.get("page[offset]")).toBe("20");
  });

  test("deduplicates repeated fields in favor of lower sorting rules", async () => {
    const { FilterTasks } =
      await import("~/app/todos/[boardId]/_components/filter-tasks");

    render(<FilterTasks />);

    fireEvent.change(screen.getByRole("combobox", { name: "Sort field 1" }), {
      target: { value: "priority" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add" }));
    fireEvent.change(screen.getByRole("combobox", { name: "Sort field 2" }), {
      target: { value: "priority" },
    });
    fireEvent.change(
      screen.getByRole("combobox", { name: "Sort direction 2" }),
      {
        target: { value: "desc" },
      },
    );

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(replaceMock).toHaveBeenCalledTimes(1);

    const [href] = replaceMock.mock.calls[0] as [string, { scroll: boolean }];
    const url = new URL(href, "https://example.com");

    expect(url.searchParams.get("sort")).toBe("-priority");
  });

  test("removes the last active sort rule and clears the sort param", async () => {
    searchParamsStringMock = "sort=-updated_at&page[limit]=10";

    const { FilterTasks } =
      await import("~/app/todos/[boardId]/_components/filter-tasks");

    render(<FilterTasks />);

    fireEvent.click(
      screen.getByRole("button", { name: "Remove sorting rule 1" }),
    );

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(replaceMock).toHaveBeenCalledTimes(1);

    const [href] = replaceMock.mock.calls[0] as [string, { scroll: boolean }];
    const url = new URL(href, "https://example.com");

    expect(url.searchParams.get("sort")).toBeNull();
    expect(url.searchParams.get("page[limit]")).toBe("10");
  });
});
