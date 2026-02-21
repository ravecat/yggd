"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "~/shared/ui/tabs";

const links = [
  { href: "/", label: "Todo", value: "todo" },
  { href: "/canvas", label: "Canvas", value: "canvas" },
  { href: "/telemetry", label: "Telemetry", value: "telemetry" },
  { href: "/chart", label: "Chart", value: "chart" },
] as const;

function getActiveValue(pathname: string): (typeof links)[number]["value"] {
  if (pathname === "/canvas" || pathname.startsWith("/canvas/")) {
    return "canvas";
  }
  if (pathname === "/telemetry" || pathname.startsWith("/telemetry/")) {
    return "telemetry";
  }
  if (pathname === "/chart" || pathname.startsWith("/chart/")) {
    return "chart";
  }

  return "todo";
}

export function NavLinks() {
  const pathname = usePathname();
  const activeValue = getActiveValue(pathname);

  return (
    <nav aria-label="Primary" className="w-full min-w-0 sm:w-auto">
      <Tabs value={activeValue} className="w-full sm:w-auto">
        <TabsList className="h-9 w-full overflow-hidden p-0.5 sm:w-auto">
          {links.map((link) => (
            <TabsTrigger
              key={link.href}
              value={link.value}
              asChild
              className="h-8 min-w-0 flex-1 px-3"
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
