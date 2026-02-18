import Link from "next/link";
import { ArrowUpIcon, ArrowDownIcon, PlusIcon } from "lucide-react";
import { Button } from "~/shared/ui/button";
import {
  type GetTodosQueryParams,
  type Todo,
  serializeQueryParams,
} from "@rvct/shared";
import { assigns } from "~/shared/lib/session";

type ControlPanelProps = {
  query: Partial<GetTodosQueryParams>;
};

type TodoSortField = keyof NonNullable<Todo["attributes"]>;

const SORT_FIELDS = [
  "title",
  "status",
  "created_at",
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

  const buttonData = SORT_FIELDS.map((field) => {
    const asc = sortFields.includes(field);
    const desc = sortFields.includes(`-${field}`);

    const queryParams = serializeQueryParams<GetTodosQueryParams>({
      ...query,
      sort: getNewSortValue(field),
    });

    const href = `/?${new URLSearchParams(queryParams).toString()}`;

    return { field, asc, desc, href };
  });

  return (
    <div className="flex gap-2">
      {userId && (
        <Link href="/todo/create">
          <Button size="sm" className="w-48">
            <PlusIcon className="h-4 w-4 mr-2" />
            Create Todo
          </Button>
        </Link>
      )}
      {buttonData.map((data) => (
        <Link key={data.field} href={data.href}>
          <Button variant="outline" size="sm" className="w-48 justify-between">
            <span>{data.field}</span>
            {data.desc ? (
              <ArrowDownIcon className="h-3 w-3" />
            ) : data.asc ? (
              <ArrowUpIcon className="h-3 w-3" />
            ) : null}
          </Button>
        </Link>
      ))}
    </div>
  );
}
