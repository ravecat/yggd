defmodule PhoenixFrameworkWeb.UserSocket do
  use Phoenix.Socket

  @moduledoc """
  Socket handler for WebSocket connections.
  Manages channel subscriptions and authentication.
  """

  # Channels
  channel "y_doc_room:*", PhoenixFrameworkWeb.SharedDocChannel

  @impl true
  def connect(_params, socket, _connect_info) do
    {:ok, socket}
  end

  @impl true
  def id(_socket), do: nil
end
