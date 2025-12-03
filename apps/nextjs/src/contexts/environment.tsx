"use client";

import { createContext, useContext, ReactNode } from "react";

const EnvContext = createContext<Record<string, string | undefined> | null>(
  null
);

export function Environment({
  children,
  env,
}: {
  children: ReactNode;
  env: Record<string, string | undefined>;
}) {
  return <EnvContext.Provider value={env}>{children}</EnvContext.Provider>;
}

export function useEnv() {
  const context = useContext(EnvContext);

  if (!context) {
    throw new Error("useEnv must be used within Environment provider");
  }

  return context;
}
