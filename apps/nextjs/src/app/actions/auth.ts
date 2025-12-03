'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { generateCodeVerifier, generateCodeChallenge } from '@/shared/lib/pkce';
import { getEnv } from '@/env';

export async function signup() {
  const verifier = generateCodeVerifier();
  const challenge = generateCodeChallenge(verifier);
  const cookieStore = await cookies()

  cookieStore.set('pkce_verifier', verifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 10,
  });

  const env = getEnv();
  const callbackUri = `${env.AUTH_SERVICE_URL}/auth/callback`;
  const oauthUrl = new URL(`${env.APP_URL}/auth/user/google`);

  oauthUrl.searchParams.set('redirect_uri', callbackUri);
  oauthUrl.searchParams.set('code_challenge', challenge);
  oauthUrl.searchParams.set('code_challenge_method', 'S256');

  redirect(oauthUrl.toString());
}

export async function signout() {
  const cookieStore = await cookies();
  cookieStore.delete('auth_token');
  redirect("/");
}

export async function exchangeCodeForToken(code: string): Promise<string> {
  const cookieStore = await cookies();
  const verifier = cookieStore.get('pkce_verifier')?.value;

  if (!verifier) {
    throw new Error('PKCE verifier not found in cookie');
  }

  const env = getEnv();
  const response = await fetch(`${env.AUTH_SERVICE_URL}/auth/exchange`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, code_verifier: verifier }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token exchange failed: ${error}`);
  }

  const { token } = await response.json();

  cookieStore.set('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });

  cookieStore.delete('pkce_verifier');

  return token;
}
