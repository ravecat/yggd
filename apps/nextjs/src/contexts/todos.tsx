"use client";

import type {
  GetTodosQueryParams,
  MetaStatusesEnumKey,
  Todo,
} from "@rvct/shared";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type PropsWithChildren,
} from "react";
import { fetchTodosAction } from "~/app/actions/todos";

const TODO_SORT_FIELDS = [
  "priority",
  "updated_at",
] as const satisfies readonly (keyof NonNullable<Todo["attributes"]>)[];

export type TodoSortField = (typeof TODO_SORT_FIELDS)[number];
type TodoSortState = Record<TodoSortField, "asc" | "desc" | null>;

type TodosData = {
  statuses: MetaStatusesEnumKey[];
  todos: Todo[];
};

type TodosQueryState = Pick<GetTodosQueryParams, "filter" | "sort">;

function getSearchValue(query: TodosQueryState): string {
  return query.filter?.title?.contains ?? "";
}

function getSortState(sort?: TodosQueryState["sort"]): TodoSortState {
  const sortFields = sort?.split(",") ?? [];

  return {
    priority: sortFields.includes("priority")
      ? "asc"
      : sortFields.includes("-priority")
        ? "desc"
        : null,
    updated_at: sortFields.includes("updated_at")
      ? "asc"
      : sortFields.includes("-updated_at")
        ? "desc"
        : null,
  };
}

function getSortValue(sortState: TodoSortState): TodosQueryState["sort"] {
  const sortValue = TODO_SORT_FIELDS.flatMap((field) => {
    const direction = sortState[field];

    if (direction === null) {
      return [];
    }

    return [direction === "desc" ? `-${field}` : field];
  }).join(",");

  return sortValue.length > 0 ? sortValue : undefined;
}

function hasFilterEntries(filter?: TodosQueryState["filter"]): boolean {
  return filter !== undefined && Object.keys(filter).length > 0;
}

function isEmptyQuery(query: TodosQueryState): boolean {
  return !hasFilterEntries(query.filter) && query.sort === undefined;
}

type TodosState = {
  data: TodosData;
  hasLoadingError: boolean;
  isLoading: boolean;
  query: TodosQueryState;
};

type TodosReducerAction =
  | { type: "fetch_started" }
  | { type: "fetch_failed" }
  | {
      data: TodosData;
      type: "fetch_succeeded";
    }
  | {
      type: "set_search";
      value: string;
    }
  | {
      field: TodoSortField;
      type: "toggle_sort";
    };

function todosReducer(
  state: TodosState,
  action: TodosReducerAction,
): TodosState {
  switch (action.type) {
    case "fetch_started":
      return {
        ...state,
        hasLoadingError: false,
        isLoading: true,
      };

    case "fetch_failed":
      return {
        ...state,
        hasLoadingError: true,
        isLoading: false,
      };

    case "fetch_succeeded":
      return {
        ...state,
        data: action.data,
        hasLoadingError: false,
        isLoading: false,
      };

    case "set_search": {
      const normalizedValue = action.value.trim();
      const { filter: currentFilter, ...restQuery } = state.query;
      const { title: _currentTitle, ...restFilter } = currentFilter ?? {};
      const nextFilter = normalizedValue
        ? {
            ...restFilter,
            title: { contains: normalizedValue },
          }
        : restFilter;

      if (!normalizedValue && !hasFilterEntries(currentFilter)) {
        return state;
      }

      if (normalizedValue === getSearchValue(state.query)) {
        return state;
      }

      return {
        ...state,
        query: hasFilterEntries(nextFilter)
          ? {
              ...restQuery,
              filter: nextFilter,
            }
          : restQuery,
      };
    }

    case "toggle_sort": {
      const currentSortState = getSortState(state.query.sort);
      const currentDirection = currentSortState[action.field];
      const nextDirection =
        currentDirection === null
          ? "asc"
          : currentDirection === "asc"
            ? "desc"
            : null;
      const nextSort = getSortValue({
        ...currentSortState,
        [action.field]: nextDirection,
      });
      const { sort: _currentSort, ...restQuery } = state.query;

      return {
        ...state,
        query: nextSort
          ? {
              ...restQuery,
              sort: nextSort,
            }
          : restQuery,
      };
    }
  }
}

type TodosContextValue = {
  hasLoadingError: boolean;
  isLoading: boolean;
  searchValue: string;
  setSearchValue: (value: string) => void;
  sortFields: readonly TodoSortField[];
  statuses: MetaStatusesEnumKey[];
  sortState: TodoSortState;
  todos: Todo[];
  toggleSortField: (field: TodoSortField) => void;
};

const TodosContext = createContext<TodosContextValue | null>(null);

type TodosProviderProps = PropsWithChildren<{
  statuses: MetaStatusesEnumKey[];
  todos: Todo[];
}>;

export function TodosProvider({
  children,
  statuses: initialStatuses,
  todos: initialTodos,
}: TodosProviderProps) {
  const initialData = useMemo<TodosData>(
    () => ({
      statuses: initialStatuses,
      todos: initialTodos,
    }),
    [initialStatuses, initialTodos],
  );
  const [state, dispatch] = useReducer(todosReducer, {
    data: initialData,
    hasLoadingError: false,
    isLoading: false,
    query: {},
  });
  const hasMountedRef = useRef(false);

  const searchValue = useMemo(() => getSearchValue(state.query), [state.query]);
  const sortState = useMemo(
    () => getSortState(state.query.sort),
    [state.query.sort],
  );

  const setSearchValue = useCallback((value: string) => {
    dispatch({ type: "set_search", value });
  }, []);

  const toggleSortField = useCallback((field: TodoSortField) => {
    dispatch({ field, type: "toggle_sort" });
  }, []);

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;

      if (isEmptyQuery(state.query)) {
        return;
      }
    }

    let isActive = true;

    dispatch({ type: "fetch_started" });

    async function fetchTodos() {
      try {
        const nextData = await fetchTodosAction(state.query);

        if (!isActive) {
          return;
        }

        dispatch({
          data: nextData,
          type: "fetch_succeeded",
        });
      } catch {
        if (!isActive) {
          return;
        }

        dispatch({ type: "fetch_failed" });
      }
    }

    void fetchTodos();

    return () => {
      isActive = false;
    };
  }, [state.query]);

  const statuses = useMemo(() => state.data.statuses, [state.data.statuses]);
  const todos = useMemo(() => state.data.todos, [state.data.todos]);

  const value = useMemo(
    () => ({
      hasLoadingError: state.hasLoadingError,
      isLoading: state.isLoading,
      searchValue,
      setSearchValue,
      sortFields: TODO_SORT_FIELDS,
      statuses,
      sortState,
      todos,
      toggleSortField,
    }),
    [
      searchValue,
      setSearchValue,
      statuses,
      state.hasLoadingError,
      state.isLoading,
      sortState,
      todos,
      toggleSortField,
    ],
  );

  return (
    <TodosContext.Provider value={value}>{children}</TodosContext.Provider>
  );
}

export function useTodosContext(): TodosContextValue {
  const context = useContext(TodosContext);

  if (!context) {
    throw new Error("useTodosContext must be used within a TodosProvider");
  }

  return context;
}
