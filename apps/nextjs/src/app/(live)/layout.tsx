import { Suspense } from "react";
import { connection } from "next/server";
import { LiveSocketProvider } from "./_components/live-socket-provider";

export async function LiveLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  await connection();

  const publicChannelUrl = (process.env.PUBLIC_CHANNEL_URL ?? "").replace(
    /\/$/,
    "",
  );

  return (
    <LiveSocketProvider url={publicChannelUrl}>{children}</LiveSocketProvider>
  );
}

export default function LiveLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={null}>
      <LiveLayoutContent>{children}</LiveLayoutContent>
    </Suspense>
  );
}
