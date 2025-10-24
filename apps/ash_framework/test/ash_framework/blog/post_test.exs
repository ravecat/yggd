defmodule AshFramework.Blog.PostTest do
  use AshFramework.DataCase, async: true

  alias AshFramework.Blog.Post
  alias AshFramework.Accounts.User

  defp create_test_user(email) do
    AshFramework.Repo.insert!(%User{
      id: Ecto.UUID.generate(),
      email: Ash.CiString.new(email)
    })
  end

  describe "create action" do
    test "creates a post with valid attributes" do
      user = create_test_user("test@example.com")

      post =
        Post
        |> Ash.Changeset.for_create(:create, %{
          title: "Test Post",
          content: "This is a test post content",
          author_id: user.id
        })
        |> Ash.create!()

      assert post.title == "Test Post"
      assert post.content == "This is a test post content"
      assert post.author_id == user.id
      assert post.created_at
      assert post.updated_at
    end

    test "fails to create a post without title" do
      user = create_test_user("test@example.com")

      assert_raise Ash.Error.Invalid, fn ->
        Post
        |> Ash.Changeset.for_create(:create, %{
          content: "Content without title",
          author_id: user.id
        })
        |> Ash.create!()
      end
    end

    test "fails to create a post without content" do
      user = create_test_user("test@example.com")

      assert_raise Ash.Error.Invalid, fn ->
        Post
        |> Ash.Changeset.for_create(:create, %{
          title: "Title without content",
          author_id: user.id
        })
        |> Ash.create!()
      end
    end

    test "fails to create a post without author" do
      assert_raise Ash.Error.Invalid, fn ->
        Post
        |> Ash.Changeset.for_create(:create, %{
          title: "Post without author",
          content: "Content"
        })
        |> Ash.create!()
      end
    end
  end

  describe "read action" do
    test "reads all posts" do
      user = create_test_user("test@example.com")

      post1 =
        Post
        |> Ash.Changeset.for_create(:create, %{
          title: "Post 1",
          content: "Content 1",
          author_id: user.id
        })
        |> Ash.create!()

      post2 =
        Post
        |> Ash.Changeset.for_create(:create, %{
          title: "Post 2",
          content: "Content 2",
          author_id: user.id
        })
        |> Ash.create!()

      posts = Post |> Ash.read!()

      assert length(posts) == 2
      assert Enum.any?(posts, &(&1.id == post1.id))
      assert Enum.any?(posts, &(&1.id == post2.id))
    end

    test "loads author relationship" do
      user = create_test_user("author@example.com")

      post =
        Post
        |> Ash.Changeset.for_create(:create, %{
          title: "Post with author",
          content: "Content",
          author_id: user.id
        })
        |> Ash.create!()

      post_with_author = Post |> Ash.get!(post.id) |> Ash.load!(:author)

      assert post_with_author.author.id == user.id
      assert post_with_author.author.email == Ash.CiString.new("author@example.com")
    end
  end

  describe "update action" do
    test "updates a post with valid attributes" do
      user = create_test_user("test@example.com")

      post =
        Post
        |> Ash.Changeset.for_create(:create, %{
          title: "Original Title",
          content: "Original Content",
          author_id: user.id
        })
        |> Ash.create!()

      updated_post =
        post
        |> Ash.Changeset.for_update(:update, %{
          title: "Updated Title",
          content: "Updated Content"
        })
        |> Ash.update!()

      assert updated_post.title == "Updated Title"
      assert updated_post.content == "Updated Content"
      assert updated_post.author_id == user.id
    end
  end

  describe "destroy action" do
    test "destroys a post" do
      user = create_test_user("test@example.com")

      post =
        Post
        |> Ash.Changeset.for_create(:create, %{
          title: "Post to delete",
          content: "Content",
          author_id: user.id
        })
        |> Ash.create!()

      post |> Ash.destroy!()

      assert {:error, %Ash.Error.Invalid{}} = Post |> Ash.get(post.id)
    end
  end

  describe "user has_many posts relationship" do
    test "loads user's posts" do
      user = create_test_user("test@example.com")

      post1 =
        Post
        |> Ash.Changeset.for_create(:create, %{
          title: "User Post 1",
          content: "Content 1",
          author_id: user.id
        })
        |> Ash.create!()

      post2 =
        Post
        |> Ash.Changeset.for_create(:create, %{
          title: "User Post 2",
          content: "Content 2",
          author_id: user.id
        })
        |> Ash.create!()

      user_with_posts = User |> Ash.get!(user.id) |> Ash.load!(:posts)

      assert length(user_with_posts.posts) == 2
      assert Enum.any?(user_with_posts.posts, &(&1.id == post1.id))
      assert Enum.any?(user_with_posts.posts, &(&1.id == post2.id))
    end
  end
end
