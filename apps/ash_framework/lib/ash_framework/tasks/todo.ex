defmodule AshFramework.Tasks.Todo do
  import Ash.Expr, only: [expr: 1]
  require Ash.Query

  use Ash.Resource,
    otp_app: :ash_framework,
    primary_read_warning?: false,
    domain: AshFramework.Tasks,
    data_layer: AshPostgres.DataLayer,
    authorizers: [Ash.Policy.Authorizer],
    extensions: [AshJsonApi.Resource, AshTypescript.Resource]

  json_api do
    type "todo"
    includes [:board]
    derive_filter? true

    routes do
      base "/todos"
      get :read

      index :read,
        metadata: fn _subject, _result, _request ->
          %{
            statuses:
              AshFramework.Tasks.TodoStatus.values()
              |> Enum.map(&to_string/1)
          }
        end

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
      primary? true

      pagination offset?: true,
                 keyset?: true,
                 required?: true,
                 default_limit: 10,
                 max_page_size: 100

      prepare build(default_sort: [created_at: :desc])
    end

    create :create do
      accept [:title, :content, :status, :priority, :board_id]
      change &__MODULE__.ensure_actor_owns_board/2
    end

    create :create_internal do
      accept [:title, :content, :status, :priority, :board_id]
    end

    update :update do
      accept [:title, :content, :status, :priority]
    end
  end

  policies do
    policy action_type(:read) do
      authorize_if expr(board.visibility == :public)
      authorize_if relates_to_actor_via([:board, :owner])
    end

    policy action_type(:update) do
      authorize_if relates_to_actor_via([:board, :owner])
    end

    policy action_type(:destroy) do
      authorize_if relates_to_actor_via([:board, :owner])
    end

    policy action(:create) do
      authorize_if actor_present()
    end

    policy action(:create_internal) do
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
      default :backlog
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
    belongs_to :board, AshFramework.Tasks.Board do
      allow_nil? false
      public? true
    end
  end

  def ensure_actor_owns_board(changeset, %{actor: actor}) when not is_nil(actor) do
    board_id = Ash.Changeset.get_attribute(changeset, :board_id)

    if is_nil(board_id) or board_owned_by_actor?(board_id, actor.id) do
      changeset
    else
      Ash.Changeset.add_error(
        changeset,
        field: :board_id,
        message: "must belong to the authenticated user"
      )
    end
  end

  def ensure_actor_owns_board(changeset, _context) do
    Ash.Changeset.add_error(
      changeset,
      field: :board_id,
      message: "must belong to the authenticated user"
    )
  end

  defp board_owned_by_actor?(board_id, actor_id) do
    AshFramework.Tasks.Board
    |> Ash.Query.filter(expr(id == ^board_id and owner_id == ^actor_id))
    |> Ash.read_one!(authorize?: false)
    |> Kernel.is_nil()
    |> Kernel.not()
  end
end
