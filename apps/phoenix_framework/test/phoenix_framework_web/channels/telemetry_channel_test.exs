defmodule PhoenixFrameworkWeb.TelemetryChannelTest do
  use PhoenixFrameworkWeb.ChannelCase

  alias PhoenixFrameworkWeb.TelemetryChannel

  test "joins telemetry channel" do
    {:ok, _reply, _socket} =
      PhoenixFrameworkWeb.UserSocket
      |> socket("user_id", %{})
      |> subscribe_and_join(TelemetryChannel, "telemetry:metrics")
  end

  test "forwards each metric point to clients as a metric event" do
    {:ok, _reply, _socket} =
      PhoenixFrameworkWeb.UserSocket
      |> socket("user_id", %{})
      |> subscribe_and_join(TelemetryChannel, "telemetry:metrics")

    payload = %{
      "name" => "system.cpu.load_average.1m",
      "unit" => "1",
      "tsUnixSec" => 1_740_441_600.0,
      "series" => [
        %{"key" => "value", "value" => 0.42}
      ]
    }

    Phoenix.PubSub.broadcast(PhoenixFramework.PubSub, "telemetry:metrics", {:metric, payload})

    assert_push("metric", ^payload)
  end
end
