export function ControlPanelSkeleton() {
  return (
    <div className="flex gap-2">
      <div className="h-9 w-28 shrink-0 rounded bg-gray-200 animate-pulse" />
      <div className="grid min-w-0 flex-1 grid-cols-4 gap-2">
        <div className="h-9 rounded-md border border-input bg-background animate-pulse" />
        <div className="h-9 rounded-md border border-input bg-background animate-pulse" />
        <div className="h-9 rounded-md border border-input bg-background animate-pulse" />
        <div className="h-9 rounded-md border border-input bg-background animate-pulse" />
      </div>
    </div>
  );
}
