"use client";

import Link from "next/link";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  PlusIcon,
  SearchIcon,
} from "lucide-react";
import { Button } from "~/shared/ui/button";
import { cn } from "~/shared/lib/component";
import { Input } from "~/shared/ui/input";
import { useTodosContext } from "~/contexts/todos";

type ControlPanelProps = {
  canCreate: boolean;
};

export function ControlPanel({ canCreate }: ControlPanelProps) {
  const {
    searchValue,
    setSearchValue,
    sortFields,
    sortState,
    toggleSortField,
  } = useTodosContext();

  return (
    <div className="flex flex-wrap gap-2">
      {canCreate && (
        <Link href="/todo/create" className="w-full shrink-0 sm:w-auto">
          <Button size="sm" className="w-full min-w-31 sm:w-auto">
            <PlusIcon className="h-4 w-4" />
            Create task
          </Button>
        </Link>
      )}

      <div className="flex w-full flex-col gap-2 sm:min-w-0 sm:flex-1 sm:flex-row sm:items-stretch">
        <div className="relative min-w-0 flex-1" role="search">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground transition-colors" />
          <Input
            aria-label="Search tasks"
            className="w-full pl-9"
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder="Search"
            type="search"
            value={searchValue}
          />
        </div>

        <div className="grid w-full grid-cols-2 gap-2 sm:w-auto sm:shrink-0">
          {sortFields.map((field) => {
            const direction = sortState[field];
            const active = direction !== null;

            return (
              <button
                key={field}
                type="button"
                onClick={() => toggleSortField(field)}
                className={cn(
                  "flex min-w-0 h-9 items-center justify-between rounded-md px-3 text-sm transition-colors sm:min-w-31",
                  active
                    ? "bg-primary/5 text-foreground"
                    : "bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                <span className="truncate">{field}</span>
                <span className="ml-1.5 flex shrink-0 flex-col">
                  <ChevronUpIcon
                    className={cn(
                      "h-3.5 w-3.5 -mb-0.5 transition-colors",
                      direction === "asc"
                        ? "text-primary"
                        : "text-muted-foreground/30",
                    )}
                  />
                  <ChevronDownIcon
                    className={cn(
                      "h-3.5 w-3.5 -mt-0.5 transition-colors",
                      direction === "desc"
                        ? "text-primary"
                        : "text-muted-foreground/30",
                    )}
                  />
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
