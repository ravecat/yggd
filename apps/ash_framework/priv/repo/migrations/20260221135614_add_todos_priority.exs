defmodule AshFramework.Repo.Migrations.AddTodosPriority do
  @moduledoc """
  Adds priority column to todos table.
  """

  use Ecto.Migration

  def up do
    alter table(:todos) do
      add :priority, :text, null: false, default: "medium"
    end

    execute("""
    ALTER TABLE todos
    ADD CONSTRAINT todos_priority_check
    CHECK (priority IN ('low', 'medium', 'high', 'urgent'));
    """)
  end

  def down do
    execute("""
    ALTER TABLE todos
    DROP CONSTRAINT IF EXISTS todos_priority_check;
    """)

    alter table(:todos) do
      remove :priority
    end
  end
end
