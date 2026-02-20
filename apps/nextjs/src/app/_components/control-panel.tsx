import Link from "next/link";
import { ChevronUpIcon, ChevronDownIcon, PlusIcon } from "lucide-react";
import { Button } from "~/shared/ui/button";
import {
  type GetTodosQueryParams,
  type Todo,
  serializeQueryParams,
} from "@rvct/shared";
import { assigns } from "~/shared/lib/session";
import { cn } from "~/shared/lib/component";

type ControlPanelProps = {
  query: Partial<GetTodosQueryParams>;
};

type TodoSortField = keyof NonNullable<Todo["attributes"]>;

const SORT_FIELDS = [
  "title",
  "status",
  "updated_at",
] as const satisfies ReadonlyArray<TodoSortField>;

export async function ControlPanel({ query }: ControlPanelProps) {
  const { userId } = await assigns();

  const sort = query.sort ?? "";

  const sortFields = sort
    .split(",")
    .map((field) => field.trim())
    .filter((field) => field.length > 0);

  const getNewSortValue = (field: string) => {
    const desc = `-${field}`;
    let result: string[];

    if (sortFields.includes(desc))
      result = sortFields.map((f) => (f === desc ? field : f));
    else if (sortFields.includes(field))
      result = sortFields.filter((f) => f !== field);
    else result = [...sortFields, desc];

    return result.join(",");
  };

  const sortData = SORT_FIELDS.map((field) => {
    const asc = sortFields.includes(field);
    const desc = sortFields.includes(`-${field}`);
    const active = asc || desc;

    const queryParams = serializeQueryParams<GetTodosQueryParams>({
      ...query,
      sort: getNewSortValue(field),
    });

    const href = `/?${new URLSearchParams(queryParams).toString()}`;

    return { field, asc, desc, active, href };
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
      <div className="ml-auto grid w-full grid-cols-3 gap-2 sm:w-auto">
        {sortData.map((data) => (
          <Link
            key={data.field}
            href={data.href}
            className={cn(
              "flex min-w-31 items-center justify-between rounded-md border px-3 h-9 text-sm transition-colors",
              data.active
                ? "border-primary/30 bg-primary/5 text-foreground"
                : "border-input bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            <span className="truncate">{data.field}</span>
            <span className="flex shrink-0 flex-col ml-1.5">
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
  );
}
