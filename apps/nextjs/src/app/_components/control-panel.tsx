import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { Input } from "~/shared/ui/input";
import { Button } from "~/shared/ui/button";

export function ControlPanel() {
  return (
    <div className="flex flex-wrap gap-2">
      <Link href="/todo/create" className="w-full shrink-0 sm:w-auto">
        <Button size="sm" className="w-full min-w-31 sm:w-auto">
          <PlusIcon className="h-4 w-4" />
          Create task
        </Button>
      </Link>

      <div className="min-w-0 flex-1">
        <Input
          type="search"
          placeholder="Filter tasks"
          aria-label="Filter tasks"
        />
      </div>
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
