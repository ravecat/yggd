defmodule PhoenixFramework.Metric.Registry do
  @moduledoc false

  @bytes_per_gib 1_073_741_824

  @runtime_gauges [
    %{
      name: :"system.cpu.load_average.1m",
      description: "CPU 1-minute load average",
      unit: :"1",
      callback: &__MODULE__.cpu_load/1
    },
    %{
      name: :"system.memory.usage",
      description: "Host memory allocated by BEAM (bytes)",
      unit: :By,
      callback: &__MODULE__.host_memory_used/1,
      display: %{unit: "GiBy", scale: @bytes_per_gib}
    },
    %{
      name: :"process.runtime.beam.process_count",
      description: "BEAM process count",
      unit: :"1",
      callback: &__MODULE__.beam_process_count/1
    },
    %{
      name: :"process.runtime.beam.memory.total",
      description: "BEAM total memory (bytes)",
      unit: :By,
      callback: &__MODULE__.beam_memory_total/1,
      display: %{unit: "GiBy", scale: @bytes_per_gib}
    }
  ]

  @client_policy_by_name Enum.reduce(@runtime_gauges, %{}, fn metric, acc ->
                           case metric do
                             %{display: display} -> Map.put(acc, to_string(metric.name), display)
                             _ -> acc
                           end
                         end)

  def metrics_list, do: @runtime_gauges

  def scale(metric_name, unit) do
    case Map.get(@client_policy_by_name, to_string(metric_name)) do
      %{unit: display_unit, scale: scale} -> {display_unit, &(&1 / scale)}
      _ -> {unit_to_string(unit), & &1}
    end
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

  defp unit_to_string(nil), do: ""
  defp unit_to_string(:"1"), do: ""
  defp unit_to_string("1"), do: ""
  defp unit_to_string(unit), do: to_string(unit)
end
