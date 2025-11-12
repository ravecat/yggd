"use client";

import dynamic from "next/dynamic";
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
  return (
    <div className="h-full w-full border border-gray-200 shadow-xs">
      <Excalidraw theme="light" gridModeEnabled={true} />
    </div>
  );
}
