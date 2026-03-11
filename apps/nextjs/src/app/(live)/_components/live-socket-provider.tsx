"use client";

import { Socket } from "@rvct/shared/react";

export function LiveSocketProvider({
  children,
  url,
}: {
  children: React.ReactNode;
  url: string;
}) {
  return <Socket url={url}>{children}</Socket>;
}
