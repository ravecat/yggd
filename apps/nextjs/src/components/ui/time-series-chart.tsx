"use client";

import { useEffect, useRef, useState } from "react";
import type uPlot from "uplot";

export type ChartOptions = Omit<uPlot.Options, "width" | "height">;
export type ChartData = uPlot.AlignedData;

interface TimeSeriesChartProps {
  options: ChartOptions;
  data: ChartData;
}

const DEFAULTS: Partial<ChartOptions> = {
  axes: [{ show: false }, { size: 80 }],
  cursor: { show: false },
  legend: { show: false },
  padding: [8, 4, 4, 4],
};

const SERIES_DEFAULTS: uPlot.Series = { stroke: "#627eea", width: 2 };

export function TimeSeriesChart({ options, data }: TimeSeriesChartProps) {
  const opts = {
    ...DEFAULTS,
    ...options,
    series: (options.series ?? [{}]).map((s, i) =>
      i === 0 ? s : { ...SERIES_DEFAULTS, ...s },
    ),
  };
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const uplotRef = useRef<any>(null);
  const [containerSize, setContainerSize] = useState<{
    width: number;
    height: number;
  } | null>(null);

  useEffect(() => {
    return () => {
      uplotRef.current?.destroy();
      uplotRef.current = null;
    };
  }, []);

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

  useEffect(() => {
    if (!uplotRef.current || !containerSize) return;
    uplotRef.current.setSize({
      width: containerSize.width,
      height: containerSize.height,
    });
  }, [containerSize]);

  useEffect(() => {
    if (!data[0]?.length || !containerRef.current || !containerSize) return;

    import("uplot").then(({ default: uPlot }) => {
      if (!containerRef.current) return;

      if (!uplotRef.current) {
        const { title: _, ...uplotOpts } = opts;
        uplotRef.current = new uPlot(
          {
            ...uplotOpts,
            width: containerSize.width,
            height: containerSize.height,
          },
          data,
          containerRef.current,
        );
      } else {
        uplotRef.current.setData(data);
      }
    });
  }, [data, containerSize]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-lg border border-border bg-card p-3">
      {opts.title && (
        <div className="mb-2 text-sm font-medium text-foreground">
          {opts.title}
        </div>
      )}
      <div className="relative flex-1 overflow-hidden">
        {!data[0]?.length && (
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
