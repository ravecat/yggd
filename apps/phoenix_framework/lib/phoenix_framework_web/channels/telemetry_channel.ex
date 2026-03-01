defmodule PhoenixFrameworkWeb.TelemetryChannel do
  use PhoenixFrameworkWeb, :channel

  alias PhoenixFramework.MetricsInstruments

  @moduledoc """
  Pushes per-metric OTLP JSON chunks to connected clients.

  On join, subscribes to the "telemetry:metrics" PubSub topic.
  Each broadcast from ChannelMetricsExporter arrives as {:metric, payload}
  and is forwarded to the client as a "metric" channel event.
  """

  @impl true
  def join("telemetry:metrics", _payload, socket) do
    Phoenix.PubSub.subscribe(PhoenixFramework.PubSub, "telemetry:metrics")
    MetricsInstruments.ws_connected()
    {:ok, socket}
  end

  @impl true
  def handle_info({:metric, payload}, socket) do
    push(socket, "metric", payload)
    {:noreply, socket}
  end

  @impl true
  def terminate(_reason, _socket) do
    MetricsInstruments.ws_disconnected()
    :ok
  end
end
