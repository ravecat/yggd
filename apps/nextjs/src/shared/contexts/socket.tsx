"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { Socket as PhoenixSocket } from "phoenix";
import { getSocket } from "@yggd/shared";

interface SocketContextValue {
  socket: PhoenixSocket | null;
}

const SocketContext = createContext<SocketContextValue | undefined>(undefined);

interface SocketProps {
  children: ReactNode;
}

export function Socket({ children }: SocketProps) {
  const [socket, setSocket] = useState<PhoenixSocket | null>(null);

  useEffect(() => {
    const phoenixSocket = getSocket();
    setSocket(phoenixSocket);
  }, []);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket(): PhoenixSocket | null {
  const context = useContext(SocketContext);

  if (context === undefined) {
    throw new Error("useSocket must be used within Socket component");
  }

  return context.socket;
}
