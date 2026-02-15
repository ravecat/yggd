.PHONY: serve format format.check

serve:
	pnpm install
	npx nx run-many -t serve --tui

format:
	npx prettier --write "**/*.md"

format.check:
	npx prettier --check "**/*.md"
