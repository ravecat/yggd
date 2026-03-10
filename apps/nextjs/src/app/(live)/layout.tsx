import { Providers } from "~/components/providers";

export default function LiveLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Providers>{children}</Providers>;
}
