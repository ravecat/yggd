export function TodosSkeleton() {
  return (
    <div className="p-4">
      <div className="grid min-h-[26rem] gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, columnIndex) => (
          <section key={columnIndex} className="flex min-h-[26rem] flex-col">
            <header className="flex items-center justify-between border-b border-border py-2.5">
              <div className="h-4 w-32 animate-pulse rounded bg-muted" />
              <div className="h-4 w-14 animate-pulse rounded bg-muted" />
            </header>

            <div className="flex flex-1 flex-col gap-2.5 py-3">
              {Array.from({ length: 3 }).map((_, cardIndex) => (
                <article
                  key={cardIndex}
                  className="rounded-lg border border-border bg-card p-3 shadow-sm"
                >
                  <div className="mb-2 h-4 w-10/12 animate-pulse rounded bg-muted" />
                  <div className="mb-1.5 h-3 w-full animate-pulse rounded bg-muted/80" />
                  <div className="mb-3 h-3 w-8/12 animate-pulse rounded bg-muted/80" />
                  <div className="h-5 w-16 animate-pulse rounded bg-muted" />
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
