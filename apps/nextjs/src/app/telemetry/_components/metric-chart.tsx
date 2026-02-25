"use client";

import { useEffect, useRef, useState } from "react";
import type uPlot from "uplot";

export interface MetricBuffer {
  ts: number[];
  series: Record<string, number[]>; // "value" for gauges; "p50"/"p95" for HTTP histogram
}

interface MetricChartProps {
  name: string;
  multi: boolean;
  buffer: MetricBuffer | undefined;
}

export function MetricChart({ name, multi, buffer }: MetricChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const uplotRef = useRef<any>(null);
  const [containerSize, setContainerSize] = useState<{
    width: number;
    height: number;
  } | null>(null);

  const buildData = (buf: MetricBuffer): uPlot.AlignedData => {
    const keys = Object.keys(buf.series).sort();
    const result: (number[] | Float64Array)[] = [buf.ts];
    for (const key of keys) result.push(buf.series[key]);
    while (result.length < (multi ? 3 : 2))
      result.push(new Array(buf.ts.length).fill(NaN));
    return result as uPlot.AlignedData;
  };

  // Destroy chart on unmount.
  useEffect(() => {
    return () => {
      uplotRef.current?.destroy();
      uplotRef.current = null;
    };
  }, []);

  // Track container size.
  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      const width = entry?.contentRect.width;
      const height = entry?.contentRect.height;
      if (!width || !height) return;
      setContainerSize({ width, height });
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Resize chart when container size changes.
  useEffect(() => {
    if (!uplotRef.current || !containerSize) return;
    uplotRef.current.setSize({
      width: containerSize.width,
      height: containerSize.height,
    });
  }, [containerSize]);

  // Create chart lazily on first data (container is visible → clientWidth is correct),
  // then call setData on every subsequent buffer update.
  useEffect(() => {
    if (!buffer?.ts.length || !containerRef.current || !containerSize) return;

    import("uplot").then(({ default: uPlot }) => {
      if (!containerRef.current) return;

      if (!uplotRef.current) {
        const series = multi
          ? [
              {},
              { label: "p50", stroke: "#3b82f6", width: 1.5 },
              { label: "p95", stroke: "#f59e0b", width: 1.5 },
            ]
          : [{}, { label: name, stroke: "#3b82f6", width: 1.5 }];

        const opts: uPlot.Options = {
          width: containerSize.width,
          height: containerSize.height,
          series,
          axes: [
            { show: false },
            {
              size(self, values, axisIdx) {
                const axis = self.axes[axisIdx];
                const ticksSize = axis.ticks?.size ?? 0;
                const gap = axis.gap ?? 0;
                let axisSize = ticksSize + gap;
                const vals = values ?? [];
                const longest = vals.reduce(
                  (acc, val) => (val.length > acc.length ? val : acc),
                  "",
                );
                if (longest) {
                  self.ctx.font = axis.font?.[0] ?? self.ctx.font;
                  axisSize +=
                    self.ctx.measureText(longest).width / devicePixelRatio;
                }
                return Math.ceil(axisSize);
              },
            },
          ],
          cursor: { show: false },
          legend: { show: multi },
          padding: [8, 4, 4, 4],
        };

        uplotRef.current = new uPlot(
          opts,
          buildData(buffer),
          containerRef.current,
        );
      } else {
        uplotRef.current.setData(buildData(buffer));
      }
    });
  }, [buffer, containerSize]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-lg border border-border bg-card p-3">
      <div className="mb-2 text-sm font-medium text-foreground">{name}</div>
      <div className="relative flex-1 overflow-hidden">
        {!buffer?.ts.length && (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
            waiting for data...
          </div>
        )}
        <div
          ref={containerRef}
          className="absolute inset-0 [&_.u-wrap_canvas]:h-full! [&_.u-wrap_canvas]:w-full!"
        />
      </div>
    </div>
  );
}
