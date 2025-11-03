import Link from "next/link";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { POST_SORT_OPTIONS } from "../config/posts";
import { parseQueryParams } from "@/shared/lib/query";
import type { AsyncSearchParams } from "@/shared/types";
import type { GetPostsQueryParams } from "@yggd/shared";

export async function SortButtons({
  searchParams,
}: {
  searchParams: AsyncSearchParams<GetPostsQueryParams>;
}) {
  const params = await searchParams;
  const { page, sort } = parseQueryParams<GetPostsQueryParams>(params);

  const limit = page!.limit!;
  const offset = page!.offset!;
  const currentSort = sort!;

  const sortFields = currentSort.split(",").map((field) => field.trim());

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

    return newSortFields.join(",");
  };

  return (
    <div className="flex gap-2 mb-6">
      {POST_SORT_OPTIONS.map((option) => {
        const asc = option.field;
        const desc = `-${option.field}`;

        const ascIndex = sortFields.indexOf(asc);
        const descIndex = sortFields.indexOf(desc);

        const isActive = ascIndex !== -1 || descIndex !== -1;
        const isDescending = descIndex !== -1;

        const newSortValue = getNewSortValue(option.field);

        const params: [string, string][] = [
          ["page[limit]", String(limit)],
          ["page[offset]", String(offset)],
        ];

        if (newSortValue) {
          params.push(["sort", newSortValue]);
        }

        const href = `/?${new URLSearchParams(params).toString()}`;

        return (
          <Link key={option.field} href={href}>
            <Button
              variant="outline"
              size="sm"
              className="w-48 justify-between"
            >
              <span>{option.label}</span>
              {isActive &&
                (isDescending ? (
                  <ArrowDownIcon className="h-3 w-3" />
                ) : (
                  <ArrowUpIcon className="h-3 w-3" />
                ))}
            </Button>
          </Link>
        );
      })}
    </div>
  );
}
