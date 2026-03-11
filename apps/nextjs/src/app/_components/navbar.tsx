import { Suspense } from "react";
import { NavLinks, NavLinksFallback } from "./nav-links";
import { PageSwitcher } from "./page-switcher";
import { SignIn, SignInFallback } from "~/components/sign-in";

export function Navbar() {
  return (
    <header className="border-border bg-background">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-2 sm:grid sm:h-14 sm:grid-cols-3 sm:py-0">
        <div className="flex items-center">
          <PageSwitcher />
        </div>
        <div className="order-last flex w-full items-center justify-center sm:order-0 sm:w-auto">
          <Suspense fallback={<NavLinksFallback />}>
            <NavLinks />
          </Suspense>
        </div>
        <div className="flex items-center justify-end">
          <Suspense fallback={<SignInFallback />}>
            <SignIn />
          </Suspense>
        </div>
      </div>
    </header>
  );
}
