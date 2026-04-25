<script lang="ts">
  import ActivityIcon from "@lucide/svelte/icons/activity";
  import ClockIcon from "@lucide/svelte/icons/clock";
  import CpuIcon from "@lucide/svelte/icons/cpu";
  import DatabaseIcon from "@lucide/svelte/icons/database";
  import GaugeIcon from "@lucide/svelte/icons/gauge";
  import HardDriveIcon from "@lucide/svelte/icons/hard-drive";
  import MemoryStickIcon from "@lucide/svelte/icons/memory-stick";
  import NetworkIcon from "@lucide/svelte/icons/network";
  import TriangleAlertIcon from "@lucide/svelte/icons/triangle-alert";
  import UsersIcon from "@lucide/svelte/icons/users";
  import type { Component } from "svelte";

  type Metric = {
    label: string;
    value: string;
    detail: string;
    icon: Component;
  };

  const metrics: Metric[] = [
    {
      label: "Visitors",
      value: "12,482",
      detail: "+37 today",
      icon: UsersIcon,
    },
    {
      label: "Uptime",
      value: "18d 4h",
      detail: "stable",
      icon: ClockIcon,
    },
    {
      label: "Memory Used",
      value: "214 KB",
      detail: "41% used",
      icon: MemoryStickIcon,
    },
    {
      label: "CPU Temp",
      value: "42.1 C",
      detail: "normal",
      icon: CpuIcon,
    },
    {
      label: "SD Card",
      value: "31 MB",
      detail: "7.6 GB free",
      icon: HardDriveIcon,
    },
    {
      label: "Response Time",
      value: "82 ms",
      detail: "p95 latency",
      icon: GaugeIcon,
    },
    {
      label: "Requests",
      value: "18.6K",
      detail: "last 24h",
      icon: ActivityIcon,
    },
    {
      label: "Error Rate",
      value: "0.02%",
      detail: "last 24h",
      icon: TriangleAlertIcon,
    },
    {
      label: "Bandwidth",
      value: "124 GB",
      detail: "egress/month",
      icon: NetworkIcon,
    },
  ];

  const lastUpdate = {
    time: "Apr 24, 2026, 16:20",
    state: "mock data",
  };
</script>

<section class="stats-panel">
  <div class="stats-panel__grid">
    {#each metrics as metric (metric.label)}
      {@const Icon = metric.icon}
      <article class="stats-panel__cell">
        <div class="stats-panel__label">
          <span class="stats-panel__icon">
            <Icon size="0.875rem" aria-hidden="true" />
          </span>
          <span>{metric.label}</span>
        </div>
        <div class="stats-panel__value">
          {metric.value}
        </div>
        <div class="stats-panel__sub">
          {metric.detail}
        </div>
      </article>
    {/each}

    <aside
      class="stats-panel__cell stats-panel__cell--wide"
      aria-label="Last update"
    >
      <div class="stats-panel__label">
        <span class="stats-panel__icon">
          <DatabaseIcon size="0.875rem" aria-hidden="true" />
        </span>
        <span>Last update</span>
        <span class="stats-panel__live-dot stats-panel__live-dot--stale"></span>
        <span>{lastUpdate.state}</span>
      </div>
      <div class="stats-panel__last-update-value">
        {lastUpdate.time}
      </div>
    </aside>
  </div>
</section>

<style>
  .stats-panel {
    --stats-panel-bg: hsl(var(--background));
    --stats-panel-ink: hsl(var(--foreground));
    --stats-panel-mid: hsl(var(--muted-foreground));
    --stats-panel-faint: hsl(var(--border));

    color: var(--stats-panel-ink);
    font-family:
      ui-monospace, "SF Mono", "Cascadia Mono", "Consolas", monospace;
  }

  .stats-panel__grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 0.0625rem;
    background: var(--stats-panel-faint);
    border: 0.0625rem solid var(--stats-panel-faint);
  }

  .stats-panel__cell {
    min-width: 0;
    background: var(--stats-panel-bg);
    padding: 1.25rem;
  }

  .stats-panel__cell--wide {
    grid-column: 1 / -1;
  }

  .stats-panel__label {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    margin-bottom: 0.5rem;
    color: var(--stats-panel-mid);
    font-size: 0.625rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .stats-panel__icon {
    display: inline-flex;
    flex-shrink: 0;
  }

  .stats-panel__value {
    color: var(--stats-panel-ink);
    font-size: 1.375rem;
    line-height: 1;
  }

  .stats-panel__sub {
    margin-top: 0.25rem;
    color: var(--stats-panel-mid);
    font-size: 0.6875rem;
  }

  .stats-panel__last-update-value {
    color: var(--stats-panel-mid);
    font-size: 0.875rem;
    line-height: 1.4;
  }

  .stats-panel__live-dot {
    display: inline-block;
    width: 0.375rem;
    height: 0.375rem;
    border-radius: 50%;
    background: #0a8b4a;
    animation: stats-panel-live-pulse 1.4s ease-in-out infinite;
  }

  .stats-panel__live-dot--stale {
    background: var(--stats-panel-faint);
    opacity: 0.6;
    animation: none;
  }

  @keyframes stats-panel-live-pulse {
    0%,
    100% {
      opacity: 0.4;
    }

    50% {
      opacity: 1;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .stats-panel__live-dot {
      animation: none;
    }
  }

  @media (max-width: 30rem) {
    .stats-panel__grid {
      grid-template-columns: 1fr 1fr;
    }

    .stats-panel__grid > .stats-panel__cell:nth-child(9) {
      grid-column: 1 / -1;
    }
  }
</style>
