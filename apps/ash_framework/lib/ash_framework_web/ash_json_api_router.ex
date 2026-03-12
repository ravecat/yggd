defmodule AshFrameworkWeb.AshJsonApiRouter do
  use AshJsonApi.Router,
    domains: Application.compile_env!(:ash_framework, :ash_domains),
    open_api: "/openapi",
    modify_open_api: {AshFrameworkWeb.OpenApiSpec, :modify, []}
end
