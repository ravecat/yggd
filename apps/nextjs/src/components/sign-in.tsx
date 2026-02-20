import { LogIn, LogOut } from "lucide-react";
import { Button } from "~/shared/ui/button";
import { assigns } from "~/shared/lib/session";
import { signup, signout } from "~/app/actions/auth";

export async function SignIn() {
  const { userId } = await assigns();

  if (userId) {
    return (
      <form action={signout}>
        <Button type="submit" variant="outline" size="sm" className="min-w-31">
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </form>
    );
  }

  return (
    <form action={signup}>
      <Button type="submit" variant="outline" size="sm" className="min-w-31">
        <LogIn className="h-4 w-4 mr-2" />
        Sign in with Google
      </Button>
    </form>
  );
}
