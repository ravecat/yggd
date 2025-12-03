import 'server-only'
import { envsafe, str, url } from 'envsafe';

export function getEnv() {
  return envsafe({
    // Server-only (never exposed to client)
    AUTH_SERVICE_URL: url({
      desc: 'Backend API URL for authentication',
    }),
    APP_URL: url({
      desc: 'Frontend application URL',
    }),
    TOKEN_SIGNING_SECRET: str({
      desc: 'JWT token signing secret (must match backend)',
    }),

    // Client-safe (can be exposed to browser)
    PUBLIC_API_URL: url({
      desc: 'Public API URL for client-side API calls',
    }),
    PUBLIC_CHANNEL_URL: str({
      desc: 'Phoenix WebSocket URL for real-time connections',
    }),
  });
}

export type Environment = ReturnType<typeof getEnv>;
