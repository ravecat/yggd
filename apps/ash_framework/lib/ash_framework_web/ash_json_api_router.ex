defmodule AshFrameworkWeb.AshJsonApiRouter do
  use AshJsonApi.Router,
    domains: [AshFramework.Accounts, AshFramework.Blog],
    open_api: "/spec"
end
