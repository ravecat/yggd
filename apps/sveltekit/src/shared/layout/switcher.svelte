<script lang="ts">
  import { browser } from "$app/environment";
  import CheckIcon from "@lucide/svelte/icons/check";
  import ChevronsUpDownIcon from "@lucide/svelte/icons/chevrons-up-down";
  import type { Framework } from "$shared/navigation";
  import { Button } from "$shared/ui/button";
  import * as DropdownMenu from "$shared/ui/dropdown-menu";

  let { frameworks }: { frameworks: Framework[] } = $props();

  const currentFrameworkId = "sveltekit";

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
        SvelteKit
        <ChevronsUpDownIcon class="size-3.5 opacity-50" />
      </Button>
    {/snippet}
  </DropdownMenu.Trigger>
  <DropdownMenu.Content align="start" class="min-w-40">
    <DropdownMenu.Label>Frameworks</DropdownMenu.Label>
    {#each frameworks as framework (framework.id)}
      <DropdownMenu.Item
        class="flex items-center justify-between"
        onclick={() => visitFramework(framework.href)}
      >
        <span>{framework.label}</span>
        {#if framework.id === currentFrameworkId}
          <CheckIcon class="size-4 opacity-50" />
        {/if}
      </DropdownMenu.Item>
    {/each}
  </DropdownMenu.Content>
</DropdownMenu.Root>
