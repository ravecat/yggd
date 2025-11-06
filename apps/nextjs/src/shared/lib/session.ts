import 'server-only';
import { cache } from 'react';
import { cookies } from 'next/headers';

export const verifySession = cache(async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  return { isAuthenticated: !!token, token };
});
