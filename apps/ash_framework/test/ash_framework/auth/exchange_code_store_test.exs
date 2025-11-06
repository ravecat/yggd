defmodule AshFramework.Auth.ExchangeCodeStoreTest do
  use ExUnit.Case, async: false

  alias AshFramework.Auth.ExchangeCodeStore

  defp generate_pkce_pair do
    verifier = :crypto.strong_rand_bytes(32) |> Base.url_encode64(padding: false)
    challenge = :crypto.hash(:sha256, verifier) |> Base.url_encode64(padding: false)
    {verifier, challenge}
  end

  describe "create/2" do
    test "generates a valid exchange code with code_challenge" do
      token = "test_token_123"
      {_verifier, challenge} = generate_pkce_pair()
      code = ExchangeCodeStore.create(token, challenge)

      assert is_binary(code)
      assert String.length(code) > 40
    end

    test "generates unique codes for each call" do
      token = "test_token"
      {_verifier, challenge} = generate_pkce_pair()
      code1 = ExchangeCodeStore.create(token, challenge)
      code2 = ExchangeCodeStore.create(token, challenge)

      assert code1 != code2
    end

    test "accepts code_challenge with various formats" do
      token = "test_token"
      # URL-safe base64 without padding
      challenge = "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM"
      code = ExchangeCodeStore.create(token, challenge)

      assert is_binary(code)
    end
  end

  describe "exchange/2 with PKCE validation" do
    test "successfully exchanges valid code with correct verifier" do
      token = "my_jwt_token"
      {verifier, challenge} = generate_pkce_pair()
      code = ExchangeCodeStore.create(token, challenge)

      assert {:ok, ^token} = ExchangeCodeStore.exchange(code, verifier)
    end

    test "returns error for invalid code" do
      {verifier, _challenge} = generate_pkce_pair()
      assert {:error, :invalid_code} = ExchangeCodeStore.exchange("invalid_code_123", verifier)
    end

    test "returns :invalid_verifier for wrong code_verifier" do
      token = "my_jwt_token"
      {_correct_verifier, challenge} = generate_pkce_pair()
      {wrong_verifier, _wrong_challenge} = generate_pkce_pair()
      code = ExchangeCodeStore.create(token, challenge)

      assert {:error, :invalid_verifier} = ExchangeCodeStore.exchange(code, wrong_verifier)
    end

    test "returns :invalid_verifier for tampered code_verifier" do
      token = "my_jwt_token"
      {verifier, challenge} = generate_pkce_pair()
      code = ExchangeCodeStore.create(token, challenge)

      # Tamper with verifier
      tampered_verifier = verifier <> "extra"

      assert {:error, :invalid_verifier} = ExchangeCodeStore.exchange(code, tampered_verifier)
    end

    test "code is single-use only" do
      token = "my_jwt_token"
      {verifier, challenge} = generate_pkce_pair()
      code = ExchangeCodeStore.create(token, challenge)

      # First exchange succeeds
      assert {:ok, ^token} = ExchangeCodeStore.exchange(code, verifier)

      # Second exchange fails (code already used)
      assert {:error, :invalid_code} = ExchangeCodeStore.exchange(code, verifier)
    end

    test "different verifier cannot exchange valid code" do
      token = "my_jwt_token"
      {verifier1, challenge1} = generate_pkce_pair()
      {verifier2, _challenge2} = generate_pkce_pair()

      code = ExchangeCodeStore.create(token, challenge1)

      # Try to exchange with different verifier
      assert {:error, :invalid_verifier} = ExchangeCodeStore.exchange(code, verifier2)

      # Original verifier still works
      assert {:ok, ^token} = ExchangeCodeStore.exchange(code, verifier1)
    end

    test "empty verifier returns :invalid_verifier" do
      token = "my_jwt_token"
      {_verifier, challenge} = generate_pkce_pair()
      code = ExchangeCodeStore.create(token, challenge)

      assert {:error, :invalid_verifier} = ExchangeCodeStore.exchange(code, "")
    end
  end

  describe "code cleanup" do
    test "expired codes are eventually cleaned up" do
      token = "my_jwt_token"
      {verifier, challenge} = generate_pkce_pair()
      code = ExchangeCodeStore.create(token, challenge)

      # Exchange the code to ensure it's deleted
      assert {:ok, ^token} = ExchangeCodeStore.exchange(code, verifier)

      # Verify code is gone
      assert {:error, :invalid_code} = ExchangeCodeStore.exchange(code, verifier)
    end
  end
end
