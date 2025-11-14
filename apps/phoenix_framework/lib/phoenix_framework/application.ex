defmodule PhoenixFramework.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  @impl true
  def start(_type, _args) do
    children = [
      PhoenixFrameworkWeb.Telemetry,
      PhoenixFramework.Repo,
      {DNSCluster, query: Application.get_env(:phoenix_framework, :dns_cluster_query) || :ignore},
      {Phoenix.PubSub, name: PhoenixFramework.PubSub},
      {Registry, keys: :unique, name: PhoenixFramework.Registry},
      {DynamicSupervisor, name: PhoenixFramework.Supervisor.SharedDoc, strategy: :one_for_one},
      # Start a worker by calling: PhoenixFramework.Worker.start_link(arg)
      # {PhoenixFramework.Worker, arg},
      # Start to serve requests, typically the last entry
      PhoenixFrameworkWeb.Endpoint
    ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: PhoenixFramework.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  @impl true
  def config_change(changed, _new, removed) do
    PhoenixFrameworkWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
