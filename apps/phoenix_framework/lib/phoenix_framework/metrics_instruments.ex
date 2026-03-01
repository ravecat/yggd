defmodule PhoenixFramework.MetricsInstruments do
  @moduledoc """
  Registers OTel instruments wired to BEAM/OS data sources.

  Observable Gauges use SDK-driven pull: the PeriodicMetricReader calls each
  callback on every collection cycle and records the returned value.

  WS connection count uses an Erlang :counters atomic stored in :persistent_term
  so TelemetryChannel can increment/decrement without a process roundtrip.
  """

  use GenServer

  require OpenTelemetryAPIExperimental.ObservableGauge

  alias OpenTelemetryAPIExperimental.ObservableGauge

  @ws_counter_key {__MODULE__, :ws_connections}

  def start_link(opts), do: GenServer.start_link(__MODULE__, opts, name: __MODULE__)

  def ws_connected, do: :counters.add(:persistent_term.get(@ws_counter_key), 1, 1)
  def ws_disconnected, do: :counters.sub(:persistent_term.get(@ws_counter_key), 1, 1)

  @impl GenServer
  def init(_opts) do
    counter = :counters.new(1, [:atomics])
    :persistent_term.put(@ws_counter_key, counter)
    register_runtime_gauges()
    register_ws_gauge(counter)
    {:ok, %{}}
  end

  defp register_runtime_gauges do
    ObservableGauge.create(
      :"system.cpu.load_average.1m",
      &cpu_load/1,
      [],
      %{description: "CPU 1-minute load average", unit: :"1"}
    )

    ObservableGauge.create(
      :"system.memory.usage",
      &host_memory_used/1,
      [],
      %{description: "Host memory allocated by BEAM (bytes)", unit: :By}
    )

    ObservableGauge.create(
      :"process.runtime.beam.process_count",
      &beam_process_count/1,
      [],
      %{description: "BEAM process count", unit: :"1"}
    )

    ObservableGauge.create(
      :"process.runtime.beam.memory.total",
      &beam_memory_total/1,
      [],
      %{description: "BEAM total memory (bytes)", unit: :By}
    )
  end

  defp register_ws_gauge(ws_counter) do
    ObservableGauge.create(
      :"phoenix.channel.connection.count",
      fn _args -> [{:counters.get(ws_counter, 1), %{}}] end,
      [],
      %{description: "Active WebSocket channel connections", unit: :"1"}
    )
  end

  # Observable Gauge callbacks must return [{number, attributes_map}].

  def cpu_load(_args) do
    try do
      [{:cpu_sup.avg1() / 256, %{}}]
    rescue
      _ -> [{0.0, %{}}]
    end
  end

  def host_memory_used(_args) do
    try do
      {_total, alloc, _worst} = :memsup.get_memory_data()
      [{alloc, %{}}]
    rescue
      _ -> [{0.0, %{}}]
    end
  end

  def beam_process_count(_args) do
    [{:erlang.system_info(:process_count), %{}}]
  end

  def beam_memory_total(_args) do
    [{:erlang.memory(:total), %{}}]
  end
end
