import { env } from "$env/dynamic/private";
import type { LayoutServerLoad } from "./$types";
import type { Framework } from "$shared/navigation.js";

export const load: LayoutServerLoad = () => ({
  frameworks: [
    {
      id: "nextjs",
      label: "Next.js",
      href: env.NEXTJS_APP_URL,
    },
    {
      id: "sveltekit",
      label: "SvelteKit",
      href: env.SVELTEKIT_APP_URL,
    },
    {
      id: "preact",
      label: "Preact",
      href: env.PREACT_APP_URL,
    },
  ].filter((framework): framework is Framework => Boolean(framework.href)),
});
