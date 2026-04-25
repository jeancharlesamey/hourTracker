.PHONY: commit status push help createbranch switchbranch

help:
	@echo "Available commands:"
	@echo "  make commit MSG=\"message\"         - Stage all changes and commit with message"
	@echo "  make createbranch BRANCH=\"name\"   - Create and switch to a new branch"
	@echo "  make switchbranch BRANCH=\"name\"   - Switch to an existing branch"
	@echo "  make status                        - Show git status"
	@echo "  make push                          - Push to remote"

commit:
	@if [ -z "$(MSG)" ]; then \
		echo "Error: MSG variable is required"; \
		echo "Usage: make commit MSG=\"your commit message\""; \
		exit 1; \
	fi
	git add -A
	git commit -m "$(MSG)"

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
	git push

.DEFAULT_GOAL := help
