import * as Y from "yjs";
import { IndexeddbPersistence } from "y-indexeddb";
import { PhoenixChannelProvider } from "./y-phoenix-channel";
import { generateUsername } from "friendly-username-generator";
import { getSocket } from "@yggd/shared";

// Create instances at module level (singleton pattern)
const socket = getSocket();
const ydoc = new Y.Doc();
const docname = "excalidraw:excalidraw";
const persistence = new IndexeddbPersistence(docname, ydoc);
const roomname = `y_doc_room:${docname}`;

const provider = new PhoenixChannelProvider(socket, roomname, ydoc);

const username = generateUsername();
provider.awareness.setLocalStateField("user", { name: username });

export class ExcalidrawDocument {
  private constructor() {}

  public static getInstance(): {
    ydoc: Y.Doc;
    provider: PhoenixChannelProvider;
    persistence: IndexeddbPersistence;
  } {
    return {
      ydoc,
      provider,
      persistence,
    };
  }
}