defmodule AshFrameworkWeb.PageController do
  use AshFrameworkWeb, :controller

  def home(conn, _params) do
    render(conn, :home)
  end

  def index(conn, _params) do
    render(conn, :index)
  end

  def users(conn, _params) do
    render(conn, :users)
  end
end
