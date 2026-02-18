"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "~/shared/ui/tabs";

const links = [
  { href: "/", label: "Todo", value: "todo" },
  { href: "/canvas", label: "Canvas", value: "canvas" },
] as const;

function getActiveValue(pathname: string): (typeof links)[number]["value"] {
  if (pathname === "/canvas" || pathname.startsWith("/canvas/")) {
    return "canvas";
  }

  return "todo";
}

export function NavLinks() {
  const pathname = usePathname();
  const activeValue = getActiveValue(pathname);

  return (
    <nav aria-label="Primary">
      <Tabs value={activeValue} className="w-auto">
        <TabsList className="h-9 w-auto overflow-hidden p-0.5">
          {links.map((link) => (
            <TabsTrigger
              key={link.href}
              value={link.value}
              asChild
              className="h-8 flex-none px-3"
              aria-current={activeValue === link.value ? "page" : undefined}
            >
              <Link href={link.href}>{link.label}</Link>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </nav>
  );
}
