<script lang="ts">
  import NavLinks from "./nav-links.svelte";
  import PageSwitcher from "./page-switcher.svelte";
  import SignInButton from "./sign-in-button.svelte";

  let { pathname }: { pathname: string } = $props();
</script>

<header class="border-border bg-background">
  <div
    class="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-2 sm:grid sm:h-14 sm:grid-cols-3 sm:py-0"
  >
    <div class="flex items-center">
      <PageSwitcher />
    </div>
    <div
      class="order-last flex w-full items-center justify-center sm:order-0 sm:w-auto"
    >
      <NavLinks {pathname} />
    </div>
    <div class="flex items-center justify-end">
      <SignInButton />
    </div>
  </div>
</header>
