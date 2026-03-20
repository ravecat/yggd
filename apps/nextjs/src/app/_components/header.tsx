import { Suspense } from "react";
import { Navbar, NavbarFallback } from "./navbar";
import { Switcher } from "./switcher";
import { ThemeToggle } from "./theme-toggle";
import { SignIn, SignInFallback } from "~/components/sign-in";

function SwitcherFallback() {
  return <div aria-hidden="true" className="h-9 min-w-31 rounded-md border" />;
}

export function Header() {
  return (
    <header className="border-border bg-background">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-2 sm:grid sm:h-14 sm:grid-cols-3 sm:py-0">
        <div className="flex items-center">
          <Suspense fallback={<SwitcherFallback />}>
            <Switcher />
          </Suspense>
        </div>
        <div className="order-last flex w-full items-center justify-center sm:order-0 sm:w-auto">
          <Suspense fallback={<NavbarFallback />}>
            <Navbar />
          </Suspense>
        </div>
        <div className="flex items-center justify-end gap-2">
          <Suspense fallback={<SignInFallback />}>
            <SignIn />
          </Suspense>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
