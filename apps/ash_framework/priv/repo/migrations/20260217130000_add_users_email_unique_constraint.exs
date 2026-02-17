defmodule AshFramework.Repo.Migrations.AddUsersEmailUniqueConstraint do
  use Ecto.Migration

  def up do
    execute("""
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'users_unique_email_index'
          AND conrelid = 'public.users'::regclass
      ) THEN
        ALTER TABLE users
        ADD CONSTRAINT users_unique_email_index
        UNIQUE USING INDEX users_unique_email_index;
      END IF;
    END $$;
    """)
  end

  def down do
    execute("""
    ALTER TABLE users
    DROP CONSTRAINT IF EXISTS users_unique_email_index;
    """)

    execute("""
    CREATE UNIQUE INDEX IF NOT EXISTS users_unique_email_index
    ON users (email);
    """)
  end
end
