<script lang="ts">
  import { resolve } from "$app/paths";
  import { Github, Webhook } from "@lucide/svelte/icons";
  import "../app.css";
  import favicon from "../assets/favicon.svg";
  import type { LayoutProps } from "./$types";

  let { children }: LayoutProps = $props();

  const headerLinks = [
    { href: "/canvas", label: "Canvas" },
    { href: "/telemetry", label: "Telemetry" },
  ] as const;

  const footerLinks = [{ href: "", label: "AsyncAPI" }] as const;

  const githubUrl = "https://github.com/ravecat/moda";
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

<div class="app-layout">
  <header class="app-header">
    <a class="app-header__site-name" href={resolve("/")}>Moda</a>
    <nav class="app-header__nav" aria-label="Primary">
      <ul class="app-header__nav-list">
        {#each headerLinks as link (link.href)}
          <li>
            <a class="app-header__nav-link" href={resolve(link.href)}>
              {link.label}
            </a>
          </li>
        {/each}
      </ul>
    </nav>
  </header>

  <main class="app-layout__main">
    {@render children()}
  </main>

  <footer class="app-layout__footer">
    <a
      class="app-layout__footer-credit"
      href={githubUrl}
      target="_blank"
      rel="noreferrer"
      aria-label="made by Moda on GitHub"
    >
      <span class="app-layout__footer-icon" aria-hidden="true">
        <Github size="0.875rem" />
      </span>
      <span>Github</span>
    </a>
    <ul class="app-layout__footer-links">
      {#each footerLinks as link (link.href)}
        <li>
          <span
            class="app-layout__footer-link app-layout__footer-link--placeholder"
            aria-disabled="true"
          >
            <span class="app-layout__footer-icon" aria-hidden="true">
              <Webhook size="0.875rem" />
            </span>
            <span>{link.label}</span>
          </span>
        </li>
      {/each}
    </ul>
  </footer>
</div>

<style>
  .app-layout {
    display: contents;
  }

  .app-layout__main {
    width: 100%;
    max-width: 40rem;
    margin: 0 auto;
    padding: 0 1.5rem 4rem;
  }

  .app-header {
    width: 100%;
    max-width: 40rem;
    margin: 0 auto;
    padding: 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    row-gap: 0.625rem;
    flex-wrap: wrap;
    font-family:
      ui-monospace, "SF Mono", "Cascadia Mono", "Consolas", monospace;
  }

  .app-header__site-name {
    color: hsl(var(--muted-foreground));
    font-size: 0.8125rem;
    letter-spacing: 0.15em;
    text-decoration: none;
    text-transform: uppercase;
    transition: color 0.15s;
  }

  .app-header__site-name:hover {
    color: hsl(var(--foreground));
  }

  .app-header__nav-list {
    display: flex;
    gap: 1rem;
    list-style: none;
    margin: 0;
    padding: 0;
    font-size: 0.6875rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .app-header__nav-link {
    color: hsl(var(--muted-foreground));
    text-decoration: none;
    transition: color 0.15s;
  }

  .app-header__nav-link:hover {
    color: hsl(var(--foreground));
  }

  .app-layout__footer {
    width: 100%;
    max-width: 40rem;
    margin: 0 auto;
    padding: 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
    border-top: 0.0625rem solid hsl(var(--border));
    color: hsl(var(--muted-foreground));
    font-family:
      ui-monospace, "SF Mono", "Cascadia Mono", "Consolas", monospace;
    font-size: 0.6875rem;
  }

  .app-layout__footer-credit {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    color: hsl(var(--muted-foreground));
    letter-spacing: 0.08em;
    text-decoration: none;
    transition: color 0.15s;
  }

  .app-layout__footer-credit:hover {
    color: hsl(var(--foreground));
  }

  .app-layout__footer-icon {
    width: 0.875rem;
    height: 0.875rem;
    flex: none;
  }

  .app-layout__footer-link {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    color: hsl(var(--muted-foreground));
    letter-spacing: 0.08em;
    text-decoration: none;
    transition: color 0.15s;
  }

  .app-layout__footer-link:hover {
    color: hsl(var(--foreground));
  }

  .app-layout__footer-link--placeholder {
    cursor: default;
  }

  .app-layout__footer-links {
    display: flex;
    gap: 1.25rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  @media (max-width: 40rem) {
    .app-header {
      padding: 3.75rem 1rem 0.875rem;
    }

    .app-layout__main {
      padding: 0 1rem 3rem;
    }
  }

  @media (max-width: 30rem) {
    .app-header__nav-list {
      gap: 0.875rem;
      font-size: 0.625rem;
    }
  }
</style>
