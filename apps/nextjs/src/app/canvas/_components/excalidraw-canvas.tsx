"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import type { ExcalidrawAPI } from "~/shared/types";
import { getExcalidrawDocument } from "@rvct/shared";
import { useSocket } from "@rvct/shared/react";
import { ExcalidrawBinding } from "y-excalidraw";
import "@excalidraw/excalidraw/index.css";

const Excalidraw = dynamic(
  async () => (await import("@excalidraw/excalidraw")).Excalidraw,
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-gray-400">Loading canvas...</div>
      </div>
    ),
  },
);

export function ExcalidrawCanvas() {
  const socket = useSocket();

  const [api, setApi] = useState<ExcalidrawAPI | null>(null);
  const [binding, setBinding] = useState<ExcalidrawBinding | null>(null);

  useEffect(() => {
    if (!api) {
      return;
    }

    let currentBinding: ExcalidrawBinding | null = null;

    (async () => {
      const { ydoc, provider } = await getExcalidrawDocument(socket);

      currentBinding = new ExcalidrawBinding(
        ydoc.getArray<any>("elements"),
        ydoc.getMap<any>("assets"),
        api,
        provider.awareness,
      );

      setBinding(currentBinding);
    })();

    return () => {
      currentBinding?.destroy();
      setBinding(null);
    };
  }, [api, socket]);

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
