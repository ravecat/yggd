"use client";

import { useEffect, useRef, useState } from "react";
import { useSocket } from "@rvct/shared/react";
import type { OtlpMetricsPayload } from "@rvct/shared";
import type { Channel } from "phoenix";
import {
  TimeSeriesChart,
  type ChartRef,
} from "~/components/ui/time-series-chart";

interface MetricMeta {
  labels: string[];
}

export default function TelemetryPage() {
  const socket = useSocket();
  const [metrics, setMetrics] = useState<Record<string, MetricMeta>>({});
  const knownMetrics = useRef<Record<string, MetricMeta>>({});
  const charts = useRef<Map<string, ChartRef>>(new Map());

  useEffect(() => {
    const channel: Channel = socket.channel("telemetry:metrics");

    channel.on("metrics", (payload: OtlpMetricsPayload) => {
      const rawMetrics =
        payload?.resourceMetrics?.[0]?.scopeMetrics?.[0]?.metrics ?? [];
      let metaChanged = false;
      const nextMeta = { ...knownMetrics.current };

      for (const m of rawMetrics) {
        const dps = m.gauge?.dataPoints ?? [];
        if (!dps.length) continue;

        const ts = parseInt(dps[0].timeUnixNano) / 1e9;

        const points: Record<string, number> = {};
        for (const dp of dps) {
          const key =
            dp.attributes?.find((a) => a.key === "quantile")?.value
              ?.stringValue ?? "value";
          points[key] = dp.asDouble ?? Number(dp.asInt);
        }

        const existing = nextMeta[m.name];
        const allLabels = [...(existing?.labels ?? [])];
        for (const key of Object.keys(points)) {
          if (!allLabels.includes(key)) {
            allLabels.push(key);
            metaChanged = true;
          }
        }

        if (!existing) metaChanged = true;
        nextMeta[m.name] = { labels: allLabels };

        charts.current
          .get(m.name)
          ?.push([[ts], ...allLabels.map((label) => [points[label] ?? NaN])]);
      }

      if (metaChanged) {
        knownMetrics.current = nextMeta;
        setMetrics(nextMeta);
      }
    });

    channel.join();

    return () => {
      channel.leave();
    };
  }, [socket]);

  return (
    <div className="h-full overflow-auto">
      <div className="mx-auto flex h-full w-full max-w-6xl flex-col gap-4 px-4 py-4">
        <div className="grid flex-1 auto-rows-fr grid-cols-1 gap-4 min-h-0 sm:grid-cols-2">
          {Object.entries(metrics).map(([name, meta]) => (
            <div key={name} className="h-full">
              <TimeSeriesChart
                ref={(chart) => {
                  if (chart) charts.current.set(name, chart);
                  else charts.current.delete(name);
                }}
                options={{
                  title: name,
                  xWindowSize: 50,
                  series: [{}, ...meta.labels.map((label) => ({ label }))],
                  ...(meta.labels.length > 1 && { legend: { show: true } }),
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
