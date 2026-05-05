.PHONY: commit status push help createbranch switchbranch

help:
	@echo "Available commands:"
	@echo "  make commit m=\"message\"           - Stage all changes and commit"
	@echo "  make createbranch BRANCH=\"name\"   - Create and switch to a new branch"
	@echo "  make switchbranch BRANCH=\"name\"   - Switch to an existing branch"
	@echo "  make status                        - Show git status"
	@echo "  make push                          - Push to remote"

commit:
	@if [ -z "$(m)" ]; then \
		echo "Error: Commit message required"; \
		echo "Usage: make commit m=\"your commit message\""; \
		exit 1; \
	fi
	git add -A
	git commit -m "$(m)"

createbranch:
	@if [ -z "$(BRANCH)" ]; then \
		echo "Error: BRANCH variable is required"; \
		echo "Usage: make createbranch BRANCH=\"branch-name\""; \
		exit 1; \
	fi
	git checkout -b $(BRANCH)
	@echo "✓ Created and switched to branch: $(BRANCH)"

switchbranch:
	@if [ -z "$(BRANCH)" ]; then \
		echo "Error: BRANCH variable is required"; \
		echo "Usage: make switchbranch BRANCH=\"branch-name\""; \
		exit 1; \
	fi
	git checkout $(BRANCH)
	@echo "✓ Switched to branch: $(BRANCH)"

status:
	git status

push:
	git push origin HEAD

.DEFAULT_GOAL := help
