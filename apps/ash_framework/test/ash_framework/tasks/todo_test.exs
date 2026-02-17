defmodule AshFramework.Tasks.TodoTest do
  use AshFramework.DataCase, async: true

  alias AshFramework.Accounts.User
  alias AshFramework.Tasks.Todo

  defp create_test_user(email) do
    AshFramework.Repo.insert!(%User{
      id: Ecto.UUID.generate(),
      email: Ash.CiString.new(email)
    })
  end

  describe "create action" do
    test "creates a todo with valid attributes" do
      user = create_test_user("test@example.com")

      todo =
        Todo
        |> Ash.Changeset.for_create(:create, %{
          title: "Test Todo",
          content: "This is a test todo content",
          status: "todo",
          user_id: user.id
        })
        |> Ash.create!()

      assert todo.title == "Test Todo"
      assert todo.content == "This is a test todo content"
      assert todo.status == :todo
      assert todo.user_id == user.id
      assert todo.created_at
      assert todo.updated_at
    end

    test "fails to create a todo without title" do
      user = create_test_user("test@example.com")

      assert_raise Ash.Error.Invalid, fn ->
        Todo
        |> Ash.Changeset.for_create(:create, %{
          content: "Content without title",
          user_id: user.id
        })
        |> Ash.create!()
      end
    end

    test "fails to create a todo without content" do
      user = create_test_user("test@example.com")

      assert_raise Ash.Error.Invalid, fn ->
        Todo
        |> Ash.Changeset.for_create(:create, %{
          title: "Title without content",
          user_id: user.id
        })
        |> Ash.create!()
      end
    end

    test "defaults todo status to todo" do
      user = create_test_user("test@example.com")

      todo =
        Todo
        |> Ash.Changeset.for_create(:create, %{
          title: "Todo without explicit status",
          content: "Content",
          user_id: user.id
        })
        |> Ash.create!()

      assert todo.status == :todo
    end

    test "fails to create todo with invalid status" do
      user = create_test_user("test@example.com")

      assert_raise Ash.Error.Invalid, fn ->
        Todo
        |> Ash.Changeset.for_create(:create, %{
          title: "Todo with invalid status",
          content: "Content",
          status: "archived",
          user_id: user.id
        })
        |> Ash.create!()
      end
    end

    test "fails to create a todo without user" do
      assert_raise Ash.Error.Invalid, fn ->
        Todo
        |> Ash.Changeset.for_create(:create, %{
          title: "Todo without user",
          content: "Content"
        })
        |> Ash.create!()
      end
    end
  end

  describe "read action" do
    test "reads all todos" do
      user = create_test_user("test@example.com")

      todo1 =
        Todo
        |> Ash.Changeset.for_create(:create, %{
          title: "Todo 1",
          content: "Content 1",
          status: "todo",
          user_id: user.id
        })
        |> Ash.create!()

      todo2 =
        Todo
        |> Ash.Changeset.for_create(:create, %{
          title: "Todo 2",
          content: "Content 2",
          status: "in_progress",
          user_id: user.id
        })
        |> Ash.create!()

      todos = Todo |> Ash.read!()

      assert length(todos) == 2
      assert Enum.any?(todos, &(&1.id == todo1.id))
      assert Enum.any?(todos, &(&1.id == todo2.id))
    end

    test "loads user relationship" do
      user = create_test_user("user@example.com")

      todo =
        Todo
        |> Ash.Changeset.for_create(:create, %{
          title: "Todo with user",
          content: "Content",
          status: "todo",
          user_id: user.id
        })
        |> Ash.create!()

      todo_with_user = Todo |> Ash.get!(todo.id) |> Ash.load!(:user)

      assert todo_with_user.user.id == user.id
      assert todo_with_user.user.email == Ash.CiString.new("user@example.com")
    end
  end

  describe "update action" do
    test "updates a todo with valid attributes" do
      user = create_test_user("test@example.com")

      todo =
        Todo
        |> Ash.Changeset.for_create(:create, %{
          title: "Original Title",
          content: "Original Content",
          status: "todo",
          user_id: user.id
        })
        |> Ash.create!()

      updated_todo =
        todo
        |> Ash.Changeset.for_update(:update, %{
          title: "Updated Title",
          content: "Updated Content",
          status: "completed"
        })
        |> Ash.update!()

      assert updated_todo.title == "Updated Title"
      assert updated_todo.content == "Updated Content"
      assert updated_todo.status == :completed
      assert updated_todo.user_id == user.id
    end
  end

  describe "destroy action" do
    test "destroys a todo" do
      user = create_test_user("test@example.com")

      todo =
        Todo
        |> Ash.Changeset.for_create(:create, %{
          title: "Todo to delete",
          content: "Content",
          user_id: user.id
        })
        |> Ash.create!()

      todo |> Ash.destroy!()

      assert {:error, %Ash.Error.Invalid{}} = Todo |> Ash.get(todo.id)
    end
  end

  describe "user has_many todos relationship" do
    test "loads user's todos" do
      user = create_test_user("test@example.com")

      todo1 =
        Todo
        |> Ash.Changeset.for_create(:create, %{
          title: "User Todo 1",
          content: "Content 1",
          user_id: user.id
        })
        |> Ash.create!()

      todo2 =
        Todo
        |> Ash.Changeset.for_create(:create, %{
          title: "User Todo 2",
          content: "Content 2",
          user_id: user.id
        })
        |> Ash.create!()

      user_with_todos = User |> Ash.get!(user.id) |> Ash.load!(:todos)

      assert length(user_with_todos.todos) == 2
      assert Enum.any?(user_with_todos.todos, &(&1.id == todo1.id))
      assert Enum.any?(user_with_todos.todos, &(&1.id == todo2.id))
    end
  end
end
