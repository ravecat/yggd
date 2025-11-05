"use client";

import { LogIn, LogOut } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { auth } from "@/shared/utils/auth";

interface SignInClientProps {
  isAuthenticated: boolean;
}

export function SignInClient({ isAuthenticated }: SignInClientProps) {
  const handleSignIn = () => {
    window.location.href = auth.getGoogleLoginUrl();
  };

  const handleSignOut = async () => {
    await auth.signOut();
  };

  if (isAuthenticated) {
    return (
      <Button variant="outline" onClick={handleSignOut}>
        <LogOut className="h-4 w-4 mr-2" />
        Sign Out
      </Button>
    );
  }

  return (
    <Button variant="outline" onClick={handleSignIn}>
      <LogIn className="h-4 w-4 mr-2" />
      Sign in with Google
    </Button>
  );
}
