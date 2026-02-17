defmodule AshFramework.Tasks do
  use Ash.Domain,
    otp_app: :ash_framework,
    extensions: [AshAdmin.Domain, AshJsonApi.Domain, AshTypescript.Rpc]

  json_api do
    router AshJsonApi.Domain.Router
    show_raised_errors? true
  end

  admin do
    show? true
  end

  typescript_rpc do
    resource AshFramework.Tasks.Todo do
      rpc_action :list_todos, :read
      rpc_action :create_todo, :create
      rpc_action :update_todo, :update
    end
  end

  resources do
    resource AshFramework.Tasks.Todo
  end
end
