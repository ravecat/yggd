import { Socket } from "phoenix";

let globalSocket: Socket | null = null;

/**
 * Get or create the global Phoenix socket connection.
 * Socket is created once and persists for the application lifetime.
 * Browser automatically closes the connection when page is closed.
 */
export function getSocket(): Socket {
  if (typeof window === "undefined") {
    return globalSocket as Socket;
  }

  if (!globalSocket) {
    const socketUrl = process.env.NEXT_PUBLIC_PHOENIX_URL || "ws://localhost:4001/socket";
    
    globalSocket = new Socket(socketUrl, {
      params: {},
    });
    
    globalSocket.onError((error) => {
      console.error("Socket connection error:", error);
    });
    
    globalSocket.connect();
  }

  return globalSocket;
}
