defmodule AshFramework.Repo.Migrations.StoreTodoPriorityAsInteger do
  use Ecto.Migration

  def up do
    execute("""
    ALTER TABLE todos
    DROP CONSTRAINT IF EXISTS todos_priority_check
    """)

    execute("""
    ALTER TABLE todos
    ALTER COLUMN priority DROP DEFAULT,
    ALTER COLUMN priority TYPE integer
    USING (
      CASE priority
        WHEN 'low' THEN 1
        WHEN 'medium' THEN 2
        WHEN 'high' THEN 3
        WHEN 'urgent' THEN 4
      END
    ),
    ALTER COLUMN priority SET DEFAULT 2
    """)

    execute("""
    ALTER TABLE todos
    ADD CONSTRAINT todos_priority_check
    CHECK (priority IN (1, 2, 3, 4))
    """)
  end

  def down do
    execute("""
    ALTER TABLE todos
    DROP CONSTRAINT IF EXISTS todos_priority_check
    """)

    execute("""
    ALTER TABLE todos
    ALTER COLUMN priority DROP DEFAULT,
    ALTER COLUMN priority TYPE text
    USING (
      CASE priority
        WHEN 1 THEN 'low'
        WHEN 2 THEN 'medium'
        WHEN 3 THEN 'high'
        WHEN 4 THEN 'urgent'
      END
    ),
    ALTER COLUMN priority SET DEFAULT 'medium'
    """)

    execute("""
    ALTER TABLE todos
    ADD CONSTRAINT todos_priority_check
    CHECK (priority IN ('low', 'medium', 'high', 'urgent'))
    """)
  end
end
