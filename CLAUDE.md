# Claude Code Project Context

## CRITICAL: Workflow Discipline

**STOP. PLAN. THEN ACT.**

Before writing ANY code or making ANY changes:

### 1. Plan First (MANDATORY)

**Before installing dependencies, writing code, or creating branches:**

1. **Research the codebase** - understand existing patterns and structure
2. **Write up a comprehensive plan** - present it to the user for review
3. **Create ALL tickets upfront** - break work into logical issues with clear scope
4. **Get user approval** - only proceed after the plan is approved

**What a plan should include:**
- Summary of what we're building
- List of all tickets/issues to create (with descriptions)
- Technical approach and key decisions
- Test strategy
- Any risks or open questions

**Use `/plan` mode** for non-trivial work. This enforces the planning workflow.

**Never:**
- Install dependencies before planning
- Create a single "umbrella" issue and figure it out as you go
- Start coding before the user has seen and approved the plan

### 2. Follow the Issue → PR Workflow (NO EXCEPTIONS)
1. **Create GitHub issue** - describe what will be done
2. **Create Trello card** - link to GitHub issue, apply Green label
3. **Create feature branch** - `feature/issue-{number}-{description}`
4. **Move Trello card to Doing**
5. **Write code** - only now
6. **Commit** - ensure linting passes BEFORE committing
7. **Push and create PR**
8. **Move Trello card to Testing/Review**
9. **Merge only after review**
10. **Move Trello card to Done**

### 3. Never Do These Things
- Never start work without a written plan approved by the user
- Never install dependencies before planning
- Never commit directly to main
- Never write code before creating an issue
- Never create a PR without a linked issue
- Never skip the Trello sync
- Never rush - methodical is faster than fixing mistakes

### 4. If You Made a Mistake
- Stop immediately
- Acknowledge the mistake clearly
- Propose a fix
- Ask the user before proceeding

---

## Trello Integration

- **Board:** SLC AI Prototype
- **Board ID:** `687149109e5460f7837fa340`
- **URL:** https://trello.com/b/WlEuauOD/slc-ai-prototype

When working with Trello, use `mcp__trello__set_active_board` with the ID above at session start.

### Board Lists

| List | ID | Purpose |
|------|----|---------|
| Backlog | `687149177e5aee9135505771` | Future work |
| To-Do | `687149109e5460f7837fa33d` | Ready to start |
| Blocked | `6871492c8c734df3018b74c1` | Waiting on something |
| Doing | `687149109e5460f7837fa33e` | In progress |
| Testing / Review | `687149426e1fec1a2d441c3a` | Being tested or reviewed |
| Done | `687149109e5460f7837fa33f` | Completed |

### Board Labels

| Label | ID | Use |
|-------|----|----|
| App Development (Green) | `687149109e5460f7837fa3eb` | All dev work |

### GitHub <-> Trello Workflow

When creating a **GitHub issue**:
1. Create a corresponding Trello card with the same title/description
2. Add a comment on the GitHub issue noting the Trello card link

When **working on a ticket**:
1. Move Trello card to **Doing** when starting work
2. Move to **Testing / Review** when testing or awaiting review
3. Move to **Done** when complete

GitHub has fewer states than Trello - use Trello for granular progress tracking.

## Project Overview

SLC AI Tutor App - A modernized AI tutoring application.

- **Backend:** Python (FastAPI), located in `backend/`
- **Frontend:** Located in `frontend/`
- **Docs:** `docs/`

## Development Environment

**IMPORTANT: Node.js version requirement**

Before running ANY npm or node commands, ensure you're using Node 20:

```bash
nvm use 20
```

The frontend requires Node.js 20+ for Vite 7, Vitest 4, and coverage tools to work correctly.
