import { headers } from "next/headers";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "~/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "~/shared/ui/dropdown-menu";

export type SwitcherItem = {
  id: string;
  href: string;
  current: boolean;
};

export async function Switcher() {
  const host = (await headers()).get("host");

  const data = [
    { id: "nextjs", href: process.env.NEXTJS_APP_URL },
    { id: "sveltekit", href: process.env.SVELTEKIT_APP_URL },
    { id: "preact", href: process.env.PREACT_APP_URL },
  ]
    .filter((framework): framework is Omit<SwitcherItem, "current"> => Boolean(framework.href))
    .map((framework) => ({
      ...framework,
      current: new URL(framework.href).host === host,
    }));

  const current = data.find((framework) => framework.current) ?? data[0];

  if (!current) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="min-w-31 justify-between">
          {current.id}
          <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[160px]">
        {data.map((framework) => (
          <DropdownMenuItem key={framework.id} asChild>
            <a href={framework.href} className="flex items-center justify-between">
              {framework.id}
              {framework.id === current.id && <Check className="h-4 w-4 opacity-50" />}
            </a>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
