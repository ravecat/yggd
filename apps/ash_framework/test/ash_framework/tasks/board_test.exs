defmodule AshFramework.Tasks.BoardTest do
  use AshFramework.DataCase, async: true

  alias AshFramework.Accounts.User
  alias AshFramework.Tasks.Board

  defp create_test_user(email) do
    AshFramework.Repo.insert!(%User{
      id: Ecto.UUID.generate(),
      email: Ash.CiString.new(email)
    })
  end

  defp provision_board(user) do
    Board
    |> Ash.Changeset.for_create(:provision, %{owner_id: user.id})
    |> Ash.create!(authorize?: false)
  end

  defp update_board_visibility(board, visibility) do
    board
    |> Ash.Changeset.for_update(:update, %{visibility: visibility})
    |> Ash.update!(authorize?: false)
  end

  describe "provision action" do
    test "creates one board per user and defaults to private" do
      user = create_test_user("board-owner@example.com")

      board = provision_board(user)
      same_board = provision_board(user)

      assert board.id == same_board.id
      assert board.owner_id == user.id
      assert board.visibility == :private
    end
  end

  describe "read policies" do
    test "allows the owner to read a private board" do
      user = create_test_user("private-owner@example.com")
      board = provision_board(user)

      assert Board |> Ash.get!(board.id, actor: user)
    end

    test "allows another user to read a public board by id" do
      owner = create_test_user("public-owner@example.com")
      reader = create_test_user("public-reader@example.com")

      board =
        owner
        |> provision_board()
        |> update_board_visibility(:public)

      assert Board |> Ash.get!(board.id, actor: reader)
    end

    test "allows unauthenticated reads for public boards" do
      user = create_test_user("unauth-public-owner@example.com")

      board =
        user
        |> provision_board()
        |> update_board_visibility(:public)

      assert Board |> Ash.get!(board.id)
    end

    test "list returns only the actor's own board" do
      owner = create_test_user("list-owner@example.com")
      other_user = create_test_user("list-public@example.com")

      owner_board = provision_board(owner)

      other_user
      |> provision_board()
      |> update_board_visibility(:public)

      boards =
        Board
        |> Ash.Query.for_read(:list)
        |> Ash.read!(actor: owner)

      assert Enum.map(boards, & &1.id) == [owner_board.id]
    end
  end

  describe "user relationship" do
    test "loads the board via has_one relationship" do
      user = create_test_user("relationship@example.com")
      board = provision_board(user)

      user_with_board =
        User |> Ash.get!(user.id, authorize?: false) |> Ash.load!(:board, authorize?: false)

      assert user_with_board.board.id == board.id
      assert user_with_board.board.owner_id == user.id
    end
  end
end
