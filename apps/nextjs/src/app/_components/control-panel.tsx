import Link from "next/link";
import {
  ChevronUpIcon,
  ChevronDownIcon,
  PlusIcon,
  SearchIcon,
} from "lucide-react";
import { Button } from "~/shared/ui/button";
import { Input } from "~/shared/ui/input";
import { stringifyQuery, type GetTodosQueryParams } from "@rvct/shared";
import { assigns } from "~/shared/lib/session";
import { cn } from "~/shared/lib/component";
import { todoQuery } from "~/shared/lib/todo-query";

type ControlPanelProps = {
  query: GetTodosQueryParams;
};

export async function ControlPanel({ query }: ControlPanelProps) {
  const { userId } = await assigns();

  const sortData = todoQuery.sort.build(query).map((item) => {
    const queryString = stringifyQuery(item.nextQuery);

    return {
      ...item,
      href: queryString.length > 0 ? `?${queryString}` : "?",
    };
  });

  return (
    <div className="flex flex-wrap gap-2">
      {userId && (
        <Link href="/todo/create" className="w-full shrink-0 sm:w-auto">
          <Button size="sm" className="w-full min-w-31 sm:w-auto">
            <PlusIcon className="h-4 w-4" />
            Create task
          </Button>
        </Link>
      )}
      <div className="flex w-full flex-col gap-2 sm:min-w-0 sm:flex-1 sm:flex-row sm:items-center">
        <div className="relative w-full sm:min-w-0 sm:flex-1">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            aria-label="Search tasks"
            className="w-full pl-9"
            placeholder="search (in progress)"
            type="search"
          />
        </div>

        <div className="grid w-full grid-cols-3 gap-2 sm:w-auto">
          {sortData.map((data) => (
            <Link
              key={data.field}
              href={data.href}
              className={cn(
                "flex min-w-0 h-9 items-center justify-between rounded-md px-3 text-sm transition-colors sm:min-w-31",
                data.active
                  ? "bg-primary/5 text-foreground"
                  : "bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <span className="truncate">{data.field}</span>
              <span className="ml-1.5 flex shrink-0 flex-col">
                <ChevronUpIcon
                  className={cn(
                    "h-3.5 w-3.5 -mb-0.5 transition-colors",
                    data.asc ? "text-primary" : "text-muted-foreground/30",
                  )}
                />
                <ChevronDownIcon
                  className={cn(
                    "h-3.5 w-3.5 -mt-0.5 transition-colors",
                    data.desc ? "text-primary" : "text-muted-foreground/30",
                  )}
                />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
