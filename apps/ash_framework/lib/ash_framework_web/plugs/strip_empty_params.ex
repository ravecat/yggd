defmodule AshFrameworkWeb.Plugs.StripEmptyParams do
  @moduledoc """
  Strips query parameters with empty string values before they reach validation.

  JSON:API does not permit empty strings for parameters like `sort`, `include`, etc.
  Browsers and client code may produce URLs like `?sort=` when clearing values.
  This plug removes those entries so downstream validation sees them as absent.
  """

  @behaviour Plug

  @impl true
  def init(opts), do: opts

  @impl true
  def call(conn, _opts) do
    query_params =
      conn.query_params
      |> Enum.reject(fn {_key, value} -> value == "" end)
      |> Map.new()

    %{conn | query_params: query_params}
  end
end
