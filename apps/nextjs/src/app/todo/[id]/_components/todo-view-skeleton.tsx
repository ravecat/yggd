export function TodoViewSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="mb-4 h-6 w-3/4 rounded bg-gray-200" />
      <div className="mb-6 h-4 w-1/2 rounded bg-gray-200" />
      <div className="space-y-2">
        <div className="h-3 rounded bg-gray-200" />
        <div className="h-3 w-5/6 rounded bg-gray-200" />
        <div className="h-3 w-2/3 rounded bg-gray-200" />
      </div>
    </div>
  );
}
