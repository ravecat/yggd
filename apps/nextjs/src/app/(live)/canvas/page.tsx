import { ExcalidrawCanvas } from "./_components/excalidraw-canvas";

export default function CanvasPage() {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-4">
        <p className="py-2 text-sm text-muted-foreground">
          Collaborative whiteboard with real-time shared state (CRDT, Phoenix
          Channels)
        </p>
      </div>
      <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 px-4 pb-4">
        <ExcalidrawCanvas />
      </div>
    </div>
  );
}
