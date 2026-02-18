import Link from "next/link";
import { ArrowUpIcon, ArrowDownIcon, PlusIcon } from "lucide-react";
import { Button } from "~/shared/ui/button";
import {
  deserializeQueryParams,
  serializeQueryParams,
  type GetTodosQueryParams,
} from "@rvct/shared";
import { assigns } from "~/shared/lib/session";
import type { AsyncSearchParams } from "~/shared/types";

type ControlPanelConfig = {
  page: {
    limit: {
      default: number;
      min: number;
      max: number;
    };
    offset: {
      default: number;
      min: number;
    };
  };
  sort: {
    default: string;
    options: ReadonlyArray<{
      field: string;
      label: string;
    }>;
  };
  filter: Record<string, unknown>;
  include: Record<string, unknown>;
  fields: Record<string, unknown>;
};

type ControlPanelProps = {
  searchParams: AsyncSearchParams<GetTodosQueryParams>;
  config: ControlPanelConfig;
};

export async function ControlPanel({
  searchParams,
  config,
}: ControlPanelProps) {
  const params = await searchParams;
  const { page, sort } = deserializeQueryParams<GetTodosQueryParams>(params);
  const { userId } = await assigns();

  const limit = page!.limit!;
  const offset = page!.offset!;

  const sortFields = sort!.split(",").map((field) => field.trim());

  const getNewSortValue = (field: string): string => {
    const asc = field;
    const desc = `-${field}`;

    const ascIndex = sortFields.indexOf(asc);
    const descIndex = sortFields.indexOf(desc);

    let newSortFields: string[];

    if (descIndex !== -1) {
      newSortFields = sortFields.filter((f) => f !== desc);
      newSortFields.splice(descIndex, 0, asc);
    } else if (ascIndex !== -1) {
      newSortFields = sortFields.filter((f) => f !== asc);
    } else {
      newSortFields = [...sortFields, desc];
    }

    const result = newSortFields.join(",");
    return result || config.sort.default;
  };

  const buttonData = config.sort.options.map((option) => {
    const asc = option.field;
    const desc = `-${option.field}`;

    const ascIndex = sortFields.indexOf(asc);
    const descIndex = sortFields.indexOf(desc);

    const active = ascIndex !== -1 || descIndex !== -1;
    const isDescending = descIndex !== -1;
    const newSortValue = getNewSortValue(option.field);

    const queryParams = serializeQueryParams<GetTodosQueryParams>({
      page: { limit, offset },
      sort: newSortValue,
    });

    const href = `/?${new URLSearchParams(queryParams).toString()}`;

    return {
      field: option.field,
      label: option.label,
      active,
      isDescending,
      href,
    };
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
            <span>{data.label}</span>
            {data.active &&
              (data.isDescending ? (
                <ArrowDownIcon className="h-3 w-3" />
              ) : (
                <ArrowUpIcon className="h-3 w-3" />
              ))}
          </Button>
        </Link>
      ))}
    </div>
  );
}
