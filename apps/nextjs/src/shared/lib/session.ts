import 'server-only';
import { cache } from 'react';
import { cookies } from 'next/headers';
import { jwtVerify, type JWTPayload } from 'jose';
import { getEnv } from '../../env';

let secretKey: Uint8Array;

function getSecretKey(): Uint8Array {
  if (!secretKey) {
    secretKey = new TextEncoder().encode(getEnv().TOKEN_SIGNING_SECRET);
  }
  return secretKey;
}

export async function decrypt(token: string | undefined = ''): Promise<JWTPayload | null> {
  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, getSecretKey(), {
      algorithms: ['HS256'],
    });

    return payload;
  } catch (error) {
    console.error('Failed to verify token:', error);
    return null;
  }
}

export const assigns = cache(async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  const session = await decrypt(token);

  if (!session?.sub) {
    return { userId: null };
  }

  // Extract user ID from AshAuthentication subject format: "user?id=<uuid>"
  const match = session.sub.match(/id=([a-f0-9-]+)/i);
  const userId = match ? match[1] : null;

  if (!userId) {
    return { userId: null };
  }

  return { userId };
});
