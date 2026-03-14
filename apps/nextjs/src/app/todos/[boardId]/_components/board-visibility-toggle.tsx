"use client";

import { attributesVisibilityEnum2 } from "@rvct/shared";
import { useRouter } from "next/navigation";
import { useId, useState, useTransition } from "react";
import { updateBoardVisibility } from "~/features/boards/mutations";
import { Label } from "~/shared/ui/label";

type Props = {
  id: string;
  visibility?: "private" | "public";
};

export function BoardVisibilityToggle({
  id,
  visibility = attributesVisibilityEnum2.private,
}: Props) {
  const router = useRouter();
  const visibilityId = useId();
  const [currentVisibility, setCurrentVisibility] = useState(visibility);
  const [isPending, startTransition] = useTransition();
  const isPublic = currentVisibility === attributesVisibilityEnum2.public;

  const handleVisibilityChange = (checked: boolean) => {
    const previousVisibility = currentVisibility;
    const nextVisibility = checked
      ? attributesVisibilityEnum2.public
      : attributesVisibilityEnum2.private;

    setCurrentVisibility(nextVisibility);

    startTransition(async () => {
      const result = await updateBoardVisibility(id, nextVisibility);

      if (result.errors) {
        setCurrentVisibility(previousVisibility);
        return;
      }

      setCurrentVisibility(result.visibility ?? nextVisibility);
      router.refresh();
    });
  };

  return (
    <div className="w-full shrink-0 space-y-1 sm:w-auto">
      <Label
        htmlFor={visibilityId}
        className="inline-flex h-9 w-full items-center gap-2 rounded-md border border-input bg-background px-3 whitespace-nowrap sm:w-auto"
      >
        <input
          id={visibilityId}
          type="checkbox"
          className="size-4 rounded border-input accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          checked={isPublic}
          disabled={isPending}
          onChange={(event) =>
            handleVisibilityChange(event.currentTarget.checked)
          }
        />
        Public
      </Label>
    </div>
  );
}
