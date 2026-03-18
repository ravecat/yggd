defmodule PhoenixFramework.Logging.MemoryServer do
  @moduledoc """
  In-memory log storage backed by a GenServer.

  The server keeps only the latest `capacity` log entries in insertion order.
  """

  use GenServer

  @default_capacity 10

  @type log_entry :: %{
          id: pos_integer(),
          inserted_at: DateTime.t(),
          message: String.t()
        }

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts \\ []) do
    {capacity, opts} = Keyword.pop(opts, :capacity, @default_capacity)
    {name, _opts} = Keyword.pop(opts, :name, __MODULE__)

    state = %{
      capacity: capacity,
      entries: :queue.new()
    }

    case name do
      nil -> GenServer.start_link(__MODULE__, state)
      _ -> GenServer.start_link(__MODULE__, state, name: name)
    end
  end

  @spec append(String.t()) :: {:ok, log_entry()} | {:error, :invalid_message}
  def append(message), do: append(__MODULE__, message)

  @spec append(GenServer.server(), String.t()) :: {:ok, log_entry()} | {:error, :invalid_message}
  def append(server, message) when is_binary(message) and byte_size(message) > 0 do
    GenServer.call(server, {:append, message})
  end

  def append(_server, _message), do: {:error, :invalid_message}

  @spec latest() :: [log_entry()]
  def latest, do: latest(__MODULE__, @default_capacity)

  @spec latest(pos_integer()) :: [log_entry()] | {:error, :invalid_limit}
  def latest(limit) when is_integer(limit), do: latest(__MODULE__, limit)

  @spec latest(GenServer.server()) :: [log_entry()]
  def latest(server), do: latest(server, @default_capacity)

  @spec latest(GenServer.server(), pos_integer()) :: [log_entry()] | {:error, :invalid_limit}
  def latest(server, limit) when is_integer(limit) and limit > 0 do
    GenServer.call(server, {:latest, limit})
  end

  def latest(_server, _limit), do: {:error, :invalid_limit}

  @impl GenServer
  def init(%{capacity: capacity} = state) when is_integer(capacity) and capacity > 0 do
    {:ok, state}
  end

  def init(_state), do: {:stop, :invalid_capacity}

  @impl GenServer
  def handle_call({:append, message}, _from, state) do
    entry = %{
      id: System.unique_integer([:monotonic, :positive]),
      inserted_at: DateTime.utc_now(),
      message: message
    }

    entries =
      entry
      |> :queue.in(state.entries)
      |> trim_to_capacity(state.capacity)

    {:reply, {:ok, entry}, %{state | entries: entries}}
  end

  def handle_call({:latest, limit}, _from, state) do
    entries =
      state.entries
      |> :queue.to_list()
      |> Enum.take(-limit)

    {:reply, entries, state}
  end

  defp trim_to_capacity(entries, capacity) do
    if :queue.len(entries) > capacity do
      {{:value, _dropped_entry}, trimmed_entries} = :queue.out(entries)
      trim_to_capacity(trimmed_entries, capacity)
    else
      entries
    end
  end
end
