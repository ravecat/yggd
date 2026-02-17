defmodule AshFramework.Repo.Migrations.AddTodosStatusCheckConstraint do
  use Ecto.Migration

  def up do
    execute("""
    ALTER TABLE todos
    ADD CONSTRAINT todos_status_check
    CHECK (status IN ('todo', 'in_progress', 'completed'));
    """)
  end

  def down do
    execute("""
    ALTER TABLE todos
    DROP CONSTRAINT IF EXISTS todos_status_check;
    """)
  end
end
