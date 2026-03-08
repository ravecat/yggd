"use client";

import { toQueryHref, type GetTodosQueryParams } from "@rvct/shared";
import { SearchIcon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useEffectEvent, useState, useTransition } from "react";
import { cn } from "~/shared/lib/component";
import { todoQuery } from "~/shared/lib/todo-query";
import { Input } from "~/shared/ui/input";

const SEARCH_DEBOUNCE_MS = 300;

type SearchControlProps = {
  query: GetTodosQueryParams;
};

export function SearchControl({ query }: SearchControlProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const currentValue = todoQuery.search.getValue(query);
  const [value, setValue] = useState(currentValue);

  useEffect(() => {
    setValue(currentValue);
  }, [currentValue]);

  const syncSearch = useEffectEvent((nextValue: string) => {
    const currentHref = toQueryHref(pathname, query);
    const nextHref = toQueryHref(
      pathname,
      todoQuery.search.build(query, nextValue),
    );

    if (nextHref === currentHref) {
      return;
    }

    startTransition(() => {
      router.replace(nextHref, { scroll: false });
    });
  });

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      syncSearch(value);
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [value]);

  return (
    <div className="relative w-full sm:min-w-0 sm:flex-1" role="search">
      <SearchIcon
        className={cn(
          "pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 transition-colors",
          isPending ? "text-primary" : "text-muted-foreground",
        )}
      />
      <Input
        aria-label="Search tasks"
        className="w-full pl-9"
        name={todoQuery.search.fieldName}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Search"
        type="search"
        value={value}
      />
    </div>
  );
}
