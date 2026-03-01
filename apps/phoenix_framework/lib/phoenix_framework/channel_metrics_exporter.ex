defmodule PhoenixFramework.ChannelMetricsExporter do
  @moduledoc """
  OTel metrics exporter that broadcasts per-metric OTLP JSON chunks to PubSub.

  Implements the `otel_exporter` behaviour (opentelemetry package).
  The OTel SDK periodic reader calls `export/4` on each collection cycle.
  We convert SDK-internal Erlang records to OTLP-compatible metric maps and
  broadcast it to the "telemetry:metrics" PubSub topic.

  OTLP JSON spec: https://opentelemetry.io/docs/specs/otlp/#json-protobuf-encoding
  """

  @behaviour :otel_exporter

  require Record

  # Extract Erlang record definitions from the SDK's .hrl files.
  # This is the standard Elixir way to pattern-match on Erlang records.
  Record.defrecord(
    :metric,
    Record.extract(:metric, from_lib: "opentelemetry_experimental/include/otel_metrics.hrl")
  )

  Record.defrecord(
    :gauge,
    Record.extract(:gauge, from_lib: "opentelemetry_experimental/include/otel_metrics.hrl")
  )

  Record.defrecord(
    :histogram,
    Record.extract(:histogram, from_lib: "opentelemetry_experimental/include/otel_metrics.hrl")
  )

  Record.defrecord(
    :datapoint,
    Record.extract(:datapoint, from_lib: "opentelemetry_experimental/include/otel_metrics.hrl")
  )

  Record.defrecord(
    :histogram_datapoint,
    Record.extract(:histogram_datapoint,
      from_lib: "opentelemetry_experimental/include/otel_metrics.hrl"
    )
  )

  def init(%{topic: topic}), do: {:ok, %{topic: topic}}
  def init(_opts), do: {:ok, %{topic: "telemetry:metrics"}}

  def export(:metrics, metrics, _resource, %{topic: topic}) do
    metrics
    |> Enum.flat_map(&metric_to_otlp/1)
    |> Enum.each(&Phoenix.PubSub.broadcast(PhoenixFramework.PubSub, topic, {:metric, &1}))

    :ok
  end

  def force_flush, do: :ok

  def shutdown(_config), do: :ok

  defp metric_to_otlp(metric(name: name, unit: unit, data: data)) do
    case otlp_data(name, unit, data) do
      nil -> []
      entry -> [entry]
    end
  end

  # Gauge → single OTLP gauge entry with one datapoint per SDK datapoint
  defp otlp_data(name, unit, gauge(datapoints: datapoints)) do
    %{
      "name" => to_string(name),
      "unit" => to_string(unit),
      "gauge" => %{
        "dataPoints" => Enum.map(datapoints, &gauge_datapoint/1)
      }
    }
  end

  # Histogram → compute p50/p95 from bucket counts, emit as gauge with quantile attribute
  defp otlp_data(name, unit, histogram(datapoints: [hdp | _])) do
    {p50, p95} = percentiles_from_histogram(hdp)
    time = histogram_datapoint(hdp, :time)

    %{
      "name" => to_string(name),
      "unit" => to_string(unit),
      "gauge" => %{
        "dataPoints" => [
          quantile_datapoint(p50, "p50", time),
          quantile_datapoint(p95, "p95", time)
        ]
      }
    }
  end

  defp otlp_data(_name, _unit, _unknown), do: nil

  defp gauge_datapoint(datapoint(value: value, time: time, attributes: attrs)) do
    %{
      "asDouble" => value / 1,
      "timeUnixNano" => to_epoch_nano_string(time),
      "attributes" => attributes_to_otlp(attrs)
    }
  end

  defp quantile_datapoint(value, quantile, time) do
    %{
      "asDouble" => value / 1,
      "timeUnixNano" => to_epoch_nano_string(time),
      "attributes" => [
        %{"key" => "quantile", "value" => %{"stringValue" => quantile}}
      ]
    }
  end

  # OTel datapoint timestamps are monotonic native units and must be converted
  # to POSIX nanoseconds for OTLP JSON `timeUnixNano`.
  defp to_epoch_nano_string(time) do
    time
    |> :opentelemetry.timestamp_to_nano()
    |> Integer.to_string()
  end

  # Compute approximate p50 and p95 from explicit histogram bucket counts.
  # explicit_bounds defines bucket upper boundaries; bucket_counts has one
  # extra element for the overflow bucket (> last boundary).
  defp percentiles_from_histogram(hdp) do
    bounds = histogram_datapoint(hdp, :explicit_bounds) || []
    raw_counts = histogram_datapoint(hdp, :bucket_counts) || []
    count = histogram_datapoint(hdp, :count) || 0

    counts = if is_list(raw_counts), do: raw_counts, else: []

    if count == 0 or counts == [] do
      {0.0, 0.0}
    else
      p50 = interpolate_percentile(bounds, counts, count, 0.50)
      p95 = interpolate_percentile(bounds, counts, count, 0.95)
      {p50, p95}
    end
  end

  # Linear interpolation within the bucket that contains the target percentile.
  defp interpolate_percentile(bounds, counts, total, p) do
    target = p * total
    buckets = build_buckets(bounds, counts)
    find_percentile(buckets, target, 0, 0)
  end

  defp build_buckets([], [count | _]), do: [{:infinity, count}]

  defp build_buckets([bound | rest_b], [count | rest_c]) do
    [{bound, count} | build_buckets(rest_b, rest_c)]
  end

  defp build_buckets([], []), do: []

  defp find_percentile([], _target, _cumulative, _prev_bound), do: 0.0

  defp find_percentile([{bound, count} | rest], target, cumulative, prev_bound) do
    new_cumulative = cumulative + count

    if new_cumulative >= target and count > 0 do
      upper = if bound == :infinity, do: prev_bound * 2, else: bound
      # interpolate within bucket
      fraction = (target - cumulative) / count
      prev_bound + fraction * (upper - prev_bound)
    else
      next_lower = if bound == :infinity, do: prev_bound, else: bound
      find_percentile(rest, target, new_cumulative, next_lower)
    end
  end

  defp attributes_to_otlp(attrs) when is_map(attrs) do
    Enum.map(attrs, fn {k, v} ->
      %{"key" => to_string(k), "value" => %{"stringValue" => to_string(v)}}
    end)
  end

  defp attributes_to_otlp(_), do: []
end
