import "../shared/global.css";
import { Suspense } from "react";
import type { Metadata } from "next";
import { Footer, FooterFallback } from "~/components/footer";
import { Header } from "./_components/header";

const themeControllerScript = `
  (() => {
    const root = document.documentElement;

    const setTheme = (theme) => {
      localStorage.setItem("moda:theme", theme);
      root.setAttribute("data-theme", theme);
    };

    if (!root.hasAttribute("data-theme")) {
      setTheme(localStorage.getItem("moda:theme") === "dark" ? "dark" : "light");
    }

    window.addEventListener("storage", (event) => {
      if (event.key === "moda:theme") {
        setTheme(event.newValue === "dark" ? "dark" : "light");
      }
    });

    window.addEventListener("moda:set-theme", () => {
      setTheme(root.getAttribute("data-theme") === "dark" ? "light" : "dark");
    });
  })();
`;

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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeControllerScript }} />
      </head>
      <body>
        <div className="flex h-full flex-col">
          <Header />
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
