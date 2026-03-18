"use client";

import {
  getTodosQueryParamsSortEnum,
  type GetTodosQueryParams,
} from "@rvct/shared";
import { ArrowUpDownIcon, PlusIcon, XIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "~/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "~/shared/ui/dropdown-menu";
import { Input } from "~/shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/shared/ui/select";

const DEBOUNCE_MS = 300;

type TodoSortToken = NonNullable<GetTodosQueryParams["sort"]>[number];
type TodoSortField = TodoSortToken extends `-${infer TField}`
  ? TField
  : TodoSortToken;
type SortDirection = "asc" | "desc";
type SortRule = {
  direction: SortDirection;
  field: TodoSortField;
};
type SortRuleDraft = {
  direction: SortDirection;
  field?: TodoSortField;
};
type TodosSearchState = {
  filterValue: string;
  sortValue?: string;
};
const TODOS_QUERY_PARAM_KEYS = {
  sort: "sort",
  filter: {
    title: {
      contains: "filter[title][contains]",
    },
  },
} as const;

const SORTABLE_TODO_FIELDS = [
  ...new Set(
    Object.values(getTodosQueryParamsSortEnum).map(
      (token) => token.replace(/^-/, "") as TodoSortField,
    ),
  ),
];
const SORTABLE_TODO_FIELD_SET = new Set<TodoSortField>(SORTABLE_TODO_FIELDS);

function isSortDirection(value: string): value is SortDirection {
  return value === "asc" || value === "desc";
}

function isTodoSortField(value: string): value is TodoSortField {
  return SORTABLE_TODO_FIELD_SET.has(value as TodoSortField);
}

function createEmptySortRule(): SortRuleDraft {
  return {
    direction: "asc",
  };
}

function readTodosSearchState(searchParamsString: string): TodosSearchState {
  const searchParams = new URLSearchParams(searchParamsString);

  return {
    filterValue:
      searchParams.get(TODOS_QUERY_PARAM_KEYS.filter.title.contains) ?? "",
    sortValue: searchParams.get(TODOS_QUERY_PARAM_KEYS.sort) ?? undefined,
  };
}

function buildTodosHref({
  pathname,
  filterValue,
  searchParamsString,
  sortTokens,
}: {
  pathname: string;
  filterValue?: string;
  searchParamsString: string;
  sortTokens?: readonly string[];
}): string {
  const searchParams = new URLSearchParams(searchParamsString);

  if (filterValue === undefined) {
    searchParams.delete(TODOS_QUERY_PARAM_KEYS.filter.title.contains);
  } else {
    searchParams.set(TODOS_QUERY_PARAM_KEYS.filter.title.contains, filterValue);
  }

  if (sortTokens === undefined || sortTokens.length === 0) {
    searchParams.delete(TODOS_QUERY_PARAM_KEYS.sort);
  } else {
    searchParams.set(TODOS_QUERY_PARAM_KEYS.sort, sortTokens.join(","));
  }

  const nextSearchParamsString = searchParams.toString();

  return nextSearchParamsString.length > 0
    ? `${pathname}?${nextSearchParamsString}`
    : pathname;
}

function normalizeSortRules(sortRules: readonly SortRule[]): SortRule[] {
  const seenFields = new Set<TodoSortField>();
  const normalizedSortRules: SortRule[] = [];

  for (let index = sortRules.length - 1; index >= 0; index -= 1) {
    const sortRule = sortRules[index];

    if (!sortRule || seenFields.has(sortRule.field)) {
      continue;
    }

    seenFields.add(sortRule.field);
    normalizedSortRules.unshift(sortRule);
  }

  return normalizedSortRules;
}

function parseSortToken(sortToken: string): SortRule | null {
  const trimmedSortToken = sortToken.trim();

  if (!trimmedSortToken) {
    return null;
  }

  const field = trimmedSortToken.replace(/^-/, "") as TodoSortField;

  if (!isTodoSortField(field)) {
    return null;
  }

  return {
    direction: trimmedSortToken.startsWith("-") ? "desc" : "asc",
    field,
  };
}

function hydrateSortRules(sortValue?: string): SortRuleDraft[] {
  const sortRules = normalizeSortRules(
    (sortValue?.split(",") ?? []).flatMap((sortToken) => {
      const parsedSortToken = parseSortToken(sortToken);

      return parsedSortToken ? [parsedSortToken] : [];
    }),
  );

  return sortRules.length > 0 ? sortRules : [createEmptySortRule()];
}

function toPersistedSortRules(sortRules: readonly SortRuleDraft[]): SortRule[] {
  return normalizeSortRules(
    sortRules.flatMap((sortRule) => {
      if (!sortRule.field) {
        return [];
      }

      return [
        {
          direction: sortRule.direction,
          field: sortRule.field,
        },
      ];
    }),
  );
}

function toSortTokens(
  sortRules: readonly SortRuleDraft[],
): TodoSortToken[] | undefined {
  const persistedSortRules = toPersistedSortRules(sortRules);

  if (persistedSortRules.length === 0) {
    return undefined;
  }

  return persistedSortRules.map(
    (sortRule) =>
      (sortRule.direction === "desc"
        ? `-${sortRule.field}`
        : sortRule.field) as TodoSortToken,
  );
}

export function FilterTasks() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchParamsString = searchParams.toString();
  const { filterValue: currentFilterValue, sortValue: currentSortValue } =
    readTodosSearchState(searchParamsString);
  const [filterValue, setFilterValue] = useState(currentFilterValue);
  const [sortRules, setSortRules] = useState<SortRuleDraft[]>(() =>
    hydrateSortRules(currentSortValue),
  );
  const isSortActive = toPersistedSortRules(sortRules).length > 0;

  useEffect(() => {
    setFilterValue(currentFilterValue);
  }, [currentFilterValue]);

  useEffect(() => {
    setSortRules(hydrateSortRules(currentSortValue));
  }, [currentSortValue]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const nextFilterValue =
        filterValue.trim().length > 0 ? filterValue : undefined;
      const nextSortTokens = toSortTokens(sortRules);
      const currentHref = searchParamsString
        ? `${pathname}?${searchParamsString}`
        : pathname;
      const nextHref = buildTodosHref({
        filterValue: nextFilterValue,
        pathname,
        searchParamsString,
        sortTokens: nextSortTokens,
      });

      if (nextHref === currentHref) {
        return;
      }

      router.replace(nextHref, { scroll: false });
    }, DEBOUNCE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [filterValue, pathname, router, searchParamsString, sortRules]);

  const handleSortFieldChange = (index: number, nextField: string) => {
    setSortRules((currentSortRules) =>
      currentSortRules.map((sortRule, sortRuleIndex) => {
        if (sortRuleIndex !== index) {
          return sortRule;
        }

        if (!isTodoSortField(nextField)) {
          return createEmptySortRule();
        }

        return {
          direction: sortRule.direction,
          field: nextField,
        };
      }),
    );
  };

  const handleSortDirectionChange = (index: number, nextDirection: string) => {
    if (!isSortDirection(nextDirection)) {
      return;
    }

    setSortRules((currentSortRules) =>
      currentSortRules.map((sortRule, sortRuleIndex) =>
        sortRuleIndex === index
          ? {
              ...sortRule,
              direction: nextDirection,
            }
          : sortRule,
      ),
    );
  };

  const addSortRule = () => {
    setSortRules((currentSortRules) => [
      ...currentSortRules,
      createEmptySortRule(),
    ]);
  };

  const removeSortRule = (index: number) => {
    setSortRules((currentSortRules) => {
      const nextSortRules = currentSortRules.filter(
        (_sortRule, sortRuleIndex) => sortRuleIndex !== index,
      );

      return nextSortRules.length > 0 ? nextSortRules : [createEmptySortRule()];
    });
  };

  return (
    <div className="min-w-0 flex-1">
      <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1">
          <Input
            type="search"
            value={filterValue}
            onChange={(event) => setFilterValue(event.target.value)}
            placeholder="Filter tasks"
            aria-label="Filter tasks"
          />
        </div>

        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full justify-between gap-3 sm:w-auto sm:min-w-28"
            >
              <span className="inline-flex items-center gap-2">
                <ArrowUpDownIcon className="h-4 w-4 opacity-70" />
                Sort
              </span>

              {isSortActive ? (
                <span
                  aria-hidden="true"
                  className="size-1.5 rounded-full bg-primary"
                />
              ) : null}
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-[min(32rem,calc(100vw-2rem))] rounded-xl border-border/70 p-4 shadow-lg"
            onCloseAutoFocus={(event) => event.preventDefault()}
          >
            <div className="space-y-3">
              <div className="space-y-0.5">
                <p className="text-sm font-semibold text-foreground">Sort</p>
                <p className="text-xs text-muted-foreground">
                  Build task ordering from any available sortable field.
                </p>
              </div>

              <div className="space-y-2">
                {sortRules.map((sortRule, index) => (
                  <div
                    key={`${index}-${sortRule.field}-${sortRule.direction}`}
                    className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-center"
                  >
                    <Select
                      value={sortRule.field}
                      onValueChange={(nextField) =>
                        handleSortFieldChange(index, nextField)
                      }
                    >
                      <SelectTrigger
                        aria-label={`Sort field ${index + 1}`}
                        className="w-full"
                      >
                        <SelectValue placeholder="Select field" />
                      </SelectTrigger>
                      <SelectContent>
                        {SORTABLE_TODO_FIELDS.map((field) => (
                          <SelectItem key={field} value={field}>
                            {field}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select
                      value={sortRule.direction}
                      disabled={!sortRule.field}
                      onValueChange={(nextDirection) =>
                        handleSortDirectionChange(index, nextDirection)
                      }
                    >
                      <SelectTrigger
                        aria-label={`Sort direction ${index + 1}`}
                        className="w-full"
                      >
                        <SelectValue placeholder="Direction" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asc">asc</SelectItem>
                        <SelectItem value="desc">desc</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 shrink-0"
                      aria-label={`Remove sorting rule ${index + 1}`}
                      onClick={() => removeSortRule(index)}
                    >
                      <XIcon className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-fit"
                onClick={addSortRule}
              >
                <PlusIcon className="h-4 w-4" />
                Add
              </Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
