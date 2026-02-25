defmodule PhoenixFrameworkWeb.TelemetryChannel do
  use PhoenixFrameworkWeb, :channel

  alias PhoenixFramework.MetricsInstruments

  @moduledoc """
  Pushes OTLP JSON metric snapshots to connected clients every second.

  On join, subscribes to the "telemetry:metrics" PubSub topic.
  Each broadcast from ChannelMetricsExporter arrives as {:metrics, payload}
  and is forwarded to the client as a "metrics" channel event.
  """

  @impl true
  def join("telemetry:metrics", _payload, socket) do
    Phoenix.PubSub.subscribe(PhoenixFramework.PubSub, "telemetry:metrics")
    MetricsInstruments.ws_connected()
    {:ok, socket}
  end

  @impl true
  def handle_info({:metrics, payload}, socket) do
    push(socket, "metrics", payload)
    {:noreply, socket}
  end

  @impl true
  def terminate(_reason, _socket) do
    MetricsInstruments.ws_disconnected()
    :ok
  end
end
