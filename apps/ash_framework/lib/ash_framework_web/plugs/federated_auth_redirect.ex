defmodule AshFrameworkWeb.Plugs.FederatedAuthRedirect do
  @moduledoc """
  Captures and validates client redirect_uri and PKCE parameters for federated authentication flows.

  This plug intercepts federated auth initiation requests (e.g., /auth/user/google)
  and stores the validated redirect_uri and PKCE code_challenge in the session for use after authentication callback.

  ## Flow

  1. Client initiates auth: GET /auth/user/google?redirect_uri=https://client.com/callback&code_challenge=ABC&code_challenge_method=S256
  2. Plug validates redirect_uri against whitelist and PKCE parameters
  3. Stores redirect_uri and code_challenge in session
  4. After OAuth callback, AuthController uses code_challenge when creating exchange code

  ## PKCE Security

  PKCE (Proof Key for Code Exchange) protects against authorization code interception attacks.
  The code_challenge is stored and later validated against code_verifier during token exchange.

  ## Configuration

  Configure in config/runtime.exs:

      config :ash_framework, :federated_auth,
        redirect_whitelist: ["localhost:*", "*.example.com", "app.mycompany.com"]

  The redirect_uri is stored in session under the `:federated_auth_redirect_uri` key.
  The code_challenge is stored in session under the `:pkce_code_challenge` key.

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
    with {:ok, redirect_uri} <- extract_redirect_uri(conn),
         {:ok, code_challenge} <- extract_pkce_params(conn),
         :ok <- validate_redirect_uri(redirect_uri) do
      Logger.debug("Storing redirect_uri and PKCE challenge in session")

      conn
      |> put_session(:federated_auth_redirect_uri, redirect_uri)
      |> put_session(:pkce_code_challenge, code_challenge)
    else
      {:error, :missing_redirect_uri} ->
        Logger.warning("Missing redirect_uri for federated auth request: #{conn.request_path}")

        conn
        |> put_status(:bad_request)
        |> Phoenix.Controller.json(%{error: "redirect_uri parameter is required"})
        |> halt()

      {:error, :missing_code_challenge} ->
        Logger.warning("Missing code_challenge for federated auth request: #{conn.request_path}")

        conn
        |> put_status(:bad_request)
        |> Phoenix.Controller.json(%{
          error: "code_challenge parameter is required",
          details: "PKCE is required for federated authentication"
        })
        |> halt()

      {:error, :invalid_redirect_uri} ->
        Logger.warning("Invalid redirect_uri rejected: #{inspect(conn.params["redirect_uri"])}")

        conn
        |> put_status(:bad_request)
        |> Phoenix.Controller.json(%{
          error: "Invalid redirect_uri",
          details: "The provided redirect_uri is not in the allowed whitelist"
        })
        |> halt()
    end
  end

  defp extract_redirect_uri(conn) do
    case Map.get(conn.params, "redirect_uri") do
      uri when is_binary(uri) and uri != "" -> {:ok, uri}
      _ -> {:error, :missing_redirect_uri}
    end
  end

  defp extract_pkce_params(conn) do
    code_challenge = Map.get(conn.params, "code_challenge")

    if is_nil(code_challenge) or code_challenge == "" do
      {:error, :missing_code_challenge}
    else
      {:ok, code_challenge}
    end
  end

  defp validate_redirect_uri(redirect_uri) do
    if valid_redirect_uri?(redirect_uri) do
      :ok
    else
      {:error, :invalid_redirect_uri}
    end
  end

  defp valid_redirect_uri?(redirect_uri) do
    case URI.parse(redirect_uri) do
      %URI{scheme: scheme, host: host, port: port, authority: authority}
      when scheme in ["http", "https"] and not is_nil(host) ->
        whitelist = get_whitelist()

        # Check if port was explicitly specified in the URL (authority contains ":")
        explicit_port? = String.contains?(authority || "", ":")

        host_with_port =
          if explicit_port? && port do
            "#{host}:#{port}"
          else
            host
          end

        Enum.any?(whitelist, fn pattern ->
          match_pattern?(host_with_port, pattern)
        end)

      _ ->
        false
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
