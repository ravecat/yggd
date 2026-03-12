defmodule AshFramework.Tasks.Board do
  use Ash.Resource,
    otp_app: :ash_framework,
    domain: AshFramework.Tasks,
    data_layer: AshPostgres.DataLayer,
    authorizers: [Ash.Policy.Authorizer],
    extensions: [AshJsonApi.Resource]

  json_api do
    type "board"
    includes [:owner]
    derive_filter? true

    routes do
      base "/boards"
      get :read
      index :list
      patch :update
    end
  end

  postgres do
    table "boards"
    repo AshFramework.Repo
  end

  actions do
    defaults []

    read :read do
      primary? true
    end

    read :list do
      pagination offset?: true,
                 keyset?: true,
                 required?: false,
                 default_limit: 10,
                 max_page_size: 100
    end

    create :provision do
      accept [:owner_id]
      upsert? true
      upsert_identity :unique_owner
    end

    update :update do
      accept [:visibility]
    end
  end

  policies do
    policy action(:provision) do
      authorize_if always()
    end

    policy action(:read) do
      authorize_if expr(visibility == :public)
      authorize_if relates_to_actor_via(:owner)
    end

    policy action(:list) do
      authorize_if relates_to_actor_via(:owner)
    end

    policy action_type([:update, :destroy]) do
      authorize_if relates_to_actor_via(:owner)
    end
  end

  attributes do
    uuid_primary_key :id

    attribute :visibility, AshFramework.Tasks.BoardVisibility do
      allow_nil? false
      default :private
      public? true
    end

    create_timestamp :created_at do
      public? true
    end

    update_timestamp :updated_at do
      public? true
    end
  end

  relationships do
    belongs_to :owner, AshFramework.Accounts.User do
      allow_nil? false
      public? true
    end

    has_many :todos, AshFramework.Tasks.Todo do
      destination_attribute :board_id
      public? true
    end
  end

  identities do
    identity :unique_owner, [:owner_id]
  end
end
