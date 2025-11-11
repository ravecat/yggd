# PhoenixFramework

A standalone Phoenix application within the Yggd monorepo.

## Getting Started

This application runs on port **4001** (to avoid conflict with ash_framework on port 4000).

### Using Nx commands (recommended)

```bash
# From monorepo root
nx serve phoenix_framework

# Run tests
nx test phoenix_framework

# Create database
nx db:create phoenix_framework

# Run migrations
nx db:migrate phoenix_framework
```

### Using Mix directly

```bash
# From apps/phoenix_framework directory
mix setup           # Install and setup dependencies
mix phx.server      # Start Phoenix server
iex -S mix phx.server  # Start server in IEx
```

Now you can visit [`localhost:4001`](http://localhost:4001) from your browser.

## Database

* Database name: `phoenix_framework_dev` (development)
* Database name: `phoenix_framework_test` (test)
* Port: 5432 (PostgreSQL default)

Ready to run in production? Please [check our deployment guides](https://hexdocs.pm/phoenix/deployment.html).

## Resources

* Official website: <https://www.phoenixframework.org/>
* Guides: <https://hexdocs.pm/phoenix/overview.html>
* Docs: <https://hexdocs.pm/phoenix>
* Forum: <https://elixirforum.com/c/phoenix-forum>
* Source: <https://github.com/phoenixframework/phoenix>

