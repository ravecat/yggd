import Link from "next/link";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { POST_SORT_OPTIONS } from "../config/post-sort";
import { parseQueryParams } from "@/shared/lib/query";

export async function SortButtons({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const { page, sort } = parseQueryParams(params) as {
    page?: { limit?: number; offset?: number };
    sort?: string;
  };

  const limit = page?.limit ?? 10;
  const offset = page?.offset ?? 0;
  const currentSort = sort ?? "-created_at";

  return (
    <div className="flex gap-2 mb-6">
      {POST_SORT_OPTIONS.map((option) => {
        const isActive =
          currentSort === option.field || currentSort === `-${option.field}`;
        const isDescending = currentSort === `-${option.field}`;
        const sortValue = isActive && !currentSort.startsWith("-") ? "-" : "";
        
        const params: [string, string][] = [
          ["page[limit]", String(limit)],
          ["page[offset]", String(offset)],
          ["sort", `${sortValue}${option.field}`],
        ];
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
