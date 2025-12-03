"use client";

import { Socket } from "@rvct/shared/react";
import { useEnv } from "../contexts/environment";

export function Providers({ children }: { children: React.ReactNode }) {
  const env = useEnv();

  return (
    <Socket url={env.PUBLIC_CHANNEL_URL as string}>{children}</Socket>
  );
}
