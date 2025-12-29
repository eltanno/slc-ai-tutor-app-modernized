# Cursor Agent Handoff - {{PROJECT_NAME}} (Greenfield)

**Generated:** {{CURRENT_DATE}}
**Project:** {{PROJECT_DIR}}
**Type:** Greenfield (New Project)
**Phase:** {{PROJECT_PHASE}}

---

## 📋 Executive Summary

This is a **greenfield project** using the opinionated cursor_scaffold development workflow. All scaffolding has been set up, and the project is ready for feature development with:
- ✅ Test-Driven Development (TDD)
- ✅ Automated linting and formatting
- ✅ GitHub Kanban workflow
- ✅ Pre-commit hooks

**Current Status:** {{CURRENT_STATUS}}

---

## 🎯 Project Overview

### What We're Building
**Project Name:** {{PROJECT_NAME}}
**Description:** {{PROJECT_DESCRIPTION}}
**Purpose:** {{PROJECT_PURPOSE}}

### Tech Stack
{{TECH_STACK}}

### Architecture
{{ARCHITECTURE}}

---

## ✅ What Has Been Completed

### Initial Setup ✅
- ✅ Project scaffolding from cursor_scaffold
- ✅ Git repository initialized
- ✅ `.cursorrules` configured (opinionated workflow)
- ✅ Development tools installed

### Tooling Setup ✅
{{TOOLING_SETUP}}

### GitHub Integration {{GITHUB_STATUS}}
{{GITHUB_DETAILS}}

---

## 🔧 Current State

### Directory Structure
```
{{PROJECT_DIR}}/
{{DIRECTORY_STRUCTURE}}
```

### Git Status
- **Branch:** {{CURRENT_BRANCH}}
- **Remote:** {{GIT_REMOTE}}
- **Commits:** {{COMMIT_COUNT}}

### Environment Configuration
- **File:** `.env` ({{ENV_STATUS}})
- **Required Variables:**
{{REQUIRED_ENV_VARS}}

---

## 🚀 Next Steps (In Order)

### Step 1: Review Project Setup {{STEP_1_STATUS}}
**If not done yet:**
```bash
git status
# Review .cursorrules
# Review .env configuration
```

### Step 2: Create First Planning Document {{STEP_2_STATUS}}
**When ready to build first feature:**

1. **Create planning doc:**
   ```bash
   cp docs/planning/features/template.md docs/planning/features/FEAT-001-your-feature.md
   ```

2. **Fill in planning document:**
   - What are we building?
   - Why does it matter?
   - What are the requirements?
   - How will we test it?

3. **Get approval** before implementing

**See:** `.cursorrules` - Planning workflow section

---

### Step 3: Create GitHub Issues from Plan {{STEP_3_STATUS}}
**After plan is approved:**

```bash
source .venv/bin/activate
python scripts/github/create_tickets.py docs/planning/features/FEAT-001-your-feature.md
```

**What this does:**
- Creates GitHub Issues from planning doc
- Adds tickets to Backlog column
- You review and move to Ready column
- Agent starts work from Ready

---

### Step 4: Implement with TDD {{STEP_4_STATUS}}
**Agent workflow:**

1. **Pick ticket** from Ready column
2. **Create feature branch:** `git checkout -b feature/description`
3. **Write tests first** (RED phase)
4. **Implement code** (GREEN phase)
5. **Refactor** if needed
6. **Commit** (pre-commit hooks run automatically)
7. **Push and create PR**
8. **Move ticket to In Review**
9. **Wait for your approval**

**Test coverage minimum:** 90%

---

### Step 5: Review and Merge {{STEP_5_STATUS}}
**Your workflow:**

1. **Review PR** on GitHub
2. **Move ticket to In Testing** (if approved)
3. **Agent runs comprehensive tests**
4. **Agent moves to Done** (if pass) or **Test Failed** (if fail)
5. **Merge PR** when satisfied

---

## 📚 Key Documentation

### Primary Documents (Read These First)
1. **`.cursorrules`** - Complete development workflow
   - Planning vs Implementation modes
   - TDD workflow (Red-Green-Refactor)
   - Git workflow (feature branches, PRs)
   - GitHub Kanban integration
   - Code quality standards

