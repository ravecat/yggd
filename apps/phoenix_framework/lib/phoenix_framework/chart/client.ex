defmodule PhoenixFramework.Chart.Client do
  @moduledoc """
  WebSocket client that connects to Binance price stream and broadcasts
  price ticks to the `chart:prices` PubSub topic.
  """

  use WebSockex

  require Logger

  @base_url "wss://stream.binance.com:9443/stream?streams="
  @streams [
    "btcusdt@miniTicker",
    "ethusdt@miniTicker"
  ]
  @url @base_url <> Enum.join(@streams, "/")
  @topic "chart:prices"

  def start_link(opts \\ []) do
    WebSockex.start_link(@url, __MODULE__, %{}, Keyword.merge([name: __MODULE__], opts))
  end

  @impl WebSockex
  def handle_frame({:text, msg}, state) do
    with {:ok, %{"data" => data}} <- Jason.decode(msg) do
      Phoenix.PubSub.broadcast(PhoenixFramework.PubSub, @topic, {:price_tick, data})
    end

    {:ok, state}
  end

  def handle_frame(_frame, state), do: {:ok, state}

  @impl WebSockex
  def handle_disconnect(%{reason: reason}, state) do
    Logger.warning("Client disconnected: #{inspect(reason)}, reconnecting in 3s")
    Process.sleep(3_000)
    {:reconnect, state}
  end

  @impl WebSockex
  def handle_ping(:ping, state), do: {:reply, :pong, state}
end
