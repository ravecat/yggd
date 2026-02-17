defmodule AshFramework.Repo.Migrations.RenamePostsToTodos do
  use Ecto.Migration

  def up do
    rename(table(:posts), to: table(:todos))
    rename(table(:todos), :author_id, to: :user_id)

    execute("""
    ALTER TABLE todos
    RENAME CONSTRAINT posts_author_id_fkey TO todos_user_id_fkey
    """)

    alter table(:todos) do
      add(:status, :text, null: false, default: "todo")
    end
  end

  def down do
    alter table(:todos) do
      remove(:status)
    end

    execute("""
    ALTER TABLE todos
    RENAME CONSTRAINT todos_user_id_fkey TO posts_author_id_fkey
    """)

    rename(table(:todos), :user_id, to: :author_id)
    rename(table(:todos), to: table(:posts))
  end
end
