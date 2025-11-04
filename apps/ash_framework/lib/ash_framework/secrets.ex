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

  def secret_for(
        [:authentication, :strategies, :google, :client_id],
        AshFramework.Accounts.User,
        _opts,
        _context
      ) do
    case Application.fetch_env(:ash_framework, :oauth) do
      {:ok, config} -> {:ok, Keyword.fetch!(config, :google_client_id)}
      :error -> :error
    end
  end

  def secret_for(
        [:authentication, :strategies, :google, :client_secret],
        AshFramework.Accounts.User,
        _opts,
        _context
      ) do
    case Application.fetch_env(:ash_framework, :oauth) do
      {:ok, config} -> {:ok, Keyword.fetch!(config, :google_client_secret)}
      :error -> :error
    end
  end

  def secret_for(
        [:authentication, :strategies, :google, :redirect_uri],
        AshFramework.Accounts.User,
        _opts,
        _context
      ) do
    case Application.fetch_env(:ash_framework, :oauth) do
      {:ok, config} -> {:ok, Keyword.fetch!(config, :google_redirect_uri)}
      :error -> :error
    end
  end
end
