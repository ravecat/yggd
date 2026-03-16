export type Framework = {
  id: string;
  label: string;
  href: string;
};

export const navLinks = [
  { href: "/", label: "Todo", value: "todo" },
  { href: "/canvas", label: "Canvas", value: "canvas" },
  { href: "/telemetry", label: "Telemetry", value: "telemetry" },
  { href: "/chart", label: "Chart", value: "chart" },
] as const;
