defmodule AshFrameworkWeb.OpenApiSpec do
  @transformers [
    AshFrameworkWeb.OpenApi.Transformers.Todo
  ]

  def modify(spec, conn, opts) do
    Enum.reduce(@transformers, spec, fn transformer, acc ->
      transformer.transform(acc, conn, opts)
    end)
  end
end
