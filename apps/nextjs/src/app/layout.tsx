import "../shared/global.css";
import { Suspense } from "react";
import type { Metadata } from "next";
import { Footer, FooterFallback } from "~/components/footer";
import { Navbar } from "./_components/navbar";

export const metadata: Metadata = {
  title: "Welcome to nextjs",
};

export default function Layout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="flex h-full flex-col">
          <Navbar />
          <main className="flex min-h-0 flex-1 flex-col">{children}</main>
          <Suspense fallback={<FooterFallback />}>
            <Footer />
          </Suspense>
        </div>
        {modal}
      </body>
    </html>
  );
}
