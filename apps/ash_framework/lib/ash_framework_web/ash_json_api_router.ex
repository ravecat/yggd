defmodule AshFrameworkWeb.AshJsonApiRouter do
  use AshJsonApi.Router,
    domains: [AshFramework.Accounts, AshFramework.Tasks],
    open_api: "/spec"
end
