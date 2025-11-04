defmodule AshFramework.Repo.Migrations.CreateUserIdentities do
  use Ecto.Migration

  def up do
    create table(:user_identities, primary_key: false) do
      add :id, :uuid, primary_key: true
      add :user_id, references(:users, type: :uuid, on_delete: :delete_all), null: false
      add :strategy, :string, null: false
      add :uid, :string, null: false
      add :access_token, :text
      add :refresh_token, :text
      add :access_token_expires_at, :utc_datetime
      add :extra_data, :map

      timestamps()
    end

    create unique_index(:user_identities, [:strategy, :uid])
    create index(:user_identities, [:user_id])
    create index(:user_identities, [:strategy])

    alter table(:users) do
      add :name, :string
    end
  end

  def down do
    alter table(:users) do
      remove :name
    end

    drop table(:user_identities)
  end
end
