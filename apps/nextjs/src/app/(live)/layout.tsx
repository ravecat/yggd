"use client";

import { Socket } from "@rvct/shared/react";
import { env } from "~/shared/lib/env";

export default function LiveLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Socket url={env.PUBLIC_CHANNEL_URL}>{children}</Socket>;
}
