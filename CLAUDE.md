# SLC AI Tutor App - Project Context

## Project Overview

SLC AI Tutor App - A modernized AI tutoring application.

- **Backend:** Python (FastAPI), located in `backend/`
- **Frontend:** React/TypeScript, located in `frontend/`
- **Docs:** `docs/`

## Development Environment

**Node.js version requirement:**

Before running ANY npm or node commands, ensure you're using Node 20:

```bash
nvm use 20
```

The frontend requires Node.js 20+ for Vite 7, Vitest 4, and coverage tools.

## Trello Integration

- **Board:** SLC AI Prototype
- **Board ID:** `687149109e5460f7837fa340`
- **URL:** https://trello.com/b/WlEuauOD/slc-ai-prototype

Use `mcp__trello__set_active_board` with the ID above at session start.

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

### GitHub ↔ Trello Workflow

When creating a **GitHub issue**:
1. Create a corresponding Trello card with the same title/description
2. Add a comment on the GitHub issue noting the Trello card link

When **working on a ticket**:
1. Move Trello card to **Doing** when starting work
2. Move to **Testing / Review** when testing or awaiting review
3. Move to **Done** when complete
