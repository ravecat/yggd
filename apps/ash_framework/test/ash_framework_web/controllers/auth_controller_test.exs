defmodule AshFrameworkWeb.AuthControllerTest do
  use AshFrameworkWeb.ConnCase, async: false

  alias AshFramework.Auth.ExchangeCodeStore

  # Helper to generate valid PKCE parameters
  defp generate_pkce_pair do
    verifier = :crypto.strong_rand_bytes(32) |> Base.url_encode64(padding: false)
    challenge = :crypto.hash(:sha256, verifier) |> Base.url_encode64(padding: false)
    {verifier, challenge}
  end

  describe "POST /auth/exchange with PKCE" do
    test "successfully exchanges code with valid verifier", %{conn: conn} do
      token = "valid_jwt_token_123"
      {verifier, challenge} = generate_pkce_pair()

      # Create exchange code with code_challenge
      code = ExchangeCodeStore.create(token, challenge)

      # Exchange with correct verifier
      conn =
        post(conn, ~p"/auth/exchange", %{
          "code" => code,
          "code_verifier" => verifier
        })

      assert json_response(conn, 200) == %{"token" => token}
    end

    test "returns 401 for invalid code_verifier", %{conn: conn} do
      token = "valid_jwt_token_123"
      {_correct_verifier, challenge} = generate_pkce_pair()
      {wrong_verifier, _wrong_challenge} = generate_pkce_pair()

      code = ExchangeCodeStore.create(token, challenge)

      # Try to exchange with wrong verifier
      conn =
        post(conn, ~p"/auth/exchange", %{
          "code" => code,
          "code_verifier" => wrong_verifier
        })

      assert json_response(conn, 401) == %{"error" => "Invalid PKCE verifier"}
    end

    test "returns 400 for missing code_verifier", %{conn: conn} do
      token = "valid_jwt_token_123"
      {_verifier, challenge} = generate_pkce_pair()

      code = ExchangeCodeStore.create(token, challenge)

      # Try to exchange without verifier
      conn =
        post(conn, ~p"/auth/exchange", %{
          "code" => code
        })

      assert json_response(conn, 400) == %{"error" => "Missing code_verifier parameter"}
    end

    test "returns 400 for missing code parameter", %{conn: conn} do
      {verifier, _challenge} = generate_pkce_pair()

      # Try to exchange without code
      conn =
        post(conn, ~p"/auth/exchange", %{
          "code_verifier" => verifier
        })

      assert json_response(conn, 400) == %{"error" => "Missing code parameter"}
    end

    test "returns 400 for invalid code", %{conn: conn} do
      {verifier, _challenge} = generate_pkce_pair()

      # Try to exchange with non-existent code
      conn =
        post(conn, ~p"/auth/exchange", %{
          "code" => "invalid_code_does_not_exist",
          "code_verifier" => verifier
        })

      assert json_response(conn, 400) == %{"error" => "Invalid or already used code"}
    end

    test "code is single-use only", %{conn: conn} do
      token = "valid_jwt_token_123"
      {verifier, challenge} = generate_pkce_pair()

      code = ExchangeCodeStore.create(token, challenge)

      # First exchange succeeds
      conn1 =
        post(conn, ~p"/auth/exchange", %{
          "code" => code,
          "code_verifier" => verifier
        })

      assert json_response(conn1, 200) == %{"token" => token}

      # Second exchange fails (code already used)
      conn2 =
        post(conn, ~p"/auth/exchange", %{
          "code" => code,
          "code_verifier" => verifier
        })

      assert json_response(conn2, 400) == %{"error" => "Invalid or already used code"}
    end

    test "empty verifier returns 401", %{conn: conn} do
      token = "valid_jwt_token_123"
      {_verifier, challenge} = generate_pkce_pair()

      code = ExchangeCodeStore.create(token, challenge)

      # Try with empty verifier
      conn =
        post(conn, ~p"/auth/exchange", %{
          "code" => code,
          "code_verifier" => ""
        })

      assert json_response(conn, 401) == %{"error" => "Invalid PKCE verifier"}
    end
  end

  describe "OAuth callback flow with PKCE" do
    # Note: Testing success/4 directly is complex as it requires full OAuth flow
    # These tests verify the exchange endpoint which is the public API
    # Integration tests should cover the full OAuth -> exchange flow

    test "prevents code interception attack scenario", %{conn: conn} do
      # Simulate attacker intercepting code from URL
      token = "victim_jwt_token"
      {legitimate_verifier, challenge} = generate_pkce_pair()
      {attacker_verifier, _attacker_challenge} = generate_pkce_pair()

      # Legitimate client creates exchange code
      code = ExchangeCodeStore.create(token, challenge)

      # Attacker intercepts the code from URL but doesn't have the verifier
      # Attacker tries with their own verifier
      attacker_conn =
        post(conn, ~p"/auth/exchange", %{
          "code" => code,
          "code_verifier" => attacker_verifier
        })

      # Attack fails
      assert json_response(attacker_conn, 401) == %{"error" => "Invalid PKCE verifier"}

      # Legitimate client can still exchange with correct verifier
      legitimate_conn =
        post(conn, ~p"/auth/exchange", %{
          "code" => code,
          "code_verifier" => legitimate_verifier
        })

      assert json_response(legitimate_conn, 200) == %{"token" => token}
    end
  end
end
