defmodule AshFrameworkWeb.Plugs.FederatedAuthRedirectTest do
  use ExUnit.Case, async: true
  use Plug.Test

  alias AshFrameworkWeb.Plugs.FederatedAuthRedirect

  setup do
    # Set up test whitelist
    Application.put_env(:ash_framework, :federated_auth,
      redirect_session_key: "federated_auth_redirect_uri",
      redirect_whitelist: ["localhost:*", "127.0.0.1:*", "*.example.com", "app.mycompany.com"]
    )

    :ok
  end

  describe "federated auth initiation with redirect_uri" do
    test "stores valid redirect_uri in session" do
      conn = conn(:get, "/auth/user/google", %{"redirect_uri" => "http://localhost:3000/callback"})
        |> init_test_session(%{})
        |> FederatedAuthRedirect.call([])

      refute conn.halted
      assert get_session(conn, "federated_auth_redirect_uri") == "http://localhost:3000/callback"
    end

    test "rejects invalid redirect_uri not in whitelist" do
      conn = conn(:get, "/auth/user/google", %{"redirect_uri" => "http://evil.com/callback"})
        |> init_test_session(%{})
        |> FederatedAuthRedirect.call([])

      assert conn.halted
      assert conn.status == 400
    end

    test "accepts wildcard subdomain pattern" do
      conn = conn(:get, "/auth/user/google", %{"redirect_uri" => "http://app.example.com/callback"})
        |> init_test_session(%{})
        |> FederatedAuthRedirect.call([])

      refute conn.halted
      assert get_session(conn, "federated_auth_redirect_uri") == "http://app.example.com/callback"
    end

    test "returns 400 when redirect_uri is missing for federated auth" do
      conn = conn(:get, "/auth/user/google", %{})
        |> init_test_session(%{})
        |> FederatedAuthRedirect.call([])

      assert conn.halted
      assert conn.status == 400
    end

    test "accepts localhost with any port using wildcard" do
      conn = conn(:get, "/auth/user/google", %{"redirect_uri" => "http://localhost:4200/callback"})
        |> init_test_session(%{})
        |> FederatedAuthRedirect.call([])

      refute conn.halted
      assert get_session(conn, "federated_auth_redirect_uri") == "http://localhost:4200/callback"
    end

    test "accepts 127.0.0.1 with any port using wildcard" do
      conn = conn(:get, "/auth/user/google", %{"redirect_uri" => "http://127.0.0.1:8080/callback"})
        |> init_test_session(%{})
        |> FederatedAuthRedirect.call([])

      refute conn.halted
      assert get_session(conn, "federated_auth_redirect_uri") == "http://127.0.0.1:8080/callback"
    end

    test "rejects localhost without explicit port when wildcard expects port" do
      conn = conn(:get, "/auth/user/google", %{"redirect_uri" => "http://localhost/callback"})
        |> init_test_session(%{})
        |> FederatedAuthRedirect.call([])

      # localhost without port shouldn't match "localhost:*" wildcard
      assert conn.halted
      assert conn.status == 400
    end
  end

  describe "non-federated auth requests" do
    test "ignores callback requests" do
      conn = conn(:get, "/auth/user/google/callback", %{})
        |> init_test_session(%{})
        |> FederatedAuthRedirect.call([])

      refute conn.halted
    end

    test "ignores other routes" do
      conn = conn(:get, "/", %{})
        |> init_test_session(%{})
        |> FederatedAuthRedirect.call([])

      refute conn.halted
    end
  end
end
