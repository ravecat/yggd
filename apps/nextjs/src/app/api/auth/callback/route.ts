import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const ELIXIR_BACKEND = process.env.NEXT_PUBLIC_ASH_BACKEND_URL || "http://localhost:4000";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      new URL(`/?error=${encodeURIComponent(error)}`, request.url)
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL("/?error=No authorization code received", request.url)
    );
  }

  try {
    // Exchange authorization code for JWT token (server-to-server)
    const response = await fetch(`${ELIXIR_BACKEND}/auth/exchange`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Token exchange failed:", errorData);
      return NextResponse.redirect(
        new URL(`/?error=${encodeURIComponent(errorData.error || "Authentication failed")}`, request.url)
      );
    }

    const { token } = await response.json();

    console.log("Received token from backend:", token);

    // Store token in httpOnly cookie for security
    const cookieStore = await cookies();
    cookieStore.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    console.log("Authentication successful, token stored in cookie");
    return NextResponse.redirect(new URL("/?authenticated=true", request.url));
  } catch (error) {
    console.error("Token exchange error:", error);
    return NextResponse.redirect(
      new URL("/?error=Authentication failed", request.url)
    );
  }
}
