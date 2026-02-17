import { Suspense } from "react";
import { NavLinks } from "./nav-links";
import { SignIn } from "@/components/sign-in";

function SignInFallback() {
  return <div className="h-9 w-40 animate-pulse rounded-md bg-gray-200" />;
}

export function Navbar() {
  return (
    <header className="border-border bg-background">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 px-4">
        <NavLinks />
        <Suspense fallback={<SignInFallback />}>
          <SignIn />
        </Suspense>
      </div>
    </header>
  );
}
