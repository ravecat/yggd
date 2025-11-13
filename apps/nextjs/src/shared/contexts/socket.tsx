"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { Socket as PhoenixSocket } from "phoenix";
import { getSocket } from "@yggd/shared";

interface SocketContextValue {
  socket: PhoenixSocket;
}

const SocketContext = createContext<SocketContextValue | undefined>(undefined);

interface SocketProps {
  children: ReactNode;
}

export function Socket({ children }: SocketProps) {
  const socket = useMemo(() => getSocket(), []);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket(): PhoenixSocket {
  const context = useContext(SocketContext);

  if (context === undefined) {
    throw new Error("useSocket must be used within Socket component");
  }

  return context.socket;
}
