defmodule PhoenixFramework.Metric.ChannelExporterTest do
  use ExUnit.Case, async: true

  require Record

  alias PhoenixFramework.Metric.ChannelExporter

  Record.defrecord(
    :metric,
    Record.extract(:metric, from_lib: "opentelemetry_experimental/include/otel_metrics.hrl")
  )

  Record.defrecord(
    :gauge,
    Record.extract(:gauge, from_lib: "opentelemetry_experimental/include/otel_metrics.hrl")
  )

  Record.defrecord(
    :datapoint,
    Record.extract(:datapoint, from_lib: "opentelemetry_experimental/include/otel_metrics.hrl")
  )

  test "converts byte gauges to gibibytes for telemetry channel payloads" do
    topic = "telemetry:metrics:test:#{System.unique_integer([:positive])}"
    Phoenix.PubSub.subscribe(PhoenixFramework.PubSub, topic)

    measurement =
      metric(
        name: :"system.memory.usage",
        unit: :By,
        data:
          gauge(
            datapoints: [
              datapoint(time: :opentelemetry.timestamp(), value: 2_147_483_648, attributes: %{})
            ]
          )
      )

    assert :ok = ChannelExporter.export(:metrics, [measurement], %{}, %{topic: topic})

    assert_receive {:metric,
                    %{
                      "name" => "system.memory.usage",
                      "unit" => "GiBy",
                      "tsUnixSec" => ts,
                      "series" => [%{"key" => "value", "value" => value}]
                    }}

    assert is_number(ts)
    assert_in_delta(value, 2.0, 1.0e-9)
  end

  test "keeps non-byte units unchanged" do
    topic = "telemetry:metrics:test:#{System.unique_integer([:positive])}"
    Phoenix.PubSub.subscribe(PhoenixFramework.PubSub, topic)

    measurement =
      metric(
        name: :"http.server.duration",
        unit: :ms,
        data:
          gauge(
            datapoints: [datapoint(time: :opentelemetry.timestamp(), value: 150, attributes: %{})]
          )
      )

    assert :ok = ChannelExporter.export(:metrics, [measurement], %{}, %{topic: topic})

    assert_receive {:metric,
                    %{
                      "name" => "http.server.duration",
                      "unit" => "ms",
                      "series" => [%{"key" => "value", "value" => value}]
                    }}

    assert_in_delta(value, 150.0, 1.0e-9)
  end

  test "keeps byte units unchanged for metrics outside client policy list" do
    topic = "telemetry:metrics:test:#{System.unique_integer([:positive])}"
    Phoenix.PubSub.subscribe(PhoenixFramework.PubSub, topic)

    measurement =
      metric(
        name: :"custom.metric.bytes",
        unit: :By,
        data:
          gauge(
            datapoints: [
              datapoint(time: :opentelemetry.timestamp(), value: 1_024, attributes: %{})
            ]
          )
      )

    assert :ok = ChannelExporter.export(:metrics, [measurement], %{}, %{topic: topic})

    assert_receive {:metric,
                    %{
                      "name" => "custom.metric.bytes",
                      "unit" => "By",
                      "series" => [%{"key" => "value", "value" => value}]
                    }}

    assert_in_delta(value, 1_024.0, 1.0e-9)
  end

  test "hides dimensionless unit label" do
    topic = "telemetry:metrics:test:#{System.unique_integer([:positive])}"
    Phoenix.PubSub.subscribe(PhoenixFramework.PubSub, topic)

    measurement =
      metric(
        name: :"system.cpu.load_average.1m",
        unit: :"1",
        data:
          gauge(
            datapoints: [
              datapoint(time: :opentelemetry.timestamp(), value: 0.42, attributes: %{})
            ]
          )
      )

    assert :ok = ChannelExporter.export(:metrics, [measurement], %{}, %{topic: topic})

    assert_receive {:metric,
                    %{
                      "name" => "system.cpu.load_average.1m",
                      "unit" => "",
                      "series" => [%{"key" => "value", "value" => value}]
                    }}

    assert_in_delta(value, 0.42, 1.0e-9)
  end
end
