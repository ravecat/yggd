<script lang="ts">
  import "../app.css";
  import favicon from "../assets/favicon.svg";
  import Header from "$shared/layout/header.svelte";
  import type { LayoutProps } from "./$types";

  let { data, children }: LayoutProps = $props();
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

<div class="flex min-h-full flex-col">
  <Header frameworks={data.frameworks} />
  <main class="flex min-h-0 flex-1 flex-col">
    {@render children()}
  </main>
</div>
