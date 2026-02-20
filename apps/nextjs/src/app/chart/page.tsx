export default function ChartPage() {
  return (
    <div className="h-full overflow-auto">
      <div className="mx-auto flex min-h-full w-full max-w-6xl flex-col gap-4 px-4 py-4">
        <div className="flex min-h-80 flex-1 items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 px-6 text-center">
          <div className="space-y-2">
            <p className="text-lg font-medium text-foreground">
              No chart data yet
            </p>
            <p className="text-sm text-muted-foreground">
              Market data will appear here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
