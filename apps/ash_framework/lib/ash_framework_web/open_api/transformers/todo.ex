defmodule AshFrameworkWeb.OpenApi.Transformers.Todo do
  def transform(spec, _conn, opts) do
    statuses_enum = Enum.map(AshFramework.Tasks.TodoStatus.values(), &to_string/1)

    meta_schema = %OpenApiSpex.Schema{
      type: :object,
      additionalProperties: true,
      properties: %{
        statuses: %OpenApiSpex.Schema{
          type: :array,
          items: %OpenApiSpex.Schema{
            type: :string,
            enum: statuses_enum
          }
        }
      }
    }

    with todos_path when is_binary(todos_path) <- collection_path(opts),
         properties when is_map(properties) <-
           get_in(spec, [
             Access.key!(:paths),
             Access.key!(todos_path),
             Access.key!(:get),
             Access.key!(:responses),
             Access.key!(200),
             Access.key!(:content),
             Access.key!("application/vnd.api+json"),
             Access.key!(:schema),
             Access.key!(:properties)
           ]) do
      update_in(
        spec,
        [
          Access.key!(:paths),
          Access.key!(todos_path),
          Access.key!(:get),
          Access.key!(:responses),
          Access.key!(200),
          Access.key!(:content),
          Access.key!("application/vnd.api+json"),
          Access.key!(:schema),
          Access.key!(:properties)
        ],
        &Map.put(&1, :meta, meta_schema)
      )
    else
      _ -> spec
    end
  end

  defp collection_path(opts) do
    resource = AshFramework.Tasks.Todo
    domain = Ash.Resource.Info.domain(resource)

    resource
    |> AshJsonApi.Resource.Info.routes(domain)
    |> Enum.find(&(&1.method == :get and &1.type == :index))
    |> case do
      nil ->
        nil

      route ->
        route
        |> AshJsonApi.JsonSchema.route_href(domain, opts)
        |> elem(0)
    end
  end
end
