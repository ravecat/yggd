import "server-only";

import type { RequestConfig } from "@rvct/shared";
import { assigns } from "~/shared/lib/session";

type Config = Pick<RequestConfig, "headers">;

export async function config(): Promise<Config> {
  const { token } = await assigns();

  if (!token) {
    return {};
  }

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
}
