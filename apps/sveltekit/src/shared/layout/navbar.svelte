<script lang="ts">
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { page } from "$app/state";
  import * as Tabs from "$shared/ui/tabs";

  const links = [
    { href: "/todos", label: "Todo" },
    { href: "/canvas", label: "Canvas" },
    { href: "/telemetry", label: "Telemetry" },
    { href: "/chart", label: "Chart" },
  ] as const;
</script>

<nav aria-label="Primary" class="w-full min-w-0 sm:w-auto">
  <Tabs.Root value={page.route.id ?? undefined} class="w-full sm:w-auto">
    <Tabs.List class="h-9 w-full overflow-hidden p-0.5 sm:w-auto">
      {#each links as link (link.href)}
        <Tabs.Trigger
          value={link.href}
          class="h-full min-w-0 flex-1 px-[1.5625rem]"
          aria-current={page.route.id === link.href ? "page" : undefined}
          onclick={() => goto(resolve(link.href))}
        >
          {link.label}
        </Tabs.Trigger>
      {/each}
    </Tabs.List>
  </Tabs.Root>
</nav>
