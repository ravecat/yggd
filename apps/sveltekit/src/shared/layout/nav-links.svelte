<script lang="ts">
  import { page } from "$app/state";
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import * as Tabs from "$shared/ui/tabs/index.js";
  import { navLinks } from "$shared/navigation.js";

  const activeValue = $derived.by(() => {
    const pathname = page.url.pathname;

    if (pathname === "/canvas" || pathname.startsWith("/canvas/")) {
      return "canvas";
    }

    if (pathname === "/telemetry" || pathname.startsWith("/telemetry/")) {
      return "telemetry";
    }

    if (pathname === "/chart" || pathname.startsWith("/chart/")) {
      return "chart";
    }

    return "todo";
  });
</script>

<nav aria-label="Primary" class="w-full min-w-0 sm:w-auto">
  <Tabs.Root value={activeValue} class="w-full sm:w-auto">
    <Tabs.List class="h-9 w-full overflow-hidden p-0.5 sm:w-auto">
      {#each navLinks as link (link.href)}
        <Tabs.Trigger
          value={link.value}
          class="h-full min-w-0 flex-1 px-[1.5625rem]"
          aria-current={activeValue === link.value ? "page" : undefined}
          onclick={() => goto(resolve(link.href))}
        >
          {link.label}
        </Tabs.Trigger>
      {/each}
    </Tabs.List>
  </Tabs.Root>
</nav>
