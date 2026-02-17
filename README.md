# Moda

> **Educational Project Disclaimer**
>
> Learning project for exploring integration of different languages and frameworks within a single monorepo.

Polyglot monorepo managed by [Nx](https://nx.dev) that combines multiple applications.

## Requirements

- Nix (flakes enabled)
- direnv + nix-direnv (optional, for automatic environment activation)

## Setup

### 1. Install Nix

```bash
sh <(curl -L https://nixos.org/nix/install)
```

### 2. Enable flakes

```bash
mkdir -p ~/.config/nix
printf "experimental-features = nix-command flakes\n" >> ~/.config/nix/nix.conf
```

### 3. (Optional) Install direnv and nix-direnv

For automatic environment activation when entering the project directory:

```bash
nix profile install nixpkgs#direnv nixpkgs#nix-direnv

mkdir -p ~/.config/direnv
echo 'source $HOME/.nix-profile/share/nix-direnv/direnvrc' >> ~/.config/direnv/direnvrc
```

Add direnv hook to the shell - see [direnv docs](https://direnv.net/docs/hook.html)

### 4. Prepare project environment

**With direnv (recommended):**

If direnv is configured, the environment activates automatically when you `cd` into the project directory. On first use,
approve with:

```bash
direnv allow
```

After that, no explicit commands are needed - direnv will load and unload the environment on entering and leaving the
directory.

**Without direnv (manual):**

Run in each new shell session:

```bash
nix develop
```

## Quick Start

Prepare workspace dependencies (apps + packages) and project setup targets:

```bash
make setup
```

Start all projects:

```bash
make start
```

One-command alias:

```bash
make serve
```

Selected projects:

```bash
npx nx run-many -t start -p nextjs,ash_framework --tui
```

## License

ISC
