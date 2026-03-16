<script lang="ts">
  import "../app.css";
  import favicon from "../assets/favicon.svg";
  import Navbar from "$shared/layout/navbar.svelte";
  import type { LayoutProps } from "./$types";

  let { data, children }: LayoutProps = $props();
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

<div class="flex min-h-full flex-col">
  <Navbar frameworks={data.frameworks} />
  <main class="flex min-h-0 flex-1 flex-col">
    {@render children()}
  </main>
</div>
