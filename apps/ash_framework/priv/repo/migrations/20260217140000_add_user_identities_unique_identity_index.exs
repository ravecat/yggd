defmodule AshFramework.Repo.Migrations.AddUserIdentitiesUniqueIdentityIndex do
  use Ecto.Migration

  def up do
    execute """
    CREATE UNIQUE INDEX IF NOT EXISTS user_identities_unique_identity_index
    ON user_identities (strategy, uid, user_id);
    """
  end

  def down do
    execute """
    DROP INDEX IF EXISTS user_identities_unique_identity_index;
    """
  end
end
