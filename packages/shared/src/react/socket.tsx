import {
  createContext,
  useContext,
  useRef,
  useEffect,
  type ReactNode,
} from "react";
import { Socket as PhoenixSocket } from "phoenix";

const SocketContext = createContext<PhoenixSocket | null>(null);

export function Socket({ children }: { children: ReactNode }) {
  const socketRef = useRef<PhoenixSocket>(null);

  if (!socketRef.current && typeof window !== "undefined") {
    socketRef.current = new PhoenixSocket(
      process.env.NEXT_PUBLIC_PHOENIX_URL as string,
      { params: {} }
    );
  }

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = new PhoenixSocket(
        process.env.NEXT_PUBLIC_PHOENIX_URL as string,
        { params: {} }
      );
    }

    socketRef.current?.connect();

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socketRef.current}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);

  if (typeof window !== "undefined") {
    if (context === null) {
      throw new Error("useSocket must be used within Socket component");
    }
  }

  return context!;
}
