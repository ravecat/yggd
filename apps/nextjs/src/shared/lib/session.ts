import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { jwtVerify, type JWTPayload } from "jose";

const SESSION_COOKIE_NAME = "token";

const TOKEN_SIGNING_KEY = new TextEncoder().encode(
  process.env.TOKEN_SIGNING_SECRET,
);

export async function setSession(token: string) {
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function verifyToken(
  token: string | undefined = "",
): Promise<JWTPayload | null> {
  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, TOKEN_SIGNING_KEY, {
      algorithms: ["HS256"],
    });

    return payload;
  } catch (error) {
    console.error("Failed to verify token:", error);
    return null;
  }
}

export const assigns = cache(async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  const session = await verifyToken(token);

  if (!session?.sub) {
    return { userId: null, token: null };
  }

  const match = session.sub.match(/id=([a-f0-9-]+)/i);
  const userId = match ? match[1] : null;

  if (!userId) {
    return { userId: null, token: null };
  }

  return { userId, token: token ?? null };
});
