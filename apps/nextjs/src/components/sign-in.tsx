import { LogIn, LogOut } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { verifySession } from "@/shared/lib/session";
import { signup, signout } from "@/app/actions/auth";

export async function SignIn() {
  const { isAuthenticated } = await verifySession();

  if (isAuthenticated) {
    return (
      <form action={signout}>
        <Button type="submit" variant="outline">
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </form>
    );
  }

  return (
    <form action={signup}>
      <Button type="submit" variant="outline">
        <LogIn className="h-4 w-4 mr-2" />
        Sign in with Google
      </Button>
    </form>
  );
}
