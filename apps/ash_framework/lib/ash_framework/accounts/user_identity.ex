defmodule AshFramework.Accounts.UserIdentity do
  @moduledoc """
  UserIdentity resource for storing OAuth provider identities.

  Each record represents one OAuth authentication for a user.
  A user can have multiple identities (Google, GitHub, etc.).
  """
  use Ash.Resource,
    otp_app: :ash_framework,
    domain: AshFramework.Accounts,
    data_layer: AshPostgres.DataLayer,
    authorizers: [Ash.Policy.Authorizer],
    extensions: [AshAuthentication.UserIdentity]

  user_identity do
    user_resource AshFramework.Accounts.User
  end

  postgres do
    table "user_identities"
    repo AshFramework.Repo

    references do
      reference :user, on_delete: :delete
    end
  end

  identities do
    identity :unique_identity, [:strategy, :uid, :user_id]
  end

  policies do
    bypass AshAuthentication.Checks.AshAuthenticationInteraction do
      authorize_if always()
    end

    policy always() do
      forbid_if always()
    end
  end
end
