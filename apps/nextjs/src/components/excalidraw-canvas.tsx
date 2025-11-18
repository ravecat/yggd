"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import type { ExcalidrawAPI } from "../shared/types";
import { ExcalidrawDocument } from "../shared/lib/excalidraw-document";
import type { ExcalidrawBinding } from "../shared/lib/excalidraw-binding";
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
  }
);

export function ExcalidrawCanvas() {
  const [api, setApi] = useState<ExcalidrawAPI | null>(null);
  const [binding, setBinding] = useState<ExcalidrawBinding | null>(null);

  useEffect(() => {
    if (!api) {
      return;
    }

    let currentBinding: ExcalidrawBinding | null = null;
    let ydoc: any = null;
    let provider: any = null;

    (async () => {
      const { ExcalidrawBinding } = await import(
        "../shared/lib/excalidraw-binding"
      );
      
      // Get singleton instance
      const instance = ExcalidrawDocument.getInstance();
      ydoc = instance.ydoc;
      provider = instance.provider;

      console.log("🏗️ [CANVAS] Creating new ExcalidrawBinding, Y.Doc clientID:", ydoc.clientID);

      currentBinding = new ExcalidrawBinding(
        ydoc.getArray("elements"),
        ydoc.getArray("assets"),
        api,
        provider.awareness
      );

      setBinding(currentBinding);
    })();

    return () => {
      console.log("🧹 [CANVAS] Cleaning up ExcalidrawBinding");
      currentBinding?.destroy();
      setBinding(null);
    };
  }, [api]);

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
