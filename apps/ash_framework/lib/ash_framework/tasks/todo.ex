defmodule AshFramework.Tasks.Todo do
  use Ash.Resource,
    otp_app: :ash_framework,
    domain: AshFramework.Tasks,
    data_layer: AshPostgres.DataLayer,
    authorizers: [Ash.Policy.Authorizer],
    extensions: [AshJsonApi.Resource, AshTypescript.Resource]

  json_api do
    type "todo"
    includes [:user]
    derive_filter? false

    routes do
      base "/todos"
      get :read
      index :read
      post :create
      patch :update
      delete :destroy
    end
  end

  postgres do
    table "todos"
    repo AshFramework.Repo
  end

  typescript do
    type_name "Todo"
  end

  actions do
    defaults [:destroy]

    read :read do
      pagination offset?: true,
                 keyset?: true,
                 required?: true,
                 default_limit: 10,
                 max_page_size: 100

      prepare build(default_sort: [created_at: :desc])
    end

    create :create do
      accept [:title, :content, :status, :priority, :user_id]
    end

    update :update do
      accept [:title, :content, :status, :priority]
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

    attribute :status, AshFramework.Tasks.TodoStatus do
      allow_nil? false
      default :todo
      public? true
    end

    attribute :priority, AshFramework.Tasks.TaskPriority do
      allow_nil? false
      default :medium
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
    belongs_to :user, AshFramework.Accounts.User do
      allow_nil? false
      public? true
    end
  end
end
