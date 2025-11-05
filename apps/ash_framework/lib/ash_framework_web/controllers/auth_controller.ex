defmodule AshFrameworkWeb.AuthController do
  use AshFrameworkWeb, :controller
  use AshAuthentication.Phoenix.Controller
  require Logger

  alias AshFramework.Auth.ExchangeCodeStore

  def success(conn, {:google, :callback}, _user, token) when not is_nil(token) do
    case get_session(conn, :federated_auth_redirect_uri) do
      nil ->
        Logger.error("Missing redirect_uri in session after federated auth")
        conn
        |> put_status(:internal_server_error)
        |> json(%{error: "Authentication flow error: missing redirect_uri"})

      redirect_uri ->
        # Create short-lived exchange code instead of passing token in URL
        exchange_code = ExchangeCodeStore.create(token)
        callback_url = build_callback_url(redirect_uri, exchange_code)

        Logger.info("Federated auth success, redirecting with code to: #{callback_url}")

        conn
        |> delete_session(:federated_auth_redirect_uri)
        |> redirect(external: callback_url)
    end
  end

  # Handle standard authentication flow (password, magic link, etc.)
  def success(conn, activity, user, _token) do
    return_to = get_session(conn, :return_to) || ~p"/"

    message =
      case activity do
        {:confirm_new_user, :confirm} -> "Your email address has now been confirmed"
        {:password, :reset} -> "Your password has successfully been reset"
        _ -> "You are now signed in"
      end

    conn
    |> delete_session(:return_to)
    |> store_in_session(user)
    |> assign(:current_user, user)
    |> put_flash(:info, message)
    |> redirect(to: return_to)
  end

  def failure(conn, activity, reason) do
    message =
      case {activity, reason} do
        {_,
         %AshAuthentication.Errors.AuthenticationFailed{
           caused_by: %Ash.Error.Forbidden{
             errors: [%AshAuthentication.Errors.CannotConfirmUnconfirmedUser{}]
           }
         }} ->
          """
          You have already signed in another way, but have not confirmed your account.
          You can confirm your account using the link we sent to you, or by resetting your password.
          """

        _ ->
          "Incorrect email or password"
      end

    conn
    |> put_flash(:error, message)
    |> redirect(to: ~p"/sign-in")
  end

  def sign_out(conn, _params) do
    return_to = get_session(conn, :return_to) || ~p"/"

    conn
    |> clear_session(:ash_framework)
    |> put_flash(:info, "You are now signed out")
    |> redirect(to: return_to)
  end

  @doc """
  Exchanges authorization code for JWT token.

  This endpoint is called by Next.js server after receiving the code in callback URL.
  The code is single-use and expires after 60 seconds.

  ## Request

  POST /api/auth/exchange
  Body: {"code": "abc123..."}

  ## Response

  Success: {"token": "eyJhbGc..."}
  Error: {"error": "Invalid or already used code"}
  """
  def exchange(conn, %{"code" => code}) when is_binary(code) do
    case ExchangeCodeStore.exchange(code) do
      {:ok, token} ->
        Logger.info("Successfully exchanged code for token")
        json(conn, %{token: token})

      {:error, :invalid_code} ->
        Logger.warning("Invalid or already used exchange code")
        conn
        |> put_status(:bad_request)
        |> json(%{error: "Invalid or already used code"})

      {:error, :expired} ->
        Logger.warning("Expired exchange code")
        conn
        |> put_status(:bad_request)
        |> json(%{error: "Code has expired"})
    end
  end

  def exchange(conn, _params) do
    Logger.warning("Exchange endpoint called without code parameter")
    conn
    |> put_status(:bad_request)
    |> json(%{error: "Missing code parameter"})
  end

  defp build_callback_url(base_uri, code) do
    uri = URI.parse(base_uri)

    existing_params =
      if uri.query do
        URI.decode_query(uri.query)
      else
        %{}
      end

    # Pass code instead of token for security
    new_params = Map.put(existing_params, "code", code)

    %{uri | query: URI.encode_query(new_params)}
    |> URI.to_string()
  end
end
