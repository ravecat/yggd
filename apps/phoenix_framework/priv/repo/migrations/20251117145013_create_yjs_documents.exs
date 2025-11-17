defmodule PhoenixFramework.Repo.Migrations.CreateYjsDocuments do
  use Ecto.Migration

  def change do
    create table(:yjs_records) do
      add :doc_name, :string, null: false
      add :value, :binary, null: false
      add :version, :string, null: false

      timestamps(type: :utc_datetime)
    end

    create index(:yjs_records, [:doc_name, :version])
    create index(:yjs_records, [:doc_name])
  end
end
