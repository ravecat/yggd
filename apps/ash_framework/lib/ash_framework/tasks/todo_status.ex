defmodule AshFramework.Tasks.TodoStatus do
  use Ash.Type.Enum,
    values: [:blocked, :backlog, :in_progress, :review, :done, :rejected]
end
