"use client";

import { env } from "~/shared/lib/env";

export function Footer() {
  return (
    <footer>
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3 text-sm">
          <span>
            <a
              className="underline underline-offset-2"
              href={`${env.PUBLIC_API_URL}/openapi/ui`}
              rel="noreferrer"
              target="_blank"
            >
              openapi
            </a>{" "}
            (
            <a
              className="underline underline-offset-2"
              href={`${env.PUBLIC_API_URL}/openapi`}
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
              href={`${env.PUBLIC_API_URL}/asyncapi/ui`}
              rel="noreferrer"
              target="_blank"
            >
              asyncapi
            </a>{" "}
            (
            <a
              className="underline underline-offset-2"
              href={`${env.PUBLIC_API_URL}/asyncapi`}
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
