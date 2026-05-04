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

## PR Template Format

Always provide PR descriptions in a **markdown code block** for easy copy/paste.

**Standard structure:**
1. **Title** (short, under 70 chars) — describe the feature/fix
2. **Summary** (3-5 bullet points) — what changed and why
3. **Test Plan** (checkbox list) — steps to verify each feature works
4. **Files Changed** (with line numbers) — what was modified and where
5. **Version Info** (previous, current, type, breaking changes)
6. **Footer:** "🤖 Generated with Claude Code"

---



