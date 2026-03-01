defmodule PhoenixFrameworkWeb.TelemetryChannelTest do
  use PhoenixFrameworkWeb.ChannelCase

  alias PhoenixFramework.MetricsInstruments
  alias PhoenixFrameworkWeb.TelemetryChannel

  setup do
    test_pid = self()

    Repatch.patch(MetricsInstruments, :ws_connected, [mode: :shared], fn ->
      send(test_pid, :ws_connected)
      :ok
    end)

    Repatch.patch(MetricsInstruments, :ws_disconnected, [mode: :shared], fn ->
      send(test_pid, :ws_disconnected)
      :ok
    end)

    :ok
  end

  test "joins telemetry channel and tracks connected socket count" do
    {:ok, _reply, _socket} =
      PhoenixFrameworkWeb.UserSocket
      |> socket("user_id", %{})
      |> subscribe_and_join(TelemetryChannel, "telemetry:metrics")

    assert_receive :ws_connected
  end

  test "forwards each metric chunk to clients as a metric event" do
    {:ok, _reply, _socket} =
      PhoenixFrameworkWeb.UserSocket
      |> socket("user_id", %{})
      |> subscribe_and_join(TelemetryChannel, "telemetry:metrics")

    payload = %{
      "name" => "system.cpu.load_average.1m",
      "unit" => "1",
      "gauge" => %{
        "dataPoints" => [
          %{
            "timeUnixNano" => "1740441600000000000",
            "asDouble" => 0.42,
            "attributes" => []
          }
        ]
      }
    }

    Phoenix.PubSub.broadcast(PhoenixFramework.PubSub, "telemetry:metrics", {:metric, payload})

    assert_push("metric", ^payload)
  end
end
