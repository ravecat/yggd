"use client";

import { Socket } from "@yggd/shared/react";

export function SocketProvider({ children }: { children: React.ReactNode }) {
  return <Socket>{children}</Socket>;
}
