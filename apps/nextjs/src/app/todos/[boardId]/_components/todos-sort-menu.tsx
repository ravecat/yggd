"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowDownUpIcon, PlusIcon, XIcon } from "lucide-react";
import {
  type TodoSortDirection,
  type TodoSortField,
  type TodoSortRule,
  encodeTodoSortRules,
  getDefaultTodoSortRule,
  parseTodoSortRules,
  todoSortFieldLabels,
  todoSortFields,
} from "~/features/todos/sort";
import { cn } from "~/shared/lib/component";
import { Badge } from "~/shared/ui/badge";
import { Button } from "~/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "~/shared/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/shared/ui/select";

type TodosSortMenuProps = {
  value: string;
};

const directionLabels: Record<TodoSortDirection, string> = {
  asc: "Ascending",
  desc: "Descending",
};

export function TodosSortMenu({ value }: TodosSortMenuProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const rules = parseTodoSortRules(value);
  const canAddRule = rules.length < todoSortFields.length;

  function replaceSort(nextRules: TodoSortRule[]) {
    const nextParams = new URLSearchParams(searchParams.toString());
    const nextSort = encodeTodoSortRules(nextRules);

    nextParams.delete("sort");
    if (nextSort) {
      nextParams.set("sort", nextSort);
    }

    const query = nextParams.toString();

    startTransition(() => {
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    });
  }

  function updateRule(index: number, changes: Partial<TodoSortRule>) {
    replaceSort(
      rules.map((rule, ruleIndex) =>
        ruleIndex === index ? { ...rule, ...changes } : rule,
      ),
    );
  }

  function addRule() {
    replaceSort([
      ...rules,
      getDefaultTodoSortRule(rules.map((rule) => rule.field)),
    ]);
  }

  function removeRule(index: number) {
    replaceSort(rules.filter((_, ruleIndex) => ruleIndex !== index));
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant={rules.length ? "secondary" : "outline"}
          size="sm"
          className={cn(
            "min-w-28 justify-between rounded-md border-border/70 px-3.5",
            rules.length && "bg-secondary/70",
          )}
        >
          <span className="flex items-center gap-2">
            <ArrowDownUpIcon className="h-4 w-4" />
            Sort
          </span>
          {rules.length ? (
            <Badge
              variant="outline"
              className="rounded-full border-border/70 bg-background px-1.5 py-0 text-[10px] font-semibold"
            >
              {rules.length}
            </Badge>
          ) : null}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="w-[min(94vw,26.5rem)] rounded-md border-border/70 bg-background p-2 shadow-md"
      >
        <div className="flex flex-col gap-2">
          {rules.map((rule, index) => (
            <div
              key={`${rule.field}-${index}`}
              className="grid gap-2 md:grid-cols-[minmax(0,1fr)_9rem_auto]"
            >
              <Select
                value={rule.field}
                onValueChange={(value) =>
                  updateRule(index, { field: value as TodoSortField })
                }
              >
                <SelectTrigger className="h-9 rounded-md border-border/70 bg-background">
                  <SelectValue placeholder="Field" />
                </SelectTrigger>
                <SelectContent>
                  {todoSortFields.map((field) => (
                    <SelectItem
                      key={field}
                      value={field}
                      disabled={rules.some(
                        (otherRule, otherIndex) =>
                          otherIndex !== index && otherRule.field === field,
                      )}
                    >
                      {todoSortFieldLabels[field]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={rule.direction}
                onValueChange={(value) =>
                  updateRule(index, {
                    direction: value as TodoSortDirection,
                  })
                }
              >
                <SelectTrigger className="h-9 rounded-md border-border/70 bg-background">
                  <SelectValue placeholder="Direction" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(directionLabels).map(([direction, label]) => (
                    <SelectItem key={direction} value={direction}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-md text-muted-foreground"
                aria-label={`Remove ${todoSortFieldLabels[rule.field]} sort rule`}
                onClick={() => removeRule(index)}
                disabled={isPending}
              >
                <XIcon className="h-4 w-4" />
              </Button>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 self-start rounded-md border-border/70 px-2.5"
            onClick={addRule}
            disabled={!canAddRule || isPending}
          >
            <PlusIcon className="h-4 w-4" />
            Add rule
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
