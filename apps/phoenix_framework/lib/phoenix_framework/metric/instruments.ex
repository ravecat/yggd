defmodule PhoenixFramework.Metric.Instruments do
  @moduledoc """
  Registers OTel instruments wired to BEAM/OS data sources.

  Observable Gauges use SDK-driven pull: the PeriodicMetricReader calls each
  callback on every collection cycle and records the returned value.
  """

  use GenServer

  require OpenTelemetryAPIExperimental.ObservableGauge

  alias PhoenixFramework.Metric.Registry
  alias OpenTelemetryAPIExperimental.ObservableGauge

  def start_link(opts), do: GenServer.start_link(__MODULE__, opts, name: __MODULE__)

  @impl GenServer
  def init(_opts) do
    register_runtime_gauges()
    {:ok, %{}}
  end

  defp register_runtime_gauges do
    Enum.each(Registry.metrics_list(), fn metric ->
      ObservableGauge.create(
        metric.name,
        metric.callback,
        [],
        %{description: metric.description, unit: metric.unit}
      )
    end)
  end
end
