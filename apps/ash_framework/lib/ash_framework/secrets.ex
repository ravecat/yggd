defmodule AshFramework.Secrets do
  use AshAuthentication.Secret

  def secret_for(
        [:authentication, :tokens, :signing_secret],
        AshFramework.Accounts.User,
        _opts,
        _context
      ) do
    Application.fetch_env(:ash_framework, :token_signing_secret)
  end
end
