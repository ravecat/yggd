"use client";

import { useEffect, useRef, useState } from "react";
import { useSocket } from "@rvct/shared/react";
import type { OtlpMetricsPayload } from "@rvct/shared";
import type { Channel } from "phoenix";
import { MetricChart, type MetricBuffer } from "./metric-chart";

const MAX_POINTS = 300;

// --- Buffer helpers ---

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

    const buf = next[m.name]
      ? {
          ts: [...next[m.name].ts],
          series: Object.fromEntries(
            Object.entries(next[m.name].series).map(([k, v]) => [k, [...v]]),
          ),
        }
      : { ts: [], series: {} as Record<string, number[]> };

    // All datapoints in one snapshot share the same collection timestamp.
    const ts = parseInt(dps[0].timeUnixNano) / 1e9;
    buf.ts.push(ts);
    if (buf.ts.length > MAX_POINTS) buf.ts.splice(0, 1);

    for (const dp of dps) {
      const key =
        dp.attributes?.find((a) => a.key === "quantile")?.value?.stringValue ??
        "value";
      if (!buf.series[key]) buf.series[key] = [];
      buf.series[key].push(dp.asDouble ?? Number(dp.asInt));
      if (buf.series[key].length > MAX_POINTS) buf.series[key].splice(0, 1);
    }

    next[m.name] = buf;
  }

  return next;
}

// --- Dashboard ---

export function TelemetryDashboard() {
  const socket = useSocket();
  const [buffers, setBuffers] = useState<Record<string, MetricBuffer>>({});
  // Mutable ref so the channel callback always sees the latest buffers
  // without stale closure issues, without triggering extra re-renders.
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
          {Object.entries(buffers).map(([name, buffer]) => (
            <div key={name} className="h-full">
              <MetricChart
                name={name}
                multi={Object.keys(buffer.series).length > 1}
                buffer={buffer}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
