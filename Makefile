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
	npx nx run-many -t format --all --outputStyle=stream

format.check:
	npx nx run-many -t format-check --all --outputStyle=stream
