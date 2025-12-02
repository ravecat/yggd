import {
  createContext,
  useContext,
  useRef,
  useEffect,
  type ReactNode,
} from "react";
import { Socket as PhoenixSocket } from "phoenix";

const SocketContext = createContext<PhoenixSocket | null>(null);

export interface SocketProps {
  children: ReactNode;
  url: string;
  opts?: { params?: Record<string, unknown> };
}

/**
 * Phoenix Socket context provider component.
 * Manages WebSocket connection lifecycle and provides socket instance to child components.
 *
 * @param props.children - React children to be wrapped with socket context
 * @param props.url - WebSocket URL (required)
 * @param props.opts - Socket options including connection parameters (defaults to { params: {} })
 *
 * @example
 * ```tsx
 * // Basic usage
 * <Socket url={process.env.PUBLIC_PHOENIX_URL}>
 *   <App />
 * </Socket>
 *
 * // Custom URL with auth token
 * <Socket
 *   url="wss://example.com/socket"
 *   opts={{ params: { token: "auth-token" } }}
 * >
 *   <App />
 * </Socket>
 * ```
 */
export function Socket({
  children,
  url,
  opts = { params: {} },
}: SocketProps) {
  const socketRef = useRef<PhoenixSocket>(null);

  if (!socketRef.current && typeof window !== "undefined") {
    socketRef.current = new PhoenixSocket(url, opts);
  }

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = new PhoenixSocket(url, opts);
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

/**
 * Hook to access Phoenix Socket instance from context.
 * Must be used within a Socket provider component.
 *
 * @returns Phoenix Socket instance
 * @throws Error if used outside Socket provider
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const socket = useSocket();
 *   const channel = socket.channel("room:lobby");
 *   return <div>Connected</div>;
 * }
 * ```
 */
export function useSocket() {
  const context = useContext(SocketContext);

  if (typeof window !== "undefined") {
    if (context === null) {
      throw new Error("useSocket must be used within Socket component");
    }
  }

  return context as PhoenixSocket;
}