2. **`docs/planning/features/template.md`**
   - Planning document template
   - Required sections
   - Examples

3. **`docs/planning/features/FEAT-002-multi-tier-architecture.md`**
   - Multi-tier project structure (if applicable)
   - Django + React + PostgreSQL default stack
   - Docker Compose setup

### Secondary Documents
- `README.md` - Project-specific documentation
- `docs/architecture/` - Architecture Decision Records (ADRs)
- `docs/api/` - API documentation (as developed)

---

## 🛠️ Available Scripts

### GitHub Automation
```bash
# Create GitHub repo and project
python scripts/github/create_repo_and_project.py \
  --name "{{SUGGESTED_REPO_NAME}}" \
  --description "{{PROJECT_DESCRIPTION}}" \
  --private \
  --init-git

# Create Pull Request
python scripts/github/create_pr.py "PR Title" "PR Description" {{DEFAULT_BRANCH}}

# Create tickets from planning doc
python scripts/github/create_tickets.py docs/planning/features/FEAT-XXX-name.md
```

### Quality Scripts
```bash
# Pre-PR cleanup (run before creating PR)
python scripts/quality/pre_pr_check.py

# Runs:
# - Vulture (dead code detection)
# - Ruff auto-fix (Python)
# - ESLint auto-fix (JS/TS)
# - Stylelint auto-fix (CSS/SCSS)
# - Full test suite
```

### Testing
```bash
# Run all tests
{{TEST_COMMAND}}

# Run with coverage
{{COVERAGE_COMMAND}}
```

---

## ⚙️ Environment & Tools

### Virtual Environment (Python Projects)
**ALWAYS activate before running Python commands:**
```bash
source .venv/bin/activate
```

**Installed packages:**
{{PYTHON_PACKAGES}}

### Pre-commit Hooks (Automatic)
Runs on every `git commit`:
- Ruff (Python linting + formatting)
- ESLint (JS/TS linting)
- Stylelint (CSS/SCSS linting)
- File checks (trailing whitespace, EOF, LF line endings)
- Bandit (Python security)

**Auto-fix loop:**
1. Run hooks on staged files
2. Apply auto-fixes if possible
3. Re-stage fixed files
4. Re-run hooks to verify
5. Repeat up to 3 times
6. Block commit if unfixable errors remain

**To bypass (use sparingly):**
```bash
git commit --no-verify -m "message"
```

### Linter Configurations
{{LINTER_CONFIGS}}

---

## 🎯 Development Workflow Rules

### Git Workflow (CRITICAL - NEVER BREAK)
1. **NEVER commit directly to main/master**
2. **ALWAYS create feature branch BEFORE making changes**
3. **ALWAYS run tests before committing** (pre-commit does this)
4. **ALWAYS create PR for review** (use `scripts/github/create_pr.py`)
5. **NEVER merge without user approval**

**Correct workflow:**
```bash
# 1. Create feature branch
git checkout -b feature/description

# 2. Make changes, write tests

# 3. Commit (pre-commit hooks run automatically)
git add .
git commit -m "feat: description"

# 4. Push feature branch
git push origin feature/description

# 5. Create PR
python scripts/github/create_pr.py "Title" "Description" {{DEFAULT_BRANCH}}

# 6. WAIT for user approval

# 7. User merges via GitHub UI
```

### TDD Workflow (Default for All Code)
1. **RED:** Write failing test
2. **GREEN:** Write minimal code to pass test
3. **REFACTOR:** Improve code quality
4. **Repeat:** For each new feature/function

**Test coverage minimum:** 90%

### GitHub Kanban Workflow
**Columns:** Backlog → Ready → In Progress → In Review → In Testing → Test Failed/Done

**Agent priorities:**
1. **HIGHEST:** Tickets in "In Testing" (test thoroughly)
2. **SECOND:** Tickets in "Ready" (start new work)

**Workflow:**
1. Agent checks Ready column
2. Verifies dependencies met
3. Moves ticket to In Progress
4. Creates feature branch
5. Implements with TDD
6. Commits and pushes
7. Creates PR and moves to In Review
8. User reviews and moves to In Testing
9. Agent tests thoroughly
10. Moves to Done (pass) or Test Failed (fail)

