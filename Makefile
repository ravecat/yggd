.PHONY: all setup start serve format format.check

all:
	$(MAKE) serve

setup:
	pnpm install --recursive
	npx nx run-many -t setup --all --outputStyle=stream

start:
	npx nx run-many -t start --all --tui

serve:
	$(MAKE) setup
	$(MAKE) start

format:
	npx prettier --write "**/*.md"

format.check:
	npx prettier --check "**/*.md"
