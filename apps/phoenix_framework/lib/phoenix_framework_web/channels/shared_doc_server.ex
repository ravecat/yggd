defmodule PhoenixFrameworkWeb.SharedDocServer do
  @moduledoc """
  Server for managing SharedDoc processes dynamically.
  Handles lifecycle of Yjs document synchronization processes.
  """

  alias Yex.Sync.SharedDoc

  @doc """
  Starts or retrieves existing SharedDoc process for given document name.
  """
  @spec lookup_doc_server(String.t()) :: {:ok, pid()} | {:error, term()}
  def lookup_doc_server(doc_name) do
    case Registry.lookup(PhoenixFramework.Registry, doc_name) do
      [{pid, _}] ->
        {:ok, pid}

      [] ->
        start_doc_server(doc_name)
    end
  end

  @doc """
  Starts a new SharedDoc process under DynamicSupervisor.
  """
  @spec start_doc_server(String.t()) :: {:ok, pid()} | {:error, term()}
  def start_doc_server(doc_name) do
    case DynamicSupervisor.start_child(
           PhoenixFramework.Supervisor.SharedDoc,
           {SharedDoc,
            doc_name: doc_name, persistence: PhoenixFramework.Yjs.Persistence, name: via(doc_name)}
         ) do
      {:ok, pid} ->
        {:ok, pid}

      {:error, {:already_started, pid}} ->
        {:ok, pid}

      {:error, reason} ->
        {:error, reason}
    end
  end

  @doc """
  Stops SharedDoc process for given document name.
  """
  @spec stop_doc_server(String.t()) :: :ok | {:error, :not_found}
  def stop_doc_server(doc_name) do
    case Registry.lookup(PhoenixFramework.Registry, doc_name) do
      [{pid, _}] ->
        DynamicSupervisor.terminate_child(
          PhoenixFramework.Supervisor.SharedDoc,
          pid
        )

      [] ->
        {:error, :not_found}
    end
  end

  defp via(doc_name) do
    {:via, Registry, {PhoenixFramework.Registry, doc_name}}
  end
end
