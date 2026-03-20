"use client";

import type { MouseEvent } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "~/shared/ui/button";

export function ThemeToggle() {
  const dispatchThemeEvent = (event: MouseEvent<HTMLButtonElement>) => {
    event.currentTarget.dispatchEvent(
      new CustomEvent("moda:set-theme", {
        bubbles: true,
      }),
    );
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="size-9 shrink-0 p-0"
      aria-label="Toggle theme"
      title="Toggle theme"
      onClick={dispatchThemeEvent}
    >
      <Moon className="dark:hidden" />
      <Sun className="hidden dark:block" />
    </Button>
  );
}
