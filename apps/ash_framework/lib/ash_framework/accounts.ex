defmodule AshFramework.Accounts do
  use Ash.Domain,
    otp_app: :ash_framework,
    extensions: [AshAdmin.Domain, AshJsonApi.Domain, AshTypescript.Rpc]

  admin do
    show? true
  end

  typescript_rpc do
    resource AshFramework.Accounts.User do
      rpc_action :get_by_email, :get_by_email
      rpc_action :list_users, :read
    end
  end

  resources do
    resource AshFramework.Accounts.Token
    resource AshFramework.Accounts.User
    resource AshFramework.Accounts.UserIdentity
  end
end
