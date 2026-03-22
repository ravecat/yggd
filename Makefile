.PHONY: setup start serve test lint format format.check codegen codegen.asyncapi

setup:
	pnpm install --recursive
	npx nx run-many -t setup --all --outputStyle=stream

start:
	npx nx run-many -t start --all --tui

serve:
	$(MAKE) setup
	$(MAKE) start

test:
	npx nx run-many -t test --all --outputStyle=stream

lint:
	npx nx run-many -t lint --all --outputStyle=stream

format:
	npx nx run-many -t format --all --outputStyle=stream

format.check:
	npx nx run-many -t format.check --all --outputStyle=stream

codegen: codegen.asyncapi

codegen.asyncapi:
	pnpx @rvct/asyncapi-codegen --input apps/ash_framework/priv/specs/asyncapi.yaml --out packages/shared/src/asyncapi