---

## 🔑 Important Context

### Stack Choices (Defaults)
{{USER_STACK_PREFERENCES}}

### Planning Philosophy
- **Planning first, code second**
- Always evaluate for best practices
- Identify reusable code/patterns
- Flag anti-patterns during planning
- Get user approval before implementation

### Code Quality Standards
- Type hints for all Python functions
- Docstrings for all public APIs (Google style)
- No unused code (Vulture enforced)
- Consistent formatting (auto-fixed)
- 90%+ test coverage
- No linter errors (blocks commit)

---

## 🚨 Common Pitfalls to Avoid

### ❌ DON'T:
- Commit directly to main/master
- Make changes while on main branch
- Commit if tests are failing
- Merge PRs without user approval
- Write code without tests
- Skip planning phase
- Ignore best practices without discussion
- Run Python commands without activating .venv
- Push to main branch (always push feature branches)

### ✅ DO:
- Create feature branch BEFORE any changes
- Write tests FIRST (TDD)
- Run tests after EVERY change
- Make small, incremental changes
- Commit frequently
- Activate .venv for all Python commands
- Create PRs for all work
- Move tickets through proper Kanban columns
- Ask for clarification when unclear

---

## 📞 Support & References

### Template Source
- **Location:** `{{SCAFFOLD_PATH}}`
- **GitHub:** {{SCAFFOLD_GITHUB_URL}}
- **Purpose:** Reusable scaffolding for all projects

### User Information
{{USER_INFO}}

### GitHub URLs
{{GITHUB_URLS}}

---

## 🎯 Immediate Action Items

**When you start in this workspace, do this:**

1. **Read this handoff document** ✅ (you're doing it!)

2. **Verify environment setup:**
   ```bash
   git status
   cat .env  # Check configuration
   source .venv/bin/activate  # If Python project
   ```

3. **Review existing work:**
   ```bash
   # Check what's been built so far
   git log --oneline
   ls -la src/  # or backend/ frontend/ depending on structure
   ```

4. **Check GitHub Kanban:**
   ```bash
   # If repo/project created, check for tickets
   # URL: {{KANBAN_URL}}
   ```

5. **Ready to build?**
   - If no planning doc exists: Create one
   - If planning doc exists: Create tickets
   - If tickets exist: Start from Ready column

---

## 💡 Tips for Agents

### When User Says...
- **"Plan [feature]"** → Create planning doc, NO code, evaluate best practices
- **"Implement [feature]"** → Check for plan, create tickets if needed, follow TDD
- **"Create PR"** → Use `scripts/github/create_pr.py`, link to issue, wait for approval

### Before Every Commit
- [ ] All tests passing
- [ ] Feature branch (not main)
- [ ] Test coverage meets 90%
- [ ] Linters will auto-fix on commit

### Before Every PR
- [ ] All tests passing
- [ ] Coverage report generated
- [ ] Dead code removed (Vulture)
- [ ] Linters pass
- [ ] PR description complete

### When Stuck
1. Read `.cursorrules` (search for relevant section)
2. Read planning docs (`docs/planning/features/`)
3. Check handoff document (this file)
4. Ask user for clarification

---

## 📈 Success Metrics

**You'll know development is going well when:**
- ✅ All code has automated tests (90%+ coverage)
- ✅ Linters pass on every commit (auto-fixed)
- ✅ Pre-commit hooks catch issues before they're committed
- ✅ Every change goes through PR review
- ✅ GitHub Kanban tracks all work
- ✅ Code is simple, well-named, and documented
- ✅ No unused code
- ✅ Features are planned before implementation
- ✅ Best practices followed consistently

---

## 🎉 Ready to Build!

**Current Phase:** {{PROJECT_PHASE}}
**Next Phase:** {{NEXT_PHASE}}
**Status:** {{CURRENT_STATUS}}

**Good luck, Agent!** You have everything you need to build this project with best practices, comprehensive testing, and clean code. Follow the rules, write the tests, and keep the user informed. 🚀

---

*This document was auto-generated by cursor_scaffold setup*
*Template version: 1.0*
*Generated: {{CURRENT_DATE}}*
