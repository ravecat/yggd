defmodule AshFramework.Tasks.TaskPriority do
  use Ash.Type.Enum, values: [:low, :medium, :high, :urgent]
end
