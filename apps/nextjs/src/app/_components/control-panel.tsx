import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { Button } from "~/shared/ui/button";
import { FilterTasks } from "./filter-tasks";

type ControlPanelProps = {
  boardId: string;
  canCreate?: boolean;
};

export function ControlPanel({ boardId, canCreate = true }: ControlPanelProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {canCreate ? (
        <Link
          href={`/todo/create?boardId=${encodeURIComponent(boardId)}`}
          className="w-full shrink-0 sm:w-auto"
        >
          <Button size="sm" className="w-full min-w-31 sm:w-auto">
            <PlusIcon className="h-4 w-4" />
            Create task
          </Button>
        </Link>
      ) : null}

      <FilterTasks />
    </div>
  );
}

export function ControlPanelSkeleton() {
  return (
    <div className="flex gap-2">
      <div className="h-9 w-28 shrink-0 rounded bg-gray-200 animate-pulse" />
      <div className="h-9 min-w-0 flex-1 rounded-md border border-input bg-background animate-pulse" />
    </div>
  );
}
