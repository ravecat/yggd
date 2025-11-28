"use client";

import { Socket } from "@rvct/shared/react";

export function SocketProvider({ children }: { children: React.ReactNode }) {
  return <Socket>{children}</Socket>;
}
