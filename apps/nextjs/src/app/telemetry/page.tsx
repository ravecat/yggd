"use client";

import { useEffect, useRef, useState } from "react";
import { useSocket } from "@rvct/shared/react";
import type { OtelMetric, OtelNumberDataPoint } from "@rvct/shared";
import type { Channel } from "phoenix";
import {
  TimeSeriesChart,
  type ChartRef,
} from "~/components/ui/time-series-chart";

interface MetricMeta {
  labels: string[];
}

function toUnixSeconds(
  timeUnixNano: OtelNumberDataPoint["timeUnixNano"],
): number | null {
  const value = timeUnixNano.trim();
  if (!value) return null;

  let nanos: bigint;
  try {
    nanos = BigInt(value);
  } catch {
    return null;
  }

  return Number(nanos / 1_000_000_000n) + Number(nanos % 1_000_000_000n) / 1e9;
}

export default function TelemetryPage() {
  const socket = useSocket();
  const [metrics, setMetrics] = useState<Record<string, MetricMeta>>({});
  const knownMetrics = useRef<Record<string, MetricMeta>>({});
  const charts = useRef<Map<string, ChartRef>>(new Map());

  useEffect(() => {
    const channel: Channel = socket.channel("telemetry:metrics");

    channel.on("metric", (metric: OtelMetric) => {
      const dataPoints = metric.gauge?.dataPoints ?? [];
      if (!dataPoints.length) return;

      const ts = toUnixSeconds(dataPoints[0].timeUnixNano);
      if (ts == null || !Number.isFinite(ts)) return;

      const points: Record<string, number> = {};
      for (const dataPoint of dataPoints) {
        const label =
          dataPoint.attributes?.find(
            (attribute) => attribute.key === "quantile",
          )?.value?.stringValue ?? "value";
        points[label] = dataPoint.asDouble ?? Number(dataPoint.asInt);
      }

      const existing = knownMetrics.current[metric.name];
      const allLabels = [...(existing?.labels ?? [])];
      let metaChanged = !existing;

      for (const label of Object.keys(points)) {
        if (!allLabels.includes(label)) {
          allLabels.push(label);
          metaChanged = true;
        }
      }

      const nextMeta = {
        ...knownMetrics.current,
        [metric.name]: { labels: allLabels },
      };
      charts.current
        .get(metric.name)
        ?.push([[ts], ...allLabels.map((label) => [points[label] ?? NaN])]);

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
