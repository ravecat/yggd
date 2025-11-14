"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { ExcalidrawBinding } from "y-excalidraw";
import { useExcalidrawDocument } from "../shared/hooks/use-excalidraw-document";
import type { ExcalidrawAPI } from "../shared/types";
import "@excalidraw/excalidraw/index.css";
import { useSocket } from "../shared/contexts/socket";

const Excalidraw = dynamic(
  async () => (await import("@excalidraw/excalidraw")).Excalidraw,
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-gray-400">Loading canvas...</div>
      </div>
    ),
  }
);

export function ExcalidrawCanvas() {
  const socket = useSocket();
  const { ydoc, provider } = useExcalidrawDocument(socket);
  const [api, setApi] = useState<ExcalidrawAPI | null>(null);
  const [binding, setBinding] = useState<ExcalidrawBinding | null>(null);

  useEffect(() => {
    if (!api || !ydoc || !provider) return;

    const binding = new ExcalidrawBinding(
      ydoc.getArray("elements"),
      ydoc.getMap("assets"),
      api,
      provider.awareness
    );

    setBinding(binding);

    return () => {
      binding.destroy();
      setBinding(null);
    };
  }, [api, ydoc, provider]);

  return (
    <div className="h-full w-full border border-gray-200 shadow-xs">
      <Excalidraw
        excalidrawAPI={setApi}
        onPointerUpdate={binding?.onPointerUpdate}
        theme="light"
        gridModeEnabled={true}
      />
    </div>
  );
}
