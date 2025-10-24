defmodule Mix.Tasks.Seed.Posts do
  @moduledoc """
  Seeds blog posts with fake data.

  ## Usage

      mix seed.posts

  This task will:
  - Create 3 test users if no users exist
  - Generate 100 blog posts with realistic fake content
  - Distribute posts evenly among existing users
  """

  use Mix.Task

  require Logger

  alias AshFramework.Blog.Post
  alias AshFramework.Accounts.User

  @shortdoc "Seeds 100 blog posts with fake data"
  @requirements ["app.start"]

  @posts_count 100
  @default_users_count 3

  def run(_args) do
    Mix.Task.run("app.config")

    Logger.info("Starting to seed blog posts...")

    users = ensure_users_exist()
    seed_posts(users)

    Logger.info("Seeding completed successfully!")
  end

  defp ensure_users_exist do
    case User |> Ash.read!() do
      [] ->
        Logger.info("No users found. Creating #{@default_users_count} test users...")
        create_test_users(@default_users_count)

      users ->
        Logger.info("Found #{length(users)} existing users")
        users
    end
  end

  defp create_test_users(count) do
    Enum.map(1..count, fn i ->
      email = "user#{i}@example.com"

      user = %User{
        id: Ecto.UUID.generate(),
        email: Ash.CiString.new(email)
      }

      AshFramework.Repo.insert!(user)
      Logger.info("Created user: #{email}")
      user
    end)
  end

  defp seed_posts(users) do
    Logger.info("Generating #{@posts_count} posts...")

    posts_data =
      Enum.map(1..@posts_count, fn i ->
        author = Enum.random(users)

        %{
          title: Faker.Lorem.sentence(5..15),
          content: generate_content(),
          author_id: author.id
        }
        |> tap(fn _ ->
          if rem(i, 10) == 0 do
            Logger.info("Generated #{i}/#{@posts_count} posts...")
          end
        end)
      end)

    Logger.info("Inserting posts into database...")

    Enum.each(posts_data, fn post_data ->
      Post
      |> Ash.Changeset.for_create(:create, post_data)
      |> Ash.create!()
    end)

    Logger.info("Successfully created #{@posts_count} posts")
  end

  defp generate_content do
    paragraphs_count = Enum.random(2..5)

    Faker.Lorem.paragraphs(paragraphs_count)
    |> Enum.join("\n\n")
  end
end
