defmodule AshFrameworkWeb.Plugs.FederatedAuthRedirect do
  @moduledoc """
  Captures and validates client redirect_uri parameter for federated authentication flows.

  This plug intercepts federated auth initiation requests (e.g., /auth/user/google)
  and stores the validated redirect_uri in the session for use after authentication callback.

  ## Flow

  1. Client initiates auth: GET /auth/user/google?redirect_uri=https://client.com/callback
  2. Plug validates redirect_uri against whitelist
  3. Stores in session
  4. After OAuth callback, AuthController retrieves redirect_uri and redirects client

  ## Configuration

  Configure in config/runtime.exs:

      config :ash_framework, :federated_auth,
        redirect_whitelist: ["localhost:*", "*.example.com", "app.mycompany.com"]

  The redirect_uri is stored in session under the `:federated_auth_redirect_uri` key.

  ## Wildcard Patterns

  - `localhost:*` - Matches localhost with any port (e.g., localhost:3000, localhost:4200)
  - `*.example.com` - Matches any subdomain (e.g., app.example.com, dev.example.com)
  - `app.mycompany.com` - Exact match only

  """

  import Plug.Conn
  require Logger

  def init(opts), do: opts

  def call(conn, _opts) do
    if federated_auth_initiation?(conn) do
      handle_federated_auth(conn)
    else
      conn
    end
  end

  defp federated_auth_initiation?(%Plug.Conn{method: "GET", request_path: path}) do
    String.match?(path, ~r|^/auth/user/\w+$|)
  end

  defp federated_auth_initiation?(_conn), do: false

  defp handle_federated_auth(conn) do
    case extract_redirect_uri(conn) do
      {:ok, redirect_uri} ->
        validate_and_store(conn, redirect_uri)

      :none ->
        Logger.warning("Missing redirect_uri for federated auth request: #{conn.request_path}")
        conn
        |> put_status(:bad_request)
        |> Phoenix.Controller.json(%{error: "redirect_uri parameter is required"})
        |> halt()
    end
  end

  defp extract_redirect_uri(conn) do
    case Map.get(conn.params, "redirect_uri") do
      uri when is_binary(uri) and uri != "" -> {:ok, uri}
      _ -> :none
    end
  end

  defp validate_and_store(conn, redirect_uri) do
    if valid_redirect_uri?(redirect_uri) do
      Logger.debug("Storing redirect_uri in session: #{redirect_uri}")
      put_session(conn, :federated_auth_redirect_uri, redirect_uri)
    else
      Logger.warning("Invalid redirect_uri rejected: #{redirect_uri}")
      conn
      |> put_status(:bad_request)
      |> Phoenix.Controller.json(%{
        error: "Invalid redirect_uri",
        details: "The provided redirect_uri is not in the allowed whitelist"
      })
      |> halt()
    end
  end

  defp valid_redirect_uri?(redirect_uri) do
    case URI.parse(redirect_uri) do
      %URI{scheme: scheme, host: host, port: port, authority: authority} when scheme in ["http", "https"] and not is_nil(host) ->
        whitelist = get_whitelist()

        # Check if port was explicitly specified in the URL (authority contains ":")
        explicit_port? = String.contains?(authority || "", ":")

        host_with_port = if explicit_port? && port do
          "#{host}:#{port}"
        else
          host
        end

        Enum.any?(whitelist, fn pattern ->
          match_pattern?(host_with_port, pattern)
        end)

      _ -> false
    end
  end

  defp match_pattern?(host, pattern) when is_binary(pattern) do
    cond do
      # Exact match (including port)
      host == pattern ->
        true

      # Wildcard port (e.g., "localhost:*")
      String.ends_with?(pattern, ":*") ->
        host_prefix = String.slice(pattern, 0..-3//1)
        String.starts_with?(host, host_prefix <> ":")

      # Wildcard subdomain (e.g., "*.example.com")
      String.starts_with?(pattern, "*.") ->
        suffix = String.slice(pattern, 2..-1//1)
        String.ends_with?(host, suffix)

      true ->
        false
    end
  end

  defp get_whitelist do
    Application.get_env(:ash_framework, :federated_auth)[:redirect_whitelist] || []
  end
end
