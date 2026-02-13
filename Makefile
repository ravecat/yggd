.PHONY: serve

serve:
	pnpm install
	npx nx run-many -t serve --tui
