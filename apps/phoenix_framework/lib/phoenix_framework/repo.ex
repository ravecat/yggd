defmodule PhoenixFramework.Repo do
  use Ecto.Repo,
    otp_app: :phoenix_framework,
    adapter: Ecto.Adapters.Postgres
end
