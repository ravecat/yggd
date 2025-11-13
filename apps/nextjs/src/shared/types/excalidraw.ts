import type { ComponentProps } from "react";
import type { Excalidraw } from "@excalidraw/excalidraw";

export type ExcalidrawAPI = NonNullable<
  Parameters<NonNullable<ComponentProps<typeof Excalidraw>["excalidrawAPI"]>>[0]
>;
