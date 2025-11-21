# Yggd Monorepo

> ⚠️ **Educational Project Disclaimer**
>
> This is a learning project created to explore and integrate different programming languages and frameworks within a single monorepo. It may contain suboptimal or outdated solutions as it serves primarily as an experimental playground for technology integration.

## Overview

Current project is a polyglot monorepo managed by [Nx](https://nx.dev) that combines multiple applications:

### apps/nextjs

Frontend application (OAuth PKCE, realtime Excalidraw collaboration, JSONAPI filtering/pagination/sorting)

- **Port**: 3000
- **Tech**: Next.js 16, TypeScript, React, Tailwind CSS, PostgreSQL

### apps/ash_framework

Backend API with Ash Framework providing JSON:API endpoints.

- **Port**: 4000
- **Tech**: Elixir, Phoenix, Ash Framework, PostgreSQL

### apps/phoenix_framework

Traditional Phoenix application for channel logic.

- **Port**: 4001
- **Tech**: Elixir, Phoenix, Ecto, PostgreSQL

## Prerequisites

Before beginning, ensure the following are installed:

- **Node.js** (v20.x or higher)
- **npm** (v10.x or higher)
- **Elixir** (v1.14 or higher)
- **Erlang/OTP** (v25 or higher)
- **PostgreSQL** (v14 or higher)

or use [asdf](https://asdf-vm.com/) tool version manager with instructions below.

### ASDF installation (optional, recommended)

The project uses `.tool-versions` to declare required runtimes; `asdf` can install and manage these versions.

1. Install `asdf` for the operating system and follow the official getting [started guide](https://asdf-vm.com/guide/getting-started.html).

2. Install required asdf plugins:
   - Node.js - [asdf-nodejs](https://github.com/asdf-vm/asdf-nodejs.git)
   - Erlang - [asdf-erlang](https://github.com/asdf-vm/asdf-erlang.git)
   - Elixir - [asdf-elixir](https://github.com/asdf-vm/asdf-elixir.git)
   - PostgreSQL - [asdf-postgres](https://github.com/smashedtoatoms/asdf-postgres)

   See the plugin documentation for platform-specific prerequisites and additional usage notes.

3. Install the versions declared in `.tool-versions` by running the following command from the project root (after required plugins are added):

```bash
asdf install
```

Notes:

- Building runtimes dependencies may require native dependencies (e.g., C build tools, OpenSSL, zlib). See the plugin documents for OS-specific prerequisites.
- If `asdf` is not used, install required runtimes using the system package manager.

## Quick Start

### Initial Setup

```bash
# Install all dependencies
npm install

# Seed the database with test data (optional)
npx nx run ash_framework:seed
```

### Running Applications

```bash
# Start all applications in development mode
npx nx run-many -t serve

# Or use interactive UI to select and run targets
npx nx run-many -t serve --tui

# Or start applications individually:

npx nx run nextjs:serve             # http://localhost:3000
npx nx run ash_framework:serve      # http://localhost:4000
npx nx run phoenix_framework:serve  # http://localhost:4001
```

## Nx Commands

All project commands are based on [Nx](https://nx.dev). Available targets are defined in each project's `project.json` file.

### Essential Commands

```bash
# List all projects in the workspace
npx nx show projects

# Show dependency graph (opens in browser)
npx nx graph

# Run a target for all projects
npx nx run-many -t <target>

# Run a specific target for a project
npx nx run <project>:<target>

# Examples:
npx nx run-many -t build          # Build all projects
npx nx run-many -t test           # Test all projects
npx nx run nextjs:build           # Build Next.js app
npx nx run ash_framework:test     # Test Ash Framework app
```

## Useful Resources

- [Nx Documentation](https://nx.dev/getting-started/intro) - Monorepo management
- [Next.js Documentation](https://nextjs.org/docs) - Frontend framework
- [Phoenix Framework](https://hexdocs.pm/phoenix/overview.html) - Web framework
- [Ash Framework](https://hexdocs.pm/ash/get-started.html) - Declarative resource framework
- [Elixir](https://elixir-lang.org/getting-started/introduction.html) - Programming language

## License

ISC
