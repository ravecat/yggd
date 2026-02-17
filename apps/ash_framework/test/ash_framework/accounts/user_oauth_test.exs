defmodule AshFramework.Accounts.UserOAuthTest do
  use AshFramework.DataCase, async: true

  alias AshFramework.Accounts.User

  defp register_with_google(params) do
    User
    |> Ash.Changeset.for_create(:register_with_google, params, authorize?: false)
    |> Ash.create!(authorize?: false)
  end

  test "register_with_google upserts identity without ON CONFLICT errors" do
    user_info = %{
      "email" => "oauth-user@example.com",
      "name" => "OAuth User",
      "sub" => "google-sub-123"
    }

    oauth_tokens = %{
      "access_token" => "access-token-1",
      "refresh_token" => "refresh-token-1",
      "expires_at" => DateTime.utc_now()
    }

    user =
      register_with_google(%{
        user_info: user_info,
        oauth_tokens: oauth_tokens
      })

    assert user.email == Ash.CiString.new("oauth-user@example.com")
    assert user.name == "OAuth User"

    updated_user =
      register_with_google(%{
        user_info: %{user_info | "name" => "Updated OAuth User"},
        oauth_tokens: %{oauth_tokens | "access_token" => "access-token-2"}
      })

    assert updated_user.id == user.id
    assert updated_user.name == "Updated OAuth User"

    result =
      Ecto.Adapters.SQL.query!(
        AshFramework.Repo,
        """
        SELECT strategy, uid, user_id::text
        FROM user_identities
        WHERE strategy = 'google' AND uid = $1
        """,
        ["google-sub-123"]
      )

    assert result.num_rows == 1
    assert result.rows == [["google", "google-sub-123", user.id]]
  end
end
