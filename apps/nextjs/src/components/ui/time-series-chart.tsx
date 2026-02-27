"use client";

import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import type uPlot from "uplot";

export type ChartOptions = Omit<uPlot.Options, "width" | "height"> & {
  xWindowSize?: number;
};

export interface ChartRef {
  push: (chunk: uPlot.AlignedData) => void;
}

interface TimeSeriesChartProps {
  ref?: React.Ref<ChartRef>;
  options: ChartOptions;
}

const rangeWithPadding: uPlot.Scale.Range = (_u, min, max) => {
  const spread = max - min;
  const pad = (spread || Math.abs(max) || 1) * 0.2;
  return [min - pad, max + pad];
};

function findTrimCount(xs: number[], cutoff: number): number {
  if (xs.length > 1 && xs[0] > xs[xs.length - 1]) {
    let i = 0;
    while (i < xs.length && xs[i] < cutoff) i++;
    return i;
  }

  let lo = 0;
  let hi = xs.length;

  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (xs[mid] < cutoff) lo = mid + 1;
    else hi = mid;
  }

  return lo;
}

function toNumberArray(arr: ArrayLike<number | null | undefined>): number[] {
  const out = new Array<number>(arr.length);
  for (let i = 0; i < arr.length; i++) {
    out[i] = arr[i] ?? NaN;
  }
  return out;
}

const createRangeFollowX =
  (windowSize: number): uPlot.Scale.Range =>
  (_u, _min, max) => {
    const latest = Number.isFinite(max) ? max : 0;
    return [latest - windowSize, latest];
  };

const DEFAULT_SERIES_STROKE = "#627eea";
const SERIES_DEFAULTS: uPlot.Series = {
  stroke: DEFAULT_SERIES_STROKE,
  width: 2,
  fill: "rgba(121, 145, 236, 0.22)",
};
const DEFAULT_FOLLOW_WINDOW_SIZE = 200;
const RETAIN_WINDOW_MULTIPLIER = 2;

const cutoffFollowX = (latest: number, windowSize: number): number =>
  latest - windowSize * RETAIN_WINDOW_MULTIPLIER;

const DEFAULTS: Partial<ChartOptions> = {
  scales: { y: { range: rangeWithPadding } },
  axes: [
    {
      ticks: { show: false },
      size: 24,
      gap: 0,
    },
    { size: 60 },
  ],
  cursor: { show: false },
  legend: { show: false },
};

export function TimeSeriesChart({ ref, options }: TimeSeriesChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const uplotRef = useRef<uPlot | null>(null);
  const [uPlotCtor, setUPlotCtor] = useState<typeof uPlot | null>(null);
  const bufferRef = useRef<number[][]>([]);
  const sizeRef = useRef<{ width: number; height: number } | null>(null);
  const [hasData, setHasData] = useState(false);
  const windowSize = options.xWindowSize ?? DEFAULT_FOLLOW_WINDOW_SIZE;

  const opts = {
    ...DEFAULTS,
    ...options,
    scales: {
      ...(DEFAULTS.scales ?? {}),
      ...(options.scales ?? {}),
      x: {
        ...(options.scales?.x ?? {}),
        range: createRangeFollowX(windowSize),
      },
    },
    series: (options.series ?? [{}]).map((s, i) =>
      i === 0 ? s : { ...SERIES_DEFAULTS, ...s },
    ),
  };
  const optsRef = useRef(opts);
  optsRef.current = opts;

  const trimXFollowOverflow = useCallback(() => {
    const buf = bufferRef.current;
    const xs = buf[0];
    if (!xs || xs.length === 0) return;

    const latest = xs[xs.length - 1];
    if (!Number.isFinite(latest)) return;

    const trimCount = findTrimCount(xs, cutoffFollowX(latest, windowSize));
    if (trimCount === 0) return;

    for (const series of buf) {
      series.splice(0, trimCount);
    }
  }, [windowSize]);

  const tryCreateUPlot = useCallback(() => {
    if (uplotRef.current) return;
    const UPlot = uPlotCtor;
    const size = sizeRef.current;
    const buf = bufferRef.current;
    if (!UPlot || !size || buf.length === 0 || !containerRef.current) return;

    const { title: _, xWindowSize: __, ...uplotOpts } = optsRef.current;
    uplotRef.current = new UPlot(
      { ...uplotOpts, width: size.width, height: size.height },
      buf as unknown as uPlot.AlignedData,
      containerRef.current,
    );
  }, [uPlotCtor]);

  useEffect(() => {
    let isMounted = true;
    import("uplot").then(({ default: mod }) => {
      if (isMounted) setUPlotCtor(() => mod);
    });
    return () => {
      isMounted = false;
      uplotRef.current?.destroy();
      uplotRef.current = null;
    };
  }, []);

  useEffect(() => {
    tryCreateUPlot();
  }, [tryCreateUPlot]);

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      const width = entry?.contentRect.width;
      const height = entry?.contentRect.height;
      if (!width || !height) return;
      sizeRef.current = { width, height };
      if (uplotRef.current) {
        uplotRef.current.setSize({ width, height });
      } else {
        tryCreateUPlot();
      }
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [tryCreateUPlot]);

  const seriesCount = options.series?.length ?? 0;

  useEffect(() => {
    if (!uplotRef.current) return;
    uplotRef.current.destroy();
    uplotRef.current = null;
    tryCreateUPlot();
  }, [seriesCount, tryCreateUPlot, windowSize]);

  useImperativeHandle(
    ref,
    () => ({
      push(chunk: uPlot.AlignedData) {
        const buf = bufferRef.current;

        if (buf.length === 0) {
          bufferRef.current = chunk.map((arr) =>
            toNumberArray(arr as ArrayLike<number | null | undefined>),
          );
        } else {
          while (buf.length < chunk.length) {
            buf.push(new Array(buf[0].length).fill(NaN));
          }

          const chunkLen = (chunk[0] as ArrayLike<number | null | undefined>)
            .length;
          for (let i = 0; i < chunkLen; i++) {
            for (let s = 0; s < buf.length; s++) {
              buf[s].push(
                (chunk[s] as ArrayLike<number | null | undefined>)?.[i] ?? NaN,
              );
            }
          }
        }
        trimXFollowOverflow();

        if (!hasData) setHasData(true);

        if (uplotRef.current) {
          uplotRef.current.setData(
            bufferRef.current as unknown as uPlot.AlignedData,
          );
        } else {
          tryCreateUPlot();
        }
      },
    }),
    [hasData, trimXFollowOverflow, tryCreateUPlot],
  );

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-lg border border-border bg-card p-3">
      {opts.title && (
        <div className="mb-2 text-sm font-medium text-foreground">
          {opts.title}
        </div>
      )}
      <div className="relative flex-1 overflow-hidden">
        {!hasData && (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
            waiting for data...
          </div>
        )}
        <div ref={containerRef} className="absolute inset-0" />
      </div>
    </div>
  );
}
