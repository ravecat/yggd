defmodule AshFrameworkWeb.AshJsonApiRouter do
  use AshJsonApi.Router,
    domains: Application.compile_env!(:ash_framework, :ash_domains),
    open_api: "/openapi",
    modify_open_api: {__MODULE__, :modify_open_api, []}

  def modify_open_api(spec, _conn, _opts) do
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

    put_in(
      spec,
      [
        Access.key!(:paths),
        Access.key!("/todos"),
        Access.key!(:get),
        Access.key!(:responses),
        Access.key!(200),
        Access.key!(:content),
        Access.key!("application/vnd.api+json"),
        Access.key!(:schema),
        Access.key!(:properties),
        Access.key!(:meta)
      ],
      meta_schema
    )
  end
end
