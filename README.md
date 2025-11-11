# Yggd Monorepo

> ⚠️ **Educational Project Disclaimer**
>
> This is a learning project created to explore and integrate different programming languages and frameworks within a single monorepo. It may contain suboptimal or outdated solutions as it serves primarily as an experimental playground for technology integration.

## Overview

Yggd is a polyglot monorepo managed by [Nx](https://nx.dev) that combines multiple technologies:

- **Next.js** (TypeScript/React) - Frontend application
- **Ash Framework** (Elixir/Phoenix) - JSON:API backend with declarative resources
- **Phoenix Framework** (Elixir) - Traditional Phoenix backend application
- **Shared packages** - Common utilities and types

## Applications

### apps/nextjs

Frontend application built with Next.js 15, TypeScript, and React.

- **Port**: 3000
- **Tech**: Next.js, TypeScript, React, Tailwind CSS
- **Purpose**: User-facing web application

### apps/ash_framework

Backend API with Ash Framework providing JSON:API endpoints.

- **Port**: 4000
- **Tech**: Elixir, Phoenix, Ash Framework, PostgreSQL
- **Purpose**: Declarative resource-based API with auto-generated admin

### apps/phoenix_framework

Traditional Phoenix application for channel logic.

- **Port**: 4001
- **Tech**: Elixir, Phoenix, Ecto, PostgreSQL
- **Purpose**: Standard Phoenix development patterns

See [docs/applications-comparison.md](docs/applications-comparison.md) for detailed comparison.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v20.x or higher)
- **npm** (v10.x or higher)
- **Elixir** (v1.14 or higher)
- **Erlang/OTP** (v25 or higher)
- **PostgreSQL** (v14 or higher)
- **Nx CLI** (optional): `npm install -g nx`

## Quick Start

### Initial Setup

```bash
# Install all dependencies
npm install

# Install Nx CLI globally (optional, but recommended)
npm install -g nx

# Setup backend (choose one or both)
# Make sure PostgreSQL is running
nx run ash_framework:setup
nx run phoenix_framework:setup

# Seed the database (optional)
nx run ash_framework:seed
```

> **Note**: If you don't install Nx globally, you can use `npx nx` instead of `nx` in all commands below.

### Running Applications

```bash
# Start all applications in development mode
nx run-many -t serve

# Or use interactive UI to select and run targets
nx run-many -t serve --tui

# Or start applications individually:

nx run nextjs:serve             # http://localhost:3000
nx run ash_framework:serve      # http://localhost:4000
nx run phoenix_framework:serve  # http://localhost:4001
```

## Nx Commands

All project commands are based on Nx. You can find available targets in each project's `project.json` file.

### Essential Commands

```bash
# List all projects in the workspace
nx show projects

# Show dependency graph (opens in browser)
nx graph

# Run a target for all projects
nx run-many -t <target>

# Run a specific target for a project
nx run <project>:<target>

# Examples:
nx run-many -t build          # Build all projects
nx run-many -t test           # Test all projects
nx run nextjs:build           # Build Next.js app
nx run ash_framework:test     # Test Ash Framework app
```

### Finding Available Targets

Each project defines its available commands (targets) in `project.json`:

- `/apps/nextjs/project.json` - Next.js application targets
- `/apps/ash_framework/project.json` - Ash Framework application targets
- `/apps/phoenix_framework/project.json` - Phoenix Framework application targets
- `/packages/shared/project.json` - Shared package targets

## Useful Resources

### Documentation

- [Nx Documentation](https://nx.dev/getting-started/intro) - Monorepo management
- [Next.js Documentation](https://nextjs.org/docs) - Frontend framework
- [Phoenix Framework](https://hexdocs.pm/phoenix/overview.html) - Web framework
- [Ash Framework](https://hexdocs.pm/ash/get-started.html) - Declarative resource framework
- [Elixir](https://elixir-lang.org/getting-started/introduction.html) - Programming language

### Learning Resources

- [Nx Tutorial](https://nx.dev/getting-started/tutorials)
- [Next.js Learn](https://nextjs.org/learn)
- [Elixir School](https://elixirschool.com/)
- [Phoenix Guides](https://hexdocs.pm/phoenix/up_and_running.html)
- [Ash Framework Guides](https://hexdocs.pm/ash/readme.html)

## License

ISC
