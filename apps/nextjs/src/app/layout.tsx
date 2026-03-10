import "../shared/global.css";
import { Footer } from "~/components/footer";
import { getRuntimeEnvScript } from "~/shared/lib/env";
import { Navbar } from "./_components/navbar";

export const metadata = {
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
        <script
          dangerouslySetInnerHTML={{
            __html: getRuntimeEnvScript(),
          }}
        />
        <div className="flex h-full flex-col">
          <Navbar />
          <main className="flex min-h-0 flex-1 flex-col">{children}</main>
          <Footer />
        </div>
        {modal}
      </body>
    </html>
  );
}
