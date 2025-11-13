import { Socket } from "phoenix";

let globalSocket: Socket | null = null;

/**
 * Get or create the global Phoenix socket connection.
 * Socket is created once and persists for the application lifetime.
 * Browser automatically closes the connection when page is closed.
 */
export function getSocket(): Socket {
  if (typeof window === "undefined") {
    throw new Error("Socket can only be created on client side");
  }

  if (!globalSocket) {
    globalSocket = new Socket("/socket", {
      params: {},
    });
    globalSocket.connect();
  }

  return globalSocket;
}
