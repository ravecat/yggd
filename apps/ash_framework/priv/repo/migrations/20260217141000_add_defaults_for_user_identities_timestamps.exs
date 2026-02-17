defmodule AshFramework.Repo.Migrations.AddDefaultsForUserIdentitiesTimestamps do
  use Ecto.Migration

  def up do
    execute """
    ALTER TABLE user_identities
    ALTER COLUMN inserted_at SET DEFAULT NOW(),
    ALTER COLUMN updated_at SET DEFAULT NOW();
    """
  end

  def down do
    execute """
    ALTER TABLE user_identities
    ALTER COLUMN inserted_at DROP DEFAULT,
    ALTER COLUMN updated_at DROP DEFAULT;
    """
  end
end
