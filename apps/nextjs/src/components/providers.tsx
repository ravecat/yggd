"use client";

import { Socket } from "@rvct/shared/react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Socket url={process.env.NEXT_PUBLIC_PHOENIX_URL as string}>
      {children}
    </Socket>
  );
}
