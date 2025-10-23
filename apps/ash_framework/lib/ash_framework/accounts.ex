defmodule AshFramework.Accounts do
  use Ash.Domain, otp_app: :ash_framework, extensions: [AshAdmin.Domain]

  admin do
    show? true
  end

  resources do
    resource AshFramework.Accounts.Token
    resource AshFramework.Accounts.User
  end
end
