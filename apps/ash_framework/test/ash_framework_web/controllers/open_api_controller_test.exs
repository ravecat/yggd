defmodule AshFrameworkWeb.OpenApiControllerTest do
  use AshFrameworkWeb.ConnCase, async: true

  test "GET /api/openapi returns the generated spec", %{conn: conn} do
    conn = get(conn, "/api/openapi")

    body = Jason.decode!(response(conn, 200))

    assert get_in(body, ["paths", "/api/todos", "get", "responses", "200", "content"]) != nil

    assert get_in(body, [
             "paths",
             "/api/todos",
             "get",
             "responses",
             "200",
             "content",
             "application/vnd.api+json",
             "schema",
             "properties",
             "meta",
             "properties",
             "statuses",
             "items",
             "enum"
           ]) == Enum.map(AshFramework.Tasks.TodoStatus.values(), &to_string/1)
  end
end
