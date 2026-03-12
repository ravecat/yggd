defmodule AshFramework.Tasks.BoardVisibility do
  use Ash.Type.Enum,
    values: [:private, :public]
end
