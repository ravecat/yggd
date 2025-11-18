defmodule PhoenixFrameworkWeb.SharedDocChannel do
  use PhoenixFrameworkWeb, :channel
  require Logger

  alias Yex.Sync.SharedDoc
  alias PhoenixFrameworkWeb.SharedDocServer

  @moduledoc """
  Channel for real-time Yjs document synchronization.
  Handles sync messages for collaborative editing using Yex.

  Uses Phoenix.PubSub for broadcasting updates to all connected clients
  instead of relying on Yex.Sync.SharedDoc observer mechanism.
  """
  @impl true
  def join("y_doc_room:" <> doc_name, _payload, socket) do
    case SharedDocServer.lookup_doc_server(doc_name) do
      {:ok, doc_pid} ->
        Phoenix.PubSub.subscribe(PhoenixFramework.PubSub, "y_doc_room:#{doc_name}")

        socket =
          socket
          |> assign(:doc_name, doc_name)
          |> assign(:doc_pid, doc_pid)

        {:ok, socket}

      {:error, reason} ->
        Logger.error("Failed to start doc server for #{doc_name}: #{inspect(reason)}")
        {:error, %{reason: "failed to initialize document"}}
    end
  end

  @impl true
  def handle_in("yjs_sync", {:binary, chunk}, socket) do
    SharedDoc.start_sync(socket.assigns.doc_pid, chunk)
    {:noreply, socket}
  end

  @impl true
  def handle_in("yjs", {:binary, chunk}, socket) do
    # Apply update to SharedDoc (for persistence and CRDT merging)
    SharedDoc.send_yjs_message(socket.assigns.doc_pid, chunk)

    # Broadcast to all other connected clients via PubSub
    Phoenix.PubSub.broadcast_from(
      PhoenixFramework.PubSub,
      self(),
      "y_doc_room:#{socket.assigns.doc_name}",
      {:yjs_update, chunk}
    )

    {:noreply, socket}
  end

  @impl true
  def handle_info({:yjs_update, chunk}, socket) do
    # Received update from another client via PubSub
    push(socket, "yjs", {:binary, chunk})
    {:noreply, socket}
  end

  @impl true
  def handle_info(msg, socket) do
    Logger.debug("Unknown message: #{inspect(msg)}")
    {:noreply, socket}
  end

  @impl true
  def terminate(_reason, _socket) do
    :ok
  end
end
