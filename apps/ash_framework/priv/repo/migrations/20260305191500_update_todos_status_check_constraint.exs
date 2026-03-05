defmodule AshFramework.Repo.Migrations.UpdateTodosStatusCheckConstraint do
  use Ecto.Migration

  def up do
    execute """
    UPDATE todos
    SET status = 'backlog'
    WHERE status = 'todo';
    """

    execute """
    UPDATE todos
    SET status = 'done'
    WHERE status = 'completed';
    """

    execute """
    ALTER TABLE todos
    DROP CONSTRAINT IF EXISTS todos_status_check;
    """

    execute """
    ALTER TABLE todos
    ADD CONSTRAINT todos_status_check
    CHECK (status IN ('blocked', 'backlog', 'in_progress', 'review', 'done', 'rejected'));
    """
  end

  def down do
    execute """
    UPDATE todos
    SET status = 'todo'
    WHERE status = 'backlog';
    """

    execute """
    UPDATE todos
    SET status = 'completed'
    WHERE status = 'done';
    """

    execute """
    UPDATE todos
    SET status = 'in_progress'
    WHERE status IN ('blocked', 'review', 'rejected');
    """

    execute """
    ALTER TABLE todos
    DROP CONSTRAINT IF EXISTS todos_status_check;
    """

    execute """
    ALTER TABLE todos
    ADD CONSTRAINT todos_status_check
    CHECK (status IN ('todo', 'in_progress', 'completed'));
    """
  end
end
