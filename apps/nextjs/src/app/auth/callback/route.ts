/**
 * OAuth callback handler
 * 
 * This Route Handler receives the authorization code from Ash Framework
 * after successful Google OAuth authentication.
 */

import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForToken } from "~/app/actions/auth";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  const appUrl = process.env.APP_URL;

  if (error) {
    console.error("OAuth error:", error);
    return NextResponse.redirect(
      new URL(`/?error=${encodeURIComponent(error)}`, appUrl)
    );
  }

  // Validate authorization code presence
  if (!code) {
    console.error("Missing authorization code in callback");
    return NextResponse.redirect(new URL("/?error=missing_code", appUrl));
  }

  try {
    await exchangeCodeForToken(code);

    console.log("OAuth callback successful, token stored in cookie");

    return NextResponse.redirect(new URL("/", appUrl));
  } catch (error) {
    console.error("Token exchange error:", error);
    return NextResponse.redirect(
      new URL("/?error=exchange_failed", appUrl)
    );
  }
}

