defmodule PhoenixFrameworkWeb.TelemetryChannel do
  use PhoenixFrameworkWeb, :channel

  @moduledoc """
  Pushes per-metric telemetry points to connected clients.

  On join, subscribes to the "telemetry:metrics" PubSub topic.
  Each broadcast from Metric.ChannelExporter arrives as {:metric, payload}
  and is forwarded to the client as a "metric" channel event.
  """

  @impl true
  def join("telemetry:metrics", _payload, socket) do
    Phoenix.PubSub.subscribe(PhoenixFramework.PubSub, "telemetry:metrics")
    {:ok, socket}
  end

  @impl true
  def handle_info({:metric, payload}, socket) do
    push(socket, "metric", payload)
    {:noreply, socket}
  end
end
