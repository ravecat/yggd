defmodule AshFramework.Tasks.TodoStatus do
  use Ash.Type.Enum, values: [:todo, :in_progress, :completed]
end
