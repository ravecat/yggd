defmodule AshFrameworkWeb.AshJsonApiRouter do
  use AshJsonApi.Router,
    domains: [AshFramework.Accounts],
    open_api: "/spec"
end
