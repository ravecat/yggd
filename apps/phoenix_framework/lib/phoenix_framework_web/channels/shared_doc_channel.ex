defmodule PhoenixFrameworkWeb.SharedDocChannel do
  use PhoenixFrameworkWeb, :channel
  require Logger

  alias Yex.Sync.SharedDoc
  alias PhoenixFrameworkWeb.SharedDocServer

  @moduledoc """
  Channel for real-time Yjs document synchronization.
  Handles sync messages for collaborative editing using Yex.
  """
  @impl true
  def join("y_doc_room:" <> doc_name, _payload, socket) do
    case SharedDocServer.lookup_doc_server(doc_name) do
      {:ok, doc_pid} ->
        SharedDoc.observe(doc_pid)

        socket =
          socket
          |> assign(:doc_name, doc_name)
          |> assign(:doc_pid, doc_pid)

        {:ok, socket}

      {:error, reason} ->
        Logger.error("Failed to start doc server: #{inspect(reason)}")
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
    SharedDoc.send_yjs_message(socket.assigns.doc_pid, chunk)
    {:noreply, socket}
  end

  @impl true
  def handle_info({:yjs, message, _proc}, socket) do
    push(socket, "yjs", {:binary, message})
    {:noreply, socket}
  end

  @impl true
  def terminate(_reason, _socket) do
    :ok
  end
end
