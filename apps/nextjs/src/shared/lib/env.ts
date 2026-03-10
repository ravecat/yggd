declare global {
  interface Window {
    __ENV__?: Partial<AppEnv>;
  }
}

type AppEnv = {
  PUBLIC_API_URL: string;
  APP_URL: string;
  PUBLIC_CHANNEL_URL: string;
};

function trimTrailingSlash(value?: string): string {
  return (value ?? "").replace(/\/$/, "");
}

function normalizeEnv(source?: Partial<AppEnv>): AppEnv {
  return {
    PUBLIC_API_URL: trimTrailingSlash(source?.PUBLIC_API_URL),
    APP_URL: trimTrailingSlash(source?.APP_URL),
    PUBLIC_CHANNEL_URL: trimTrailingSlash(source?.PUBLIC_CHANNEL_URL),
  };
}

export const env: AppEnv =
  typeof window === "undefined"
    ? normalizeEnv({
        PUBLIC_API_URL: process.env.PUBLIC_API_URL as string,
        APP_URL: process.env.APP_URL as string,
        PUBLIC_CHANNEL_URL: process.env.PUBLIC_CHANNEL_URL as string,
      })
    : normalizeEnv(window.__ENV__);

export function getRuntimeEnvScript(): string {
  return `window.__ENV__=${JSON.stringify(env).replace(/</g, "\\u003c")};`;
}
