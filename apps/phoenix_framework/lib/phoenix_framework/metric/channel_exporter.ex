defmodule PhoenixFramework.Metric.ChannelExporter do
  @moduledoc """
  OTel metrics exporter that broadcasts chart-ready metric points to PubSub.

  Implements the `otel_exporter` behaviour (opentelemetry package).
  The OTel SDK periodic reader calls `export/4` on each collection cycle.
  We project SDK-internal metric records into channel payloads matching
  AsyncAPI telemetryMetricPoint schema and broadcast them to "telemetry:metrics".
  """

  @behaviour :otel_exporter

  require Record

  alias PhoenixFramework.Metric.Registry

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
    |> Enum.flat_map(&metric_to_point/1)
    |> Enum.each(&Phoenix.PubSub.broadcast(PhoenixFramework.PubSub, topic, {:metric, &1}))

    :ok
  end

  def force_flush, do: :ok

  def shutdown(_config), do: :ok

  defp metric_to_point(metric(name: name, unit: unit, data: data)) do
    case point_data(name, unit, data) do
      nil -> []
      entry -> [entry]
    end
  end

  defp point_data(_name, _unit, gauge(datapoints: [])), do: nil

  # Gauge datapoints are projected into a single chart point with named series.
  defp point_data(name, unit, gauge(datapoints: datapoints)) do
    {display_unit, value_scaler} = Registry.scale(name, unit)
    ts = datapoints |> List.first() |> datapoint(:time) |> to_epoch_seconds()
    series = Enum.map(datapoints, &gauge_series(&1, value_scaler))

    %{
      "name" => to_string(name),
      "unit" => display_unit,
      "tsUnixSec" => ts,
      "series" => series
    }
  end

  # Histogram datapoints are projected into p50/p95 series.
  defp point_data(name, unit, histogram(datapoints: [hdp | _])) do
    {display_unit, value_scaler} = Registry.scale(name, unit)
    {p50, p95} = percentiles_from_histogram(hdp)
    time = histogram_datapoint(hdp, :time)

    %{
      "name" => to_string(name),
      "unit" => display_unit,
      "tsUnixSec" => to_epoch_seconds(time),
      "series" => [
        %{"key" => "p50", "value" => value_scaler.(p50)},
        %{"key" => "p95", "value" => value_scaler.(p95)}
      ]
    }
  end

  defp point_data(_name, _unit, _unknown), do: nil

  defp gauge_series(datapoint(value: value, attributes: attrs), value_scaler) do
    %{
      "key" => series_key(attrs),
      "value" => value_scaler.(value / 1)
    }
  end

  defp series_key(attrs) when is_map(attrs) do
    quantile = Map.get(attrs, :quantile) || Map.get(attrs, "quantile")

    cond do
      not is_nil(quantile) ->
        to_string(quantile)

      map_size(attrs) == 0 ->
        "value"

      true ->
        attrs
        |> Enum.map(fn {k, v} -> "#{k}=#{v}" end)
        |> Enum.sort()
        |> Enum.join(",")
    end
  end

  defp series_key(_attrs), do: "value"

  # Convert OTel native time to Unix seconds for chart x-axis.
  defp to_epoch_seconds(time) do
    nanos = :opentelemetry.timestamp_to_nano(time)
    div(nanos, 1_000_000_000) + rem(nanos, 1_000_000_000) / 1_000_000_000
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
end
