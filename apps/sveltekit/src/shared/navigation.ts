export const frameworks = [
  {
    id: "nextjs",
    label: "Next.js",
    href: "https://nextjs.moda.ravecat.io",
  },
  {
    id: "sveltekit",
    label: "SvelteKit",
    href: "https://sveltekit.moda.ravecat.io",
  },
] as const;

export const defaultFramework = frameworks[1];

export function getFrameworkByHostname(hostname: string) {
  const subdomain = hostname.split(".")[0];

  return frameworks.find((framework) => framework.id === subdomain);
}

export const navLinks = [
  { href: "/", label: "Todo", value: "todo" },
  { href: "/canvas", label: "Canvas", value: "canvas" },
  { href: "/telemetry", label: "Telemetry", value: "telemetry" },
  { href: "/chart", label: "Chart", value: "chart" },
] as const;

export type NavLinkValue = (typeof navLinks)[number]["value"];

export function getActiveNavValue(pathname: string): NavLinkValue {
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
