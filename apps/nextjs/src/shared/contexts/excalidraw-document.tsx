// Ваш файл с ExcalidrawDocument
"use client";

import * as Y from "yjs";
import { PhoenixChannelProvider } from "y-phoenix-channel";
import { IndexeddbPersistence } from "y-indexeddb";
import { createContext, useContext, type ReactNode } from "react";
import { ExcalidrawDocument as ExcalidrawDocSingleton } from "../lib/excalidraw-document";

interface ExcalidrawDocumentContextValue {
  ydoc: Y.Doc;
  provider: PhoenixChannelProvider;
  persistence: IndexeddbPersistence;
}

const ExcalidrawDocumentContext = createContext<
  ExcalidrawDocumentContextValue | undefined
>(undefined);

interface ExcalidrawDocumentProps {
  children: ReactNode;
  docname?: string;
}

export function ExcalidrawDocument({
  children,
  docname = "excalidraw",
}: ExcalidrawDocumentProps) {
  const { ydoc, provider, persistence } =
    ExcalidrawDocSingleton.getInstance(docname);

  return (
    <ExcalidrawDocumentContext.Provider value={{ ydoc, provider, persistence }}>
      {children}
    </ExcalidrawDocumentContext.Provider>
  );
}

export function useExcalidrawDocument(): ExcalidrawDocumentContextValue {
  const context = useContext(ExcalidrawDocumentContext);

  if (!context) {
    throw new Error(
      "useExcalidrawDocument must be used within ExcalidrawDocument"
    );
  }

  return context;
}
