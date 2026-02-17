import { ExcalidrawCanvas } from "./_components/excalidraw-canvas";

export default function CanvasPage() {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 px-4 py-4">
        <ExcalidrawCanvas />
      </div>
    </div>
  );
}
