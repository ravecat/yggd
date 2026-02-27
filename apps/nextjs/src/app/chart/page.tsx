"use client";

import { useEffect, useRef, useState } from "react";
import { useSocket } from "@rvct/shared/react";
import type { PriceTick } from "@rvct/shared";
import type { Channel } from "phoenix";
import {
  TimeSeriesChart,
  type ChartRef,
} from "~/components/ui/time-series-chart";

type ConnectionStatus = "connecting" | "connected" | "disconnected";

export default function ChartPage() {
  const socket = useSocket();
  const [currencies, setCurrencies] = useState<string[]>([]);
  const charts = useRef<Map<string, ChartRef>>(new Map());
  const [status, setStatus] = useState<ConnectionStatus>("connecting");

  useEffect(() => {
    const channel: Channel = socket.channel("chart:prices");

    channel.on("price_tick", (payload: PriceTick) => {
      const symbol = payload.s;
      const ts = Math.floor(payload.E / 1000);
      const price = parseFloat(payload.c);
      if (!symbol || isNaN(price)) return;

      setCurrencies((prev) => {
        if (prev.includes(symbol)) return prev;
        return [...prev, symbol];
      });

      charts.current.get(symbol)?.push([[ts], [price]]);
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

  return (
    <div className="h-full overflow-auto">
      <div className="mx-auto flex h-full w-full max-w-6xl flex-col gap-4 px-4 py-4">
        {status === "disconnected" && (
          <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-2 text-sm text-destructive">
            Connection lost. Attempting to reconnect...
          </div>
        )}
        {currencies.map((symbol) => (
          <div key={symbol} className="flex-1 min-h-40">
            <TimeSeriesChart
              ref={(chart) => {
                if (chart) charts.current.set(symbol, chart);
                else charts.current.delete(symbol);
              }}
              options={{
                title: symbol,
                xWindowSize: 100,
                series: [{}, { label: symbol }],
              }}
            />
          </div>
        ))}
        {currencies.length === 0 && status === "connected" && (
          <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
            Waiting for price data...
          </div>
        )}
      </div>
    </div>
  );
}
