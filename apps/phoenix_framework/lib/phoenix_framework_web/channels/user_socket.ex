defmodule PhoenixFrameworkWeb.UserSocket do
  use Phoenix.Socket
  require Logger

  @moduledoc """
  Socket handler for WebSocket connections.
  Manages channel subscriptions and authentication.
  """

  # Channels
  channel "y_doc_room:*", PhoenixFrameworkWeb.SharedDocChannel
  channel "telemetry:metrics", PhoenixFrameworkWeb.TelemetryChannel

  @impl true
  def connect(params, socket, _connect_info) do
    Logger.debug("WebSocket connection: #{inspect(params)}")
    {:ok, socket}
  end

  @impl true
  def id(_socket), do: nil
end
