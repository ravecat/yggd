<script lang="ts">
  import "../app.css";
  import { page } from "$app/state";
  import favicon from "../assets/favicon.svg";
  import Navbar from "$shared/layout/navbar.svelte";

  let { children } = $props();
  const pathname = $derived(page.url.pathname);
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

<div class="flex min-h-full flex-col">
  <Navbar {pathname} />
  <main class="flex min-h-0 flex-1 flex-col">
    {@render children()}
  </main>
</div>
