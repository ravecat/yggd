defmodule AshFramework.Auth.ExchangeCodeStore do
  @moduledoc """
  Temporary in-memory storage for authorization codes used in OAuth token exchange.

  ## Flow

  1. Elixir OAuth callback receives JWT token from AshAuthentication
  2. `create(token)` generates random code and stores {code, token} in ETS
  3. Elixir redirects to Next.js client with CODE in URL (not token)
  4. Next.js server calls POST /api/auth/exchange with code
  5. `exchange(code)` retrieves token from ETS and deletes code
  6. Next.js stores token in httpOnly cookie

  ## Security Features

  - Codes expire after 60 seconds
  - Codes are single-use (deleted immediately after exchange)
  - Random 32-byte cryptographically secure codes
  - No token exposure in browser history or server logs
  """

  use GenServer
  require Logger

  @table_name :exchange_codes
  @ttl_ms 60_000  # 60 seconds

  # Client API

  def start_link(_opts) do
    GenServer.start_link(__MODULE__, %{}, name: __MODULE__)
  end

  @doc """
  Creates an exchange code and stores the token.

  Returns a random URL-safe code string.

  ## Examples

      iex> token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
      iex> code = ExchangeCodeStore.create(token)
      iex> String.length(code) > 40
      true
  """
  def create(token) when is_binary(token) do
    code = generate_code()
    expires_at = System.system_time(:millisecond) + @ttl_ms

    :ets.insert(@table_name, {code, token, expires_at})
    Logger.debug("Created exchange code: #{String.slice(code, 0, 8)}... (expires in #{@ttl_ms}ms)")

    # Schedule cleanup after TTL
    Process.send_after(__MODULE__, {:cleanup, code}, @ttl_ms)

    code
  end

  @doc """
  Exchanges authorization code for JWT token.

  Code is deleted after successful exchange (single-use).

  ## Returns

  - `{:ok, token}` if code is valid and not expired
  - `{:error, :invalid_code}` if code doesn't exist or already used
  - `{:error, :expired}` if code has expired

  ## Examples

      iex> code = ExchangeCodeStore.create("my_token")
      iex> ExchangeCodeStore.exchange(code)
      {:ok, "my_token"}
      iex> ExchangeCodeStore.exchange(code)
      {:error, :invalid_code}
  """
  def exchange(code) when is_binary(code) do
    case :ets.lookup(@table_name, code) do
      [{^code, token, expires_at}] ->
        current_time = System.system_time(:millisecond)

        if current_time < expires_at do
          :ets.delete(@table_name, code)
          Logger.info("Successfully exchanged code: #{String.slice(code, 0, 8)}...")
          {:ok, token}
        else
          :ets.delete(@table_name, code)
          Logger.warning("Attempted to exchange expired code: #{String.slice(code, 0, 8)}...")
          {:error, :expired}
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
      [{^code, _token, _expires_at}] ->
        :ets.delete(@table_name, code)
        Logger.debug("Cleaned up expired code: #{String.slice(code, 0, 8)}...")
      [] ->
        # Already deleted (exchanged or manually cleaned)
        :ok
    end

    {:noreply, state}
  end

  # Private Helpers

  defp generate_code do
    :crypto.strong_rand_bytes(32)
    |> Base.url_encode64(padding: false)
  end
end
