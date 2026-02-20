"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "~/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
} from "~/shared/ui/dropdown-menu";

const frameworks = [{ id: "nextjs", label: "Next.js" }] as const;

function getFrameworkFromHostname(hostname: string) {
  const subdomain = hostname.split(".")[0];
  return frameworks.find((f) => f.id === subdomain);
}

export function PageSwitcher() {
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "";
  const current = getFrameworkFromHostname(hostname) ?? frameworks[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="min-w-31 justify-between"
        >
          {current.label}
          <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[160px]">
        <DropdownMenuLabel>Frameworks</DropdownMenuLabel>
        {frameworks.map((fw) => (
          <DropdownMenuItem key={fw.id} asChild>
            <a
              href={`https://${fw.id}.moda.ravecat.io`}
              className="flex items-center justify-between"
            >
              {fw.label}
              {fw.id === current.id && <Check className="h-4 w-4 opacity-50" />}
            </a>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
