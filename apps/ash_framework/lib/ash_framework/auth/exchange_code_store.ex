defmodule AshFramework.Auth.ExchangeCodeStore do
  @moduledoc """
  Temporary in-memory storage for authorization codes used in OAuth token exchange with PKCE validation.

  This module stores exchange codes along with their associated JWT tokens and PKCE code_challenge.
  When exchanging a code, it validates the code_verifier against the stored code_challenge using SHA256.
  """

  use GenServer
  require Logger

  @table_name :exchange_codes
  @ttl_ms 60_000

  # Client API

  def start_link(_opts) do
    GenServer.start_link(__MODULE__, %{}, name: __MODULE__)
  end

  @doc """
  Creates an exchange code and stores the token with PKCE code_challenge.

  Returns a random URL-safe code string.

  ## Parameters

  - `token` - JWT token to be retrieved later
  - `code_challenge` - PKCE code challenge (SHA256 hash of code_verifier)

  ## Examples

      iex> token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
      iex> challenge = "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM"
      iex> code = ExchangeCodeStore.create(token, challenge)
      iex> String.length(code) > 40
      true
  """
  def create(token, code_challenge) when is_binary(token) and is_binary(code_challenge) do
    code = generate_code()
    expires_at = System.system_time(:millisecond) + @ttl_ms

    :ets.insert(@table_name, {code, token, expires_at, code_challenge})

    Logger.debug(
      "Created exchange code with PKCE: #{String.slice(code, 0, 8)}... (expires in #{@ttl_ms}ms)"
    )

    # Schedule cleanup after TTL
    Process.send_after(__MODULE__, {:cleanup, code}, @ttl_ms)

    code
  end

  @doc """
  Exchanges authorization code for JWT token with PKCE validation.

  Code is deleted after successful exchange (single-use).

  ## Parameters

  - `code` - Authorization code to exchange
  - `code_verifier` - PKCE code verifier to validate against stored code_challenge

  ## Returns

  - `{:ok, token}` if code is valid, not expired, and PKCE validation passes
  - `{:error, :invalid_code}` if code doesn't exist or already used
  - `{:error, :expired}` if code has expired
  - `{:error, :invalid_verifier}` if PKCE validation fails

  ## Examples

      iex> challenge = "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM"
      iex> code = ExchangeCodeStore.create("my_token", challenge)
      iex> verifier = "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk"
      iex> ExchangeCodeStore.exchange(code, verifier)
      {:ok, "my_token"}
      iex> ExchangeCodeStore.exchange(code, verifier)
      {:error, :invalid_code}
  """
  def exchange(code, code_verifier) when is_binary(code) and is_binary(code_verifier) do
    case :ets.lookup(@table_name, code) do
      [{^code, token, expires_at, code_challenge}] ->
        current_time = System.system_time(:millisecond)

        cond do
          current_time >= expires_at ->
            :ets.delete(@table_name, code)
            Logger.warning("Attempted to exchange expired code: #{String.slice(code, 0, 8)}...")
            {:error, :expired}

          not verify_code_challenge(code_verifier, code_challenge) ->
            Logger.warning("PKCE validation failed for code: #{String.slice(code, 0, 8)}...")
            {:error, :invalid_verifier}

          true ->
            :ets.delete(@table_name, code)

            Logger.info(
              "Successfully exchanged code with PKCE validation: #{String.slice(code, 0, 8)}..."
            )

            {:ok, token}
        end

      [] ->
        Logger.warning("Attempted to exchange invalid or already used code")
        {:error, :invalid_code}
    end
  end

  # Server Callbacks

  @impl true
  def init(_) do
    :ets.new(@table_name, [
      :named_table,
      :public,
      :set,
      read_concurrency: true
    ])

    Logger.info("Started ExchangeCodeStore with ETS table: #{@table_name}")
    {:ok, %{}}
  end

  @impl true
  def handle_info({:cleanup, code}, state) do
    case :ets.lookup(@table_name, code) do
      [{^code, _token, _expires_at, _code_challenge}] ->
        :ets.delete(@table_name, code)
        Logger.debug("Cleaned up expired code: #{String.slice(code, 0, 8)}...")

      [] ->
        :ok
    end

    {:noreply, state}
  end

  # Private Helpers

  defp generate_code do
    :crypto.strong_rand_bytes(32)
    |> Base.url_encode64(padding: false)
  end

  defp verify_code_challenge(code_verifier, code_challenge) do
    computed_challenge =
      :crypto.hash(:sha256, code_verifier)
      |> Base.url_encode64(padding: false)

    computed_challenge == code_challenge
  end
end
