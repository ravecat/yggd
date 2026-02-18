defmodule AshFramework.Accounts.User do
  use Ash.Resource,
    otp_app: :ash_framework,
    domain: AshFramework.Accounts,
    data_layer: AshPostgres.DataLayer,
    authorizers: [Ash.Policy.Authorizer],
    extensions: [
      AshAuthentication,
      AshJsonApi.Resource,
      AshTypescript.Resource
    ]

  json_api do
    type "user"
    derive_filter? false
  end

  authentication do
    add_ons do
      log_out_everywhere do
        apply_on_password_change? true
      end
    end

    tokens do
      enabled? true
      token_resource AshFramework.Accounts.Token
      signing_secret AshFramework.Secrets
      store_all_tokens? true
      require_token_presence_for_authentication? true
    end

    strategies do
      magic_link do
        identity_field :email
        registration_enabled? true
        require_interaction? true

        sender AshFramework.Accounts.User.Senders.SendMagicLinkEmail
      end

      google do
        client_id AshFramework.Secrets
        client_secret AshFramework.Secrets
        redirect_uri AshFramework.Secrets
        identity_resource AshFramework.Accounts.UserIdentity
      end
    end
  end

  postgres do
    table "users"
    repo AshFramework.Repo
  end

  typescript do
    type_name "User"
  end

  actions do
    defaults [:read]

    read :get_by_subject do
      description "Get a user by the subject claim in a JWT"
      argument :subject, :string, allow_nil?: false
      get? true
      prepare AshAuthentication.Preparations.FilterBySubject
    end

    read :get_by_email do
      description "Looks up a user by their email"
      argument :email, :ci_string, allow_nil?: false
      get? true

      filter expr(email == ^arg(:email))
    end

    create :sign_in_with_magic_link do
      description "Sign in or register a user with magic link."

      argument :token, :string do
        description "The token from the magic link that was sent to the user"
        allow_nil? false
      end

      upsert? true
      upsert_identity :unique_email
      upsert_fields [:email]

      # Uses the information from the token to create or sign in the user
      change AshAuthentication.Strategy.MagicLink.SignInChange

      metadata :token, :string do
        allow_nil? false
      end
    end

    action :request_magic_link do
      argument :email, :ci_string do
        allow_nil? false
      end

      run AshAuthentication.Strategy.MagicLink.Request
    end

    create :register_with_google do
      description "Register or sign in with Google OAuth"

      argument :user_info, :map, allow_nil?: false
      argument :oauth_tokens, :map, allow_nil?: false

      upsert? true
      upsert_identity :unique_email
      upsert_fields [:email, :name]

      change fn changeset, _ ->
        user_info = Ash.Changeset.get_argument(changeset, :user_info)

        changeset
        |> Ash.Changeset.change_attribute(:email, user_info["email"])
        |> Ash.Changeset.change_attribute(:name, user_info["name"])
      end

      change AshAuthentication.GenerateTokenChange
      change AshAuthentication.Strategy.OAuth2.IdentityChange

      metadata :token, :string do
        allow_nil? false
      end
    end
  end

  policies do
    bypass AshAuthentication.Checks.AshAuthenticationInteraction do
      authorize_if always()
    end

    policy action_type(:read) do
      authorize_if always()
    end
  end

  attributes do
    uuid_primary_key :id

    attribute :email, :ci_string do
      allow_nil? false
      public? true
    end

    attribute :name, :string do
      public? true
    end
  end

  relationships do
    has_many :todos, AshFramework.Tasks.Todo do
      destination_attribute :user_id
      public? true
    end

    has_many :identities, AshFramework.Accounts.UserIdentity do
      destination_attribute :user_id
      public? true
    end
  end

  identities do
    identity :unique_email, [:email]
  end
end
