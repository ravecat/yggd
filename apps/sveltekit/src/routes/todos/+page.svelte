<script lang="ts">
  import { page } from "$app/state";
</script>

<div
  class="flex flex-1 items-center justify-center p-6 font-mono text-sm text-foreground/70"
>
  {page.url.pathname}
</div>
