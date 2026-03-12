defmodule AshFramework.Tasks.TodoTest do
  use AshFramework.DataCase, async: true

  alias AshFramework.Accounts.User
  alias AshFramework.Tasks.Board
  alias AshFramework.Tasks.Todo

  defp create_test_user(email) do
    AshFramework.Repo.insert!(%User{
      id: Ecto.UUID.generate(),
      email: Ash.CiString.new(email)
    })
  end

  defp create_test_board(user, visibility \\ :private) do
    board =
      Board
      |> Ash.Changeset.for_create(:provision, %{owner_id: user.id})
      |> Ash.create!(authorize?: false)

    if visibility == :private do
      board
    else
      board
      |> Ash.Changeset.for_update(:update, %{visibility: visibility})
      |> Ash.update!(authorize?: false)
    end
  end

  describe "create action" do
    test "creates a todo with valid attributes" do
      user = create_test_user("test@example.com")
      board = create_test_board(user)

      todo =
        Todo
        |> Ash.Changeset.for_create(:create_internal, %{
          title: "Test Todo",
          content: "This is a test todo content",
          status: "backlog",
          board_id: board.id
        })
        |> Ash.create!(authorize?: false)

      assert todo.title == "Test Todo"
      assert todo.content == "This is a test todo content"
      assert todo.status == :backlog
      assert todo.board_id == board.id
      assert todo.created_at
      assert todo.updated_at
    end

    test "creates a todo with explicit priority" do
      user = create_test_user("priority@example.com")
      board = create_test_board(user)

      todo =
        Todo
        |> Ash.Changeset.for_create(:create_internal, %{
          title: "Priority Todo",
          content: "Priority content",
          priority: "urgent",
          board_id: board.id
        })
        |> Ash.create!(authorize?: false)

      assert todo.priority == :urgent
    end

    test "fails to create a todo without title" do
      user = create_test_user("test@example.com")
      board = create_test_board(user)

      assert_raise Ash.Error.Invalid, fn ->
        Todo
        |> Ash.Changeset.for_create(:create_internal, %{
          content: "Content without title",
          board_id: board.id
        })
        |> Ash.create!(authorize?: false)
      end
    end

    test "fails to create a todo without content" do
      user = create_test_user("test@example.com")
      board = create_test_board(user)

      assert_raise Ash.Error.Invalid, fn ->
        Todo
        |> Ash.Changeset.for_create(:create_internal, %{
          title: "Title without content",
          board_id: board.id
        })
        |> Ash.create!(authorize?: false)
      end
    end

    test "defaults todo status to backlog" do
      user = create_test_user("test@example.com")
      board = create_test_board(user)

      todo =
        Todo
        |> Ash.Changeset.for_create(:create_internal, %{
          title: "Todo without explicit status",
          content: "Content",
          board_id: board.id
        })
        |> Ash.create!(authorize?: false)

      assert todo.status == :backlog
    end

    test "fails to create todo with invalid status" do
      user = create_test_user("test@example.com")
      board = create_test_board(user)

      assert_raise Ash.Error.Invalid, fn ->
        Todo
        |> Ash.Changeset.for_create(:create_internal, %{
          title: "Todo with invalid status",
          content: "Content",
          status: "archived",
          board_id: board.id
        })
        |> Ash.create!(authorize?: false)
      end
    end

    test "fails to create a todo without board" do
      assert_raise Ash.Error.Invalid, fn ->
        Todo
        |> Ash.Changeset.for_create(:create_internal, %{
          title: "Todo without board",
          content: "Content"
        })
        |> Ash.create!(authorize?: false)
      end
    end

    test "allows the board owner to create a todo through the public action" do
      user = create_test_user("actor-owner@example.com")
      board = create_test_board(user)

      todo =
        Todo
        |> Ash.Changeset.for_create(
          :create,
          %{
            title: "Actor Todo",
            content: "Created with actor authorization",
            board_id: board.id
          },
          actor: user
        )
        |> Ash.create!()

      assert todo.board_id == board.id
    end

    test "rejects public create when the actor does not own the board" do
      owner = create_test_user("board-owner@example.com")
      stranger = create_test_user("stranger@example.com")
      board = create_test_board(owner)

      assert_raise Ash.Error.Invalid, fn ->
        Todo
        |> Ash.Changeset.for_create(
          :create,
          %{
            title: "Forbidden Todo",
            content: "Should not be created",
            board_id: board.id
          },
          actor: stranger
        )
        |> Ash.create!()
      end
    end
  end

  describe "read action" do
    test "reads all todos" do
      user = create_test_user("test@example.com")
      board = create_test_board(user, :public)

      todo1 =
        Todo
        |> Ash.Changeset.for_create(:create_internal, %{
          title: "Todo 1",
          content: "Content 1",
          status: "backlog",
          board_id: board.id
        })
        |> Ash.create!(authorize?: false)

      todo2 =
        Todo
        |> Ash.Changeset.for_create(:create_internal, %{
          title: "Todo 2",
          content: "Content 2",
          status: "in_progress",
          board_id: board.id
        })
        |> Ash.create!(authorize?: false)

      page = Todo |> Ash.read!()
      todos = page.results

      assert length(todos) == 2
      assert Enum.any?(todos, &(&1.id == todo1.id))
      assert Enum.any?(todos, &(&1.id == todo2.id))
    end

    test "sorts todos by priority using business order" do
      user = create_test_user("priority-sort@example.com")
      board = create_test_board(user, :public)

      for {title, priority} <- [
            {"Low", "low"},
            {"Medium", "medium"},
            {"High", "high"},
            {"Urgent", "urgent"}
          ] do
        Todo
        |> Ash.Changeset.for_create(:create_internal, %{
          title: title,
          content: "#{title} priority",
          priority: priority,
          board_id: board.id
        })
        |> Ash.create!(authorize?: false)
      end

      ascending =
        Todo
        |> Ash.Query.sort(priority: :asc)
        |> Ash.read!()
        |> Map.fetch!(:results)

      descending =
        Todo
        |> Ash.Query.sort(priority: :desc)
        |> Ash.read!()
        |> Map.fetch!(:results)

      assert Enum.map(ascending, & &1.priority) == [:low, :medium, :high, :urgent]
      assert Enum.map(descending, & &1.priority) == [:urgent, :high, :medium, :low]
    end

    test "loads board relationship" do
      user = create_test_user("user@example.com")
      board = create_test_board(user, :public)

      todo =
        Todo
        |> Ash.Changeset.for_create(:create_internal, %{
          title: "Todo with board",
          content: "Content",
          status: "backlog",
          board_id: board.id
        })
        |> Ash.create!(authorize?: false)

      todo_with_board = Todo |> Ash.get!(todo.id) |> Ash.load!(:board)

      assert todo_with_board.board.id == board.id
      assert todo_with_board.board.owner_id == user.id
    end

    test "allows unauthenticated reads for public board todos" do
      user = create_test_user("public-reader@example.com")
      board = create_test_board(user, :public)

      todo =
        Todo
        |> Ash.Changeset.for_create(:create_internal, %{
          title: "Shared Todo",
          content: "Visible from a public board",
          board_id: board.id
        })
        |> Ash.create!(authorize?: false)

      assert Todo |> Ash.get!(todo.id)
    end

    test "allows the owner to read private board todos" do
      user = create_test_user("private-reader@example.com")
      board = create_test_board(user)

      todo =
        Todo
        |> Ash.Changeset.for_create(:create_internal, %{
          title: "Private Todo",
          content: "Visible only to the owner",
          board_id: board.id
        })
        |> Ash.create!(authorize?: false)

      assert Todo |> Ash.get!(todo.id, actor: user)
    end
  end

  describe "update action" do
    test "updates a todo with valid attributes" do
      user = create_test_user("test@example.com")
      board = create_test_board(user)

      todo =
        Todo
        |> Ash.Changeset.for_create(:create_internal, %{
          title: "Original Title",
          content: "Original Content",
          status: "backlog",
          board_id: board.id
        })
        |> Ash.create!(authorize?: false)

      updated_todo =
        todo
        |> Ash.Changeset.for_update(
          :update,
          %{
            title: "Updated Title",
            content: "Updated Content",
            status: "done"
          },
          actor: user
        )
        |> Ash.update!()

      assert updated_todo.title == "Updated Title"
      assert updated_todo.content == "Updated Content"
      assert updated_todo.status == :done
      assert updated_todo.board_id == board.id
    end
  end

  describe "destroy action" do
    test "destroys a todo" do
      user = create_test_user("test@example.com")
      board = create_test_board(user)

      todo =
        Todo
        |> Ash.Changeset.for_create(:create_internal, %{
          title: "Todo to delete",
          content: "Content",
          board_id: board.id
        })
        |> Ash.create!(authorize?: false)

      todo |> Ash.destroy!(actor: user)

      assert {:error, %Ash.Error.Invalid{}} = Todo |> Ash.get(todo.id)
    end
  end

  describe "board has_many todos relationship" do
    test "loads board todos" do
      user = create_test_user("test@example.com")
      board = create_test_board(user)

      todo1 =
        Todo
        |> Ash.Changeset.for_create(:create_internal, %{
          title: "Board Todo 1",
          content: "Content 1",
          board_id: board.id
        })
        |> Ash.create!(authorize?: false)

      todo2 =
        Todo
        |> Ash.Changeset.for_create(:create_internal, %{
          title: "Board Todo 2",
          content: "Content 2",
          board_id: board.id
        })
        |> Ash.create!(authorize?: false)

      board_with_todos =
        Board |> Ash.get!(board.id, authorize?: false) |> Ash.load!(:todos, authorize?: false)

      assert length(board_with_todos.todos) == 2
      assert Enum.any?(board_with_todos.todos, &(&1.id == todo1.id))
      assert Enum.any?(board_with_todos.todos, &(&1.id == todo2.id))
    end
  end
end
