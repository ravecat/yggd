defmodule Mix.Tasks.Seed.Todos do
  @moduledoc """
  Seeds todos with fake data.

  ## Usage

      mix seed.todos

  This task will:
  - Create 3 test users if no users exist
  - Generate 100 todos with realistic fake content
  - Distribute todos evenly among existing users
  """

  use Mix.Task

  require Logger

  alias AshFramework.Accounts.User
  alias AshFramework.Tasks.Todo

  @shortdoc "Seeds 100 todos with fake data"
  @requirements ["app.start"]

  @todos_count 100
  @default_users_count 3
  @statuses ["todo", "in_progress", "completed"]

  def run(_args) do
    Mix.Task.run("app.config")

    Logger.info("Starting to seed todos...")

    users = ensure_users_exist()
    seed_todos(users)

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

  defp seed_todos(users) do
    Logger.info("Generating #{@todos_count} todos...")

    todos_data =
      Enum.map(1..@todos_count, fn i ->
        user = Enum.random(users)

        %{
          title: Faker.Lorem.sentence(3..8),
          content: generate_content(),
          status: Enum.random(@statuses),
          user_id: user.id
        }
        |> tap(fn _ ->
          if rem(i, 10) == 0 do
            Logger.info("Generated #{i}/#{@todos_count} todos...")
          end
        end)
      end)

    Logger.info("Inserting todos into database...")

    Enum.each(todos_data, fn todo_data ->
      Todo
      |> Ash.Changeset.for_create(:create, todo_data)
      |> Ash.create!()
    end)

    Logger.info("Successfully created #{@todos_count} todos")
  end

  defp generate_content do
    paragraphs_count = Enum.random(1..3)

    Faker.Lorem.paragraphs(paragraphs_count)
    |> Enum.join("\n\n")
  end
end
