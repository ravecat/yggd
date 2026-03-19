"use client";

import { useEffect, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { Input } from "~/shared/ui/input";

type TodosFilterInputProps = {
  value: string;
};

export function TodosFilterInput({ value }: TodosFilterInputProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const updateFilter = useDebouncedCallback(
    (nextValue: string, currentQuery: string) => {
      const nextParams = new URLSearchParams(currentQuery);

      if (nextValue) {
        nextParams.set("filter", nextValue);
      } else {
        nextParams.delete("filter");
      }

      const query = nextParams.toString();

      startTransition(() => {
        router.replace(query ? `${pathname}?${query}` : pathname, {
          scroll: false,
        });
      });
    },
    300,
  );

  useEffect(() => {
    return () => {
      updateFilter.cancel();
    };
  }, [updateFilter]);

  return (
    <Input
      type="search"
      defaultValue={value}
      disabled={isPending}
      onChange={(event) => {
        updateFilter(event.target.value, searchParams.toString());
      }}
      placeholder="Filter tasks"
      aria-label="Filter tasks"
    />
  );
}
