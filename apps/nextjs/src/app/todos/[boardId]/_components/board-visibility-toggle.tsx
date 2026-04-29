"use client";

import { Eye, EyeOff } from "lucide-react";
import { type AttributesVisibilityEnum2Key, attributesVisibilityEnum2 } from "@rvct/shared";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { updateBoardVisibility } from "~/features/boards/mutations";
import { Button } from "~/shared/ui/button";

type Props = {
  id: string;
  visibility?: AttributesVisibilityEnum2Key;
};

export function BoardVisibilityToggle({
  id,
  visibility = attributesVisibilityEnum2.private,
}: Props) {
  const router = useRouter();
  const [currentVisibility, setCurrentVisibility] = useState(visibility);
  const [isPending, startTransition] = useTransition();
  const isPublic = currentVisibility === attributesVisibilityEnum2.public;
  const Icon = isPublic ? Eye : EyeOff;
  const label = isPublic ? "Public board" : "Private board";

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
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full justify-start gap-2 sm:w-auto"
        aria-label={label}
        aria-pressed={isPublic}
        disabled={isPending}
        onClick={() => handleVisibilityChange(!isPublic)}
      >
        <span className="inline-flex size-5 items-center justify-center rounded-full border border-current/15 bg-current/5">
          <Icon aria-hidden="true" className="size-3.5" />
        </span>
        <span>{label}</span>
      </Button>
    </div>
  );
}
