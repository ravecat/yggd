defmodule PhoenixFrameworkWeb.PricesChannel do
  use PhoenixFrameworkWeb, :channel

  @moduledoc """
  Pushes live crypto price ticks to connected clients.
  Subscribes to PubSub and forwards each new tick from Chart.Client.
  """

  @impl true
  def join("chart:prices", _payload, socket) do
    Phoenix.PubSub.subscribe(PhoenixFramework.PubSub, "chart:prices")
    {:ok, socket}
  end

  @impl true
  def handle_info({:price_tick, tick}, socket) do
    push(socket, "price_tick", tick)
    {:noreply, socket}
  end
end
