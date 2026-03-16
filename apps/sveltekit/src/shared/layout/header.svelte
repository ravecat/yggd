<script lang="ts">
  import type { Framework } from "$shared/navigation";
  import Navbar from "./navbar.svelte";
  import SignInButton from "./sign-in-button.svelte";
  import Switcher from "./switcher.svelte";

  let { frameworks }: { frameworks: Framework[] } = $props();
</script>

<header class="border-border bg-background">
  <div
    class="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-2 sm:grid sm:h-14 sm:grid-cols-3 sm:py-0"
  >
    <div class="flex items-center">
      <Switcher {frameworks} />
    </div>
    <div
      class="order-last flex w-full items-center justify-center sm:order-0 sm:w-auto"
    >
      <Navbar />
    </div>
    <div class="flex items-center justify-end">
      <SignInButton />
    </div>
  </div>
</header>
