defmodule AshFramework.Tasks.TaskPriority do
  @priority_values [
    low: 1,
    medium: 2,
    high: 3,
    urgent: 4
  ]

  use Ash.Type.Enum, values: [:low, :medium, :high, :urgent]

  @priority_to_integer Map.new(@priority_values)
  @integer_to_priority Map.new(@priority_values, fn {priority, integer} ->
                         {integer, priority}
                       end)

  def storage_type, do: :integer

  def cast_stored(nil, _), do: {:ok, nil}

  def cast_stored(value, _) when is_integer(value) do
    case @integer_to_priority[value] do
      nil -> :error
      priority -> {:ok, priority}
    end
  end

  def cast_stored(value, constraints), do: super(value, constraints)

  def dump_to_native(nil, _), do: {:ok, nil}

  def dump_to_native(value, _) do
    with {:ok, priority} <- match(value),
         {:ok, integer} <- Map.fetch(@priority_to_integer, priority) do
      {:ok, integer}
    else
      _ -> :error
    end
  end
end
