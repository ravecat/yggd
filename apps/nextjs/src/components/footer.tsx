import { connection } from "next/server";

export function FooterFallback() {
  return (
    <footer aria-hidden="true">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3 text-sm">
          <div className="h-4 w-28 animate-pulse rounded bg-muted" />
          <div className="h-4 w-28 animate-pulse rounded bg-muted" />
        </div>
        <div className="h-4 w-16 animate-pulse rounded bg-muted" />
      </div>
    </footer>
  );
}

export async function Footer() {
  await connection();

  const publicApiUrl = (process.env.PUBLIC_API_URL ?? "").replace(/\/$/, "");

  return (
    <footer>
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3 text-sm">
          <span>
            <a
              className="underline underline-offset-2"
              href={`${publicApiUrl}/openapi/ui`}
              rel="noreferrer"
              target="_blank"
            >
              openapi
            </a>{" "}
            (
            <a
              className="underline underline-offset-2"
              href={`${publicApiUrl}/openapi`}
              rel="noreferrer"
              target="_blank"
            >
              raw
            </a>
            )
          </span>
          <span>
            <a
              className="underline underline-offset-2"
              href={`${publicApiUrl}/asyncapi/ui`}
              rel="noreferrer"
              target="_blank"
            >
              asyncapi
            </a>{" "}
            (
            <a
              className="underline underline-offset-2"
              href={`${publicApiUrl}/asyncapi`}
              rel="noreferrer"
              target="_blank"
            >
              raw
            </a>
            )
          </span>
        </div>
        <a
          className="underline underline-offset-2 text-sm"
          href="https://github.com/ravecat/moda"
          rel="noreferrer"
          target="_blank"
        >
          source
        </a>
      </div>
    </footer>
  );
}
