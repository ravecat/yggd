"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSocket } from "@rvct/shared/react";
import type { PriceTick } from "@rvct/shared";
import type { Channel } from "phoenix";
import { TimeSeriesChart, type ChartData } from "~/components/ui/time-series-chart";

const MAX_POINTS = 300;

type ConnectionStatus = "connecting" | "connected" | "disconnected";

type Buffers = Record<string, ChartData>;

function appendToBuffer(prev: Buffers, tick: PriceTick): Buffers {
  const symbol = tick.s;
  const ts = Math.floor(tick.E / 1000);
  const price = parseFloat(tick.c);
  if (!symbol || isNaN(price)) return prev;

  const buf = prev[symbol] ?? [[], []];
  const nextTs = [...(buf[0] as number[]), ts];
  const nextValues = [...(buf[1] as number[]), price];
  if (nextTs.length > MAX_POINTS) {
    nextTs.splice(0, 1);
    nextValues.splice(0, 1);
  }

  return { ...prev, [symbol]: [nextTs, nextValues] };
}

export default function ChartPage() {
  const socket = useSocket();
  const [buffers, setBuffers] = useState<Buffers>({});
  const buffersRef = useRef<Buffers>({});
  const [status, setStatus] = useState<ConnectionStatus>("connecting");

  useEffect(() => {
    const channel: Channel = socket.channel("chart:prices");

    channel.on("price_tick", (tick: PriceTick) => {
      const next = appendToBuffer(buffersRef.current, tick);
      buffersRef.current = next;
      setBuffers(next);
    });

    channel
      .join()
      .receive("ok", () => {
        setStatus("connected");
      })
      .receive("error", () => {
        setStatus("disconnected");
      });

    channel.onClose(() => setStatus("disconnected"));
    channel.onError(() => setStatus("disconnected"));

    return () => {
      channel.leave();
    };
  }, [socket]);

  const symbols = useMemo(() => Object.keys(buffers), [buffers]);

  return (
    <div className="h-full overflow-auto">
      <div className="mx-auto flex h-full w-full max-w-6xl flex-col gap-4 px-4 py-4">
        {status === "disconnected" && (
          <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-2 text-sm text-destructive">
            Connection lost. Attempting to reconnect...
          </div>
        )}
        {symbols.map((symbol) => (
          <div key={symbol} className="flex-1 min-h-40">
            <TimeSeriesChart
              options={{
                title: symbol,
                series: [{}, { label: symbol }],
              }}
              data={buffers[symbol]}
            />
          </div>
        ))}
        {symbols.length === 0 && status === "connected" && (
          <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
            Waiting for price data...
          </div>
        )}
      </div>
    </div>
  );
}
