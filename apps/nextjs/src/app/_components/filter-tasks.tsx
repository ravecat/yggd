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
  const currentTitleContains = todosQuery?.filter?.title?.contains;
  const currentTitleFilter = currentTitleContains ?? "";
  const [titleFilter, setTitleFilter] = useState(currentTitleFilter);

  useEffect(() => {
    setTitleFilter(currentTitleFilter);
  }, [currentTitleFilter]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const nextTitleContains =
        titleFilter.trim().length > 0 ? titleFilter : undefined;

      if (nextTitleContains === currentTitleContains) {
        return;
      }

      const currentHref =
        searchParamsString.length > 0
          ? `${pathname}?${searchParamsString}`
          : pathname;
      const nextHref = mergeQueryHref(currentHref, {
        filter: {
          title: {
            contains: nextTitleContains,
          },
        },
        page: undefined,
      });

      router.replace(nextHref, { scroll: false });
    }, DEBOUNCE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [currentTitleContains, pathname, router, searchParamsString, titleFilter]);

  return (
    <div className="min-w-0 flex-1">
      <Input
        type="search"
        value={titleFilter}
        onChange={(event) => setTitleFilter(event.target.value)}
        placeholder="Filter tasks"
        aria-label="Filter tasks"
      />
    </div>
  );
}
