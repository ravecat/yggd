"use client";

import { createContext, useContext, ReactNode } from "react";
import type { Environment } from "../env";

const EnvContext = createContext<Environment | null>(null);

export function EnvironmentProvider({
  children,
  env,
}: {
  children: ReactNode;
  env: Environment;
}) {
  return <EnvContext.Provider value={env}>{children}</EnvContext.Provider>;
}

export function useEnv(): Environment {
  const context = useContext(EnvContext);

  if (!context) {
    throw new Error("useEnv must be used within EnvironmentProvider");
  }

  return context;
}
