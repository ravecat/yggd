defmodule PhoenixFrameworkWeb.PageController do
  use PhoenixFrameworkWeb, :controller

  def home(conn, _params) do
    render(conn, :home)
  end
end
