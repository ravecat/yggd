import { cookies } from "next/headers";
import { SignInClient } from "./sign-in-client";

export async function SignIn() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token");
  const isAuthenticated = !!token;

  return <SignInClient isAuthenticated={isAuthenticated} />;
}
