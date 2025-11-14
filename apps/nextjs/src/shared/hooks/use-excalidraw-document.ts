"use client";

import { useState, useEffect } from "react";
import * as Y from "yjs";
import { PhoenixChannelProvider } from "y-phoenix-channel";
import { IndexeddbPersistence } from "y-indexeddb";
import { generateUsername } from "friendly-username-generator";
import type { Socket } from "phoenix";

interface UseExcalidrawDocumentOptions {
  docname?: string;
}

interface UseExcalidrawDocumentReturn {
  ydoc: Y.Doc | null;
  provider: PhoenixChannelProvider | null;
}

export function useExcalidrawDocument(
  socket: Socket | null,
  options: UseExcalidrawDocumentOptions = {}
): UseExcalidrawDocumentReturn {
  const [ydoc, setYdoc] = useState<Y.Doc | null>(null);
  const [provider, setProvider] = useState<PhoenixChannelProvider | null>(null);

  useEffect(() => {
    if (!socket) return;

    const doc = new Y.Doc();
    setYdoc(doc);

    const docname = `excalidraw:${
      options.docname ??
      new URLSearchParams(window.location.search).get("docname") ??
      "excalidraw"
    }`;

    const persistence = new IndexeddbPersistence(docname, doc);

    const phoenixProvider = new PhoenixChannelProvider(
      socket,
      `y_doc_room:${persistence.name}`,
      doc
    );
    setProvider(phoenixProvider);

    phoenixProvider.awareness.setLocalStateField("user", {
      name: generateUsername(),
    });

    return () => {
      phoenixProvider.destroy();
      persistence.destroy();
    };
  }, [socket, options.docname]);

  return { ydoc, provider };
}
