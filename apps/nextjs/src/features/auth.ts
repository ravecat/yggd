"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { generateCodeVerifier, generateCodeChallenge } from "~/shared/lib/pkce";
import { clearSession, setSession } from "~/shared/lib/session";

export async function signup() {
  const verifier = generateCodeVerifier();
  const challenge = generateCodeChallenge(verifier);
  const cookieStore = await cookies();
  const appUrl = process.env.NEXTJS_APP_URL;

  cookieStore.set("pkce_verifier", verifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10,
  });

  const callbackUri = `${appUrl}/auth/callback`;
  const oauthUrl = new URL("/auth/user/google", process.env.PUBLIC_API_URL);

  oauthUrl.searchParams.set("redirect_uri", callbackUri);
  oauthUrl.searchParams.set("code_challenge", challenge);
  oauthUrl.searchParams.set("code_challenge_method", "S256");

  redirect(oauthUrl.toString());
}

export async function signout() {
  await clearSession();
  redirect("/");
}

export async function exchangeCodeForToken(code: string): Promise<string> {
  const cookieStore = await cookies();
  const verifier = cookieStore.get("pkce_verifier")?.value;

  if (!verifier) {
    throw new Error("PKCE verifier not found in cookie");
  }

  const response = await fetch(
    `${process.env.AUTH_SERVICE_URL}/auth/exchange`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, code_verifier: verifier }),
    },
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token exchange failed: ${error}`);
  }

  const { token } = await response.json();

  await setSession(token);

  cookieStore.delete("pkce_verifier");

  return token;
}
