import "server-only";

import type { RequestConfig } from "@rvct/shared";
import { assigns } from "~/shared/lib/session";

export async function config(): Promise<RequestConfig<never>> {
  const { token } = await assigns();

  return {
    baseURL: process.env.PUBLIC_API_URL,
    headers: {
      Authorization: `Bearer ${token ?? ""}`,
    },
  };
}
