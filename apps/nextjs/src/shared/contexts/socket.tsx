"use client";

import { createContext, useContext, useRef, useEffect, type ReactNode } from "react";
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
  const socketRef = useRef<PhoenixSocket>(getSocket());

  useEffect(() => {
    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current }}>
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
