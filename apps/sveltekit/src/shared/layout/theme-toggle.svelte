<script lang="ts">
  import MoonIcon from "@lucide/svelte/icons/moon";
  import SunIcon from "@lucide/svelte/icons/sun";
  import { Button } from "$shared/ui/button";

  function dispatchThemeEvent(event: MouseEvent) {
    const button = event.currentTarget as HTMLButtonElement;

    button.dispatchEvent(
      new CustomEvent("moda:set-theme", {
        bubbles: true,
      }),
    );
  }
</script>

<Button
  type="button"
  variant="outline"
  size="sm"
  class="size-8 shrink-0 p-0"
  aria-label="Toggle theme"
  title="Toggle theme"
  onclick={dispatchThemeEvent}
>
  <MoonIcon class="dark:hidden" />
  <SunIcon class="hidden dark:block" />
</Button>
