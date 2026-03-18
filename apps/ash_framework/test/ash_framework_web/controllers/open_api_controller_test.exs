defmodule AshFrameworkWeb.OpenApiControllerTest do
  use AshFrameworkWeb.ConnCase, async: true

  defp parameter(operation, name) do
    Enum.find(operation["parameters"], &(&1["name"] == name))
  end

  defp sort_terms(resource) do
    resource
    |> AshJsonApi.JsonSchema.sortable_fields()
    |> Enum.flat_map(fn field ->
      name = to_string(field.name)
      [name, "-" <> name]
    end)
    |> Enum.uniq()
  end

  defp include_paths(resource) do
    resource
    |> AshJsonApi.Resource.Info.includes()
    |> all_paths()
    |> Enum.map(&Enum.join(&1, "."))
    |> Enum.uniq()
  end

  defp field_names(resource) do
    [
      Ash.Resource.Info.public_attributes(resource),
      Ash.Resource.Info.public_relationships(resource),
      Ash.Resource.Info.public_aggregates(resource),
      Ash.Resource.Info.public_calculations(resource)
    ]
    |> List.flatten()
    |> Enum.map(&to_string(&1.name))
    |> Enum.uniq()
  end

  defp all_paths(keyword, trail \\ []) do
    keyword
    |> List.wrap()
    |> Enum.flat_map(fn
      {key, rest} ->
        further =
          rest
          |> List.wrap()
          |> all_paths(trail ++ [key])

        [trail ++ [key]] ++ further

      key ->
        [trail ++ [key]]
    end)
  end

  test "GET /api/openapi returns the generated spec", %{conn: conn} do
    conn = get(conn, "/api/openapi")

    body = Jason.decode!(response(conn, 200))
    todos_get = get_in(body, ["paths", "/api/todos", "get"])

    assert get_in(todos_get, ["responses", "200", "content"]) != nil

    assert get_in(todos_get, [
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

    assert get_in(parameter(todos_get, "sort"), ["schema", "type"]) == "array"
    assert get_in(parameter(todos_get, "sort"), ["schema", "items", "type"]) == "string"

    assert get_in(parameter(todos_get, "sort"), ["schema", "items", "enum"]) ==
             sort_terms(AshFramework.Tasks.Todo)

    assert get_in(parameter(todos_get, "include"), ["schema", "type"]) == "array"
    assert get_in(parameter(todos_get, "include"), ["schema", "items", "type"]) == "string"

    assert get_in(parameter(todos_get, "include"), ["schema", "items", "enum"]) ==
             include_paths(AshFramework.Tasks.Todo)

    assert get_in(parameter(todos_get, "fields"), [
             "schema",
             "type"
           ]) == "object"

    assert get_in(parameter(todos_get, "fields"), [
             "schema",
             "properties",
             "todo",
             "type"
           ]) == "array"

    assert get_in(parameter(todos_get, "fields"), [
             "schema",
             "properties",
             "todo",
             "items",
             "type"
           ]) == "string"

    assert get_in(parameter(todos_get, "fields"), [
             "schema",
             "properties",
             "todo",
             "items",
             "enum"
           ]) == field_names(AshFramework.Tasks.Todo)

    assert get_in(parameter(todos_get, "fields"), [
             "schema",
             "properties",
             "board",
             "items",
             "enum"
           ]) == field_names(AshFramework.Tasks.Board)

    assert get_in(parameter(todos_get, "fields"), [
             "schema",
             "properties",
             "user",
             "items",
             "enum"
           ]) == field_names(AshFramework.Accounts.User)

    assert get_in(parameter(todos_get, "fields"), [
             "schema",
             "additionalProperties"
           ]) == false
  end
end
