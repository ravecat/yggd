"use client";

import { useEffect, useRef, useState } from "react";
import { useSocket } from "@rvct/shared/react";
import type { OtlpMetricsPayload } from "@rvct/shared";
import type { Channel } from "phoenix";
import { TimeSeriesChart, type ChartData, type ChartOptions } from "~/components/ui/time-series-chart";

const MAX_POINTS = 300;

interface MetricBuffer {
  labels: string[];
  data: ChartData;
}

function appendToBuffer(
  prev: Record<string, MetricBuffer>,
  payload: OtlpMetricsPayload,
): Record<string, MetricBuffer> {
  const metrics =
    payload?.resourceMetrics?.[0]?.scopeMetrics?.[0]?.metrics ?? [];
  const next = { ...prev };

  for (const m of metrics) {
    const dps = m.gauge?.dataPoints ?? [];
    if (!dps.length) continue;

    const ts = parseInt(dps[0].timeUnixNano) / 1e9;

    const points: Record<string, number> = {};
    for (const dp of dps) {
      const key =
        dp.attributes?.find((a) => a.key === "quantile")?.value?.stringValue ??
        "value";
      points[key] = dp.asDouble ?? Number(dp.asInt);
    }

    const existing = next[m.name];
    if (existing) {
      const newTs = [...(existing.data[0] as number[]), ts];
      if (newTs.length > MAX_POINTS) newTs.splice(0, 1);

      const newLabels = [...existing.labels];
      const valueSeries = existing.labels.map((label, i) => {
        const vals = [...(existing.data[i + 1] as number[]), points[label] ?? NaN];
        if (vals.length > MAX_POINTS) vals.splice(0, 1);
        return vals;
      });

      for (const key of Object.keys(points)) {
        if (!newLabels.includes(key)) {
          newLabels.push(key);
          const vals = new Array(newTs.length - 1).fill(NaN);
          vals.push(points[key]);
          valueSeries.push(vals);
        }
      }

      next[m.name] = { labels: newLabels, data: [newTs, ...valueSeries] };
    } else {
      const labels = Object.keys(points);
      const data: ChartData = [
        [ts],
        ...labels.map((key) => [points[key]]),
      ];
      next[m.name] = { labels, data };
    }
  }

  return next;
}

function buildOptions(name: string, buf: MetricBuffer): ChartOptions {
  return {
    title: name,
    series: [
      {},
      ...buf.labels.map((label) => ({ label })),
    ],
    ...(buf.labels.length > 1 && { legend: { show: true } }),
  };
}

export default function TelemetryPage() {
  const socket = useSocket();
  const [buffers, setBuffers] = useState<Record<string, MetricBuffer>>({});
  const buffersRef = useRef<Record<string, MetricBuffer>>({});

  useEffect(() => {
    const channel: Channel = socket.channel("telemetry:metrics");

    channel.on("metrics", (payload: OtlpMetricsPayload) => {
      const next = appendToBuffer(buffersRef.current, payload);
      buffersRef.current = next;
      setBuffers(next);
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
          {Object.entries(buffers).map(([name, buf]) => (
            <div key={name} className="h-full">
              <TimeSeriesChart
                options={buildOptions(name, buf)}
                data={buf.data}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
