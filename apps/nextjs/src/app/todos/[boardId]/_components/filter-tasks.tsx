"use client";

import {
  getTodosQueryParamsSchema,
  mergeQueryHref,
  parseQueryString,
} from "@rvct/shared";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Input } from "~/shared/ui/input";

const DEBOUNCE_MS = 300;

export function FilterTasks() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchParamsString = searchParams.toString();
  const todosQuery = parseQueryString(
    searchParamsString,
    getTodosQueryParamsSchema,
  );
  const currentFilterValue = todosQuery?.filter?.title?.contains ?? "";
  const [filterValue, setFilterValue] = useState(currentFilterValue);

  useEffect(() => {
    setFilterValue(currentFilterValue);
  }, [currentFilterValue]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const nextFilterValue =
        filterValue.trim().length > 0 ? filterValue : undefined;

      if (nextFilterValue === currentFilterValue) {
        return;
      }

      const currentHref =
        searchParamsString.length > 0
          ? `${pathname}?${searchParamsString}`
          : pathname;
      const nextHref = mergeQueryHref(currentHref, {
        filter: {
          title: {
            contains: nextFilterValue,
          },
        },
        page: undefined,
      });

      router.replace(nextHref, { scroll: false });
    }, DEBOUNCE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [currentFilterValue, filterValue, pathname, router, searchParamsString]);

  return (
    <div className="min-w-0 flex-1">
      <Input
        type="search"
        value={filterValue}
        onChange={(event) => setFilterValue(event.target.value)}
        placeholder="Filter tasks"
        aria-label="Filter tasks"
      />
    </div>
  );
}
