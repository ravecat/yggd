defmodule AshFramework.Blog.Post do
  use Ash.Resource,
    otp_app: :ash_framework,
    domain: AshFramework.Blog,
    data_layer: AshPostgres.DataLayer,
    authorizers: [Ash.Policy.Authorizer],
    extensions: [AshJsonApi.Resource, AshTypescript.Resource]

  json_api do
    type "post"

    routes do
      base "/posts"
      get :read
      index :read
      post :create
      patch :update
      delete :destroy
    end
  end

  postgres do
    table "posts"
    repo AshFramework.Repo
  end

  typescript do
    type_name "Post"
  end

  actions do
    defaults [:read, :destroy]

    create :create do
      accept [:title, :content, :author_id]
    end

    update :update do
      accept [:title, :content]
    end
  end

  policies do
    policy action_type(:read) do
      authorize_if always()
    end

    policy action_type(:create) do
      authorize_if always()
    end

    policy action_type(:update) do
      authorize_if always()
    end

    policy action_type(:destroy) do
      authorize_if always()
    end
  end

  attributes do
    uuid_primary_key :id

    attribute :title, :string do
      allow_nil? false
      public? true
    end

    attribute :content, :string do
      allow_nil? false
      public? true
    end

    create_timestamp :created_at
    update_timestamp :updated_at
  end

  relationships do
    belongs_to :author, AshFramework.Accounts.User do
      allow_nil? false
      public? true
    end
  end
end
