import * as Y from "yjs";
import type { IndexeddbPersistence } from "y-indexeddb";
import type { PhoenixChannelProvider } from "y-phoenix-channel";
import type { Socket } from "phoenix";
import { generateUsername } from "friendly-username-generator";

let ydoc: Y.Doc | null = null;
let persistence: IndexeddbPersistence | null = null;
let provider: PhoenixChannelProvider | null = null;

export async function getExcalidrawDocument(socket: Socket, docname = "excalidraw") {
  if (typeof window === "undefined") {
    throw new Error("ExcalidrawDocument can only be initialized on the client");
  }

  if (ydoc && persistence && provider) {
    return { ydoc, persistence, provider };
  }

  if (ydoc || persistence || provider) {
    provider?.destroy();
    persistence?.destroy();
    ydoc = null;
    persistence = null;
    provider = null;
  }

  const { IndexeddbPersistence } = await import("y-indexeddb");
  const { PhoenixChannelProvider } = await import("y-phoenix-channel");

  ydoc = new Y.Doc();

  persistence = new IndexeddbPersistence(`excalidraw:${docname}`, ydoc);

  const room = `y_doc_room:${persistence.name}`;

  provider = new PhoenixChannelProvider(socket, room, ydoc);

  const username = generateUsername();
  provider.awareness.setLocalStateField("user", { name: username });

  return { ydoc, persistence, provider };
}