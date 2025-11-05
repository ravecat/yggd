defmodule AshFrameworkWeb.Router do
  use AshFrameworkWeb, :router

  use AshAuthentication.Phoenix.Router

  import AshAuthentication.Plug.Helpers

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_live_flash
    plug :put_root_layout, html: {AshFrameworkWeb.Layouts, :root}
    plug :protect_from_forgery
    plug :put_secure_browser_headers
    plug AshFrameworkWeb.Plugs.FederatedAuthRedirect
    plug :load_from_session
  end

  pipeline :api do
    plug :accepts, ["json"]
    plug :load_from_bearer
    plug :set_actor, :user
  end

  pipeline :rpc do
    plug :accepts, ["json"]
    plug :fetch_session
    plug :load_from_session
  end

  scope "/api" do
    pipe_through [:api]

    forward "/swagger", OpenApiSpex.Plug.SwaggerUI,
      path: "/api/spec",
      default_model_expand_depth: 4

    forward "/", AshFrameworkWeb.AshJsonApiRouter
  end

  scope "/auth", AshFrameworkWeb do
    pipe_through [:api]

    post "/exchange", AuthController, :exchange
  end

  scope "/rpc", AshFrameworkWeb do
    pipe_through :rpc

    post "/run", AshTypescriptRpcController, :run
    post "/validate", AshTypescriptRpcController, :validate
  end

  scope "/", AshFrameworkWeb do
    pipe_through :browser

    ash_authentication_live_session :authenticated_routes do
      # in each liveview, add one of the following at the top of the module:
      #
      # If an authenticated user must be present:
      # on_mount {AshFrameworkWeb.LiveUserAuth, :live_user_required}
      #
      # If an authenticated user *may* be present:
      # on_mount {AshFrameworkWeb.LiveUserAuth, :live_user_optional}
      #
      # If an authenticated user must *not* be present:
      # on_mount {AshFrameworkWeb.LiveUserAuth, :live_no_user}
    end

    get "/typescript", PageController, :index
    get "/users", PageController, :users
  end

  scope "/", AshFrameworkWeb do
    pipe_through :browser

    get "/", PageController, :home
    auth_routes AuthController, AshFramework.Accounts.User, path: "/auth"
    sign_out_route AuthController

    # Remove these if you'd like to use your own authentication views
    sign_in_route register_path: "/register",
                  reset_path: "/reset",
                  auth_routes_prefix: "/auth",
                  on_mount: [{AshFrameworkWeb.LiveUserAuth, :live_no_user}],
                  overrides: [
                    AshFrameworkWeb.AuthOverrides,
                    Elixir.AshAuthentication.Phoenix.Overrides.DaisyUI
                  ]

    # Remove this if you do not want to use the reset password feature
    reset_route auth_routes_prefix: "/auth",
                overrides: [
                  AshFrameworkWeb.AuthOverrides,
                  Elixir.AshAuthentication.Phoenix.Overrides.DaisyUI
                ]

    # Remove this if you do not use the confirmation strategy
    confirm_route AshFramework.Accounts.User, :confirm_new_user,
      auth_routes_prefix: "/auth",
      overrides: [
        AshFrameworkWeb.AuthOverrides,
        Elixir.AshAuthentication.Phoenix.Overrides.DaisyUI
      ]

    # Remove this if you do not use the magic link strategy.
    magic_sign_in_route(AshFramework.Accounts.User, :magic_link,
      auth_routes_prefix: "/auth",
      overrides: [
        AshFrameworkWeb.AuthOverrides,
        Elixir.AshAuthentication.Phoenix.Overrides.DaisyUI
      ]
    )
  end

  # Other scopes may use custom stacks.
  # scope "/api", AshFrameworkWeb do
  #   pipe_through :api
  # end

  # Enable LiveDashboard and Swoosh mailbox preview in development
  if Application.compile_env(:ash_framework, :dev_routes) do
    # If you want to use the LiveDashboard in production, you should put
    # it behind authentication and allow only admins to access it.
    # If your application does not have an admins-only section yet,
    # you can use Plug.BasicAuth to set up some basic authentication
    # as long as you are also using SSL (which you should anyway).
    import Phoenix.LiveDashboard.Router

    scope "/dev" do
      pipe_through :browser

      live_dashboard "/dashboard", metrics: AshFrameworkWeb.Telemetry
      forward "/mailbox", Plug.Swoosh.MailboxPreview
    end
  end

  if Application.compile_env(:ash_framework, :dev_routes) do
    import AshAdmin.Router

    scope "/admin" do
      pipe_through :browser

      ash_admin "/"
    end
  end
end
