<script lang="ts">
  import { browser } from "$app/environment";
  import CheckIcon from "@lucide/svelte/icons/check";
  import ChevronsUpDownIcon from "@lucide/svelte/icons/chevrons-up-down";
  import { Button } from "$shared/ui/button/index.js";
  import * as DropdownMenu from "$shared/ui/dropdown-menu/index.js";
  import type { Framework } from "$shared/navigation.js";

  let { data }: { data: Framework[] } = $props();

  const currentFramework = $derived.by(() => {
    const host = browser ? window.location.host : null;

    return (
      data.find((framework) => {
        if (!host) {
          return framework.id === "sveltekit";
        }

        try {
          return new URL(framework.href).host === host;
        } catch {
          return false;
        }
      }) ??
      data.find((framework) => framework.id === "sveltekit") ??
      data[0]
    );
  });

  function visitFramework(href: string) {
    if (!browser) {
      return;
    }

    window.location.assign(href);
  }
</script>

<DropdownMenu.Root>
  <DropdownMenu.Trigger>
    {#snippet child({ props })}
      <Button
        {...props}
        variant="outline"
        size="sm"
        class="min-w-[7.75rem] justify-between"
      >
        {currentFramework.label}
        <ChevronsUpDownIcon class="size-3.5 opacity-50" />
      </Button>
    {/snippet}
  </DropdownMenu.Trigger>
  <DropdownMenu.Content align="start" class="min-w-40">
    <DropdownMenu.Label>Frameworks</DropdownMenu.Label>
    {#each data as framework (framework.id)}
      <DropdownMenu.Item
        class="flex items-center justify-between"
        onclick={() => visitFramework(framework.href)}
      >
        <span>{framework.label}</span>
        {#if framework.id === currentFramework.id}
          <CheckIcon class="size-4 opacity-50" />
        {/if}
      </DropdownMenu.Item>
    {/each}
  </DropdownMenu.Content>
</DropdownMenu.Root>
