defmodule AshFrameworkWeb.PageControllerTest do
  use AshFrameworkWeb.ConnCase

  test "GET /", %{conn: conn} do
    conn = get(conn, ~p"/")
    assert html_response(conn, 200) =~ "Peace of mind from prototype to production"
  end

  test "GET /users", %{conn: conn} do
    conn = get(conn, ~p"/users")
    assert html_response(conn, 200) =~ "users-app"
  end
end
