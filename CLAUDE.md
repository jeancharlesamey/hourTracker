# Project Instructions - Hour Tracker

## Git Operations - COMPLETELY DISABLED

**Claude must NOT execute ANY git commands on this project. None.**

Forbidden:
- No `git add`, `git commit`, `git push`
- No `git status`, `git log`, `git diff`
- No `git branch`, `git checkout`, `git merge`
- No `git reset`, `git rebase`, `git pull`
- No `git` command whatsoever, in any form

User handles all git operations exclusively.

## General Workflow

- Review code and suggest changes
- Propose Plan Mode for heavy need reflexion and implementation on multipe files
- Ask user for confirmation before making file modifications
- Provide clear explanations of what's being changed and why

## Task Data Structure

Each task object contains:
- `name` — task name
- `color` — task color identifier
- `estimate` — estimated workload (days)
- `deliveryDate` — delivery date (YYYY-MM-DD format)
- `jiraLink` — Jira link URL
- `status` — task status (Soon/inProgress/inPause/done/checking/archived)
- **`idOpus`** — **Opus ID** (external ID reference, displayed as "ID" in the UI)

**IMPORTANT:** The "ID" field in the task editing form is `idOpus` — it stores the Claude Opus ID (or other external ID) associated with the task. This is NOT a database identifier for the task itself.

