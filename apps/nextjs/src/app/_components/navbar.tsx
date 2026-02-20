import { Suspense } from "react";
import { NavLinks } from "./nav-links";
import { PageSwitcher } from "./page-switcher";
import { SignIn } from "~/components/sign-in";

function SignInFallback() {
  return <div className="h-9 w-40 animate-pulse rounded-md bg-gray-200" />;
}

export function Navbar() {
  return (
    <header className="border-border bg-background">
      <div className="mx-auto grid h-14 w-full max-w-6xl grid-cols-3 items-center gap-4 px-4">
        <div className="flex items-center">
          <PageSwitcher />
        </div>
        <div className="flex items-center justify-center">
          <NavLinks />
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
