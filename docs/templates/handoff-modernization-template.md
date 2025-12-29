# Cursor Agent Handoff - {{PROJECT_NAME}} Modernization

**Generated:** {{CURRENT_DATE}}
**Project:** {{PROJECT_DIR}}
**Phase:** Template Import Complete - Ready for Repo Creation
**Previous Workspace:** {{PREVIOUS_WORKSPACE}}

---

## 📋 Executive Summary

This is a **legacy code modernization project** for {{PROJECT_NAME}}. The template scaffolding has been successfully imported, and the project is ready for:
1. GitHub repository creation
2. Codebase assessment
3. Characterization testing
4. Systematic refactoring

**Current Status:** ✅ Template imported, awaiting .env configuration

---

## 🎯 Project Context

### What This Is
- **Original Project:** {{ORIGINAL_PROJECT_PATH}} (legacy, untouched)
- **Modernization Copy:** {{PROJECT_PATH}} (current workspace)
- **Template Source:** {{SCAFFOLD_PATH}} (opinionated development scaffolding)

### Tech Stack
{{TECH_STACK}}

### Architecture
{{ARCHITECTURE}}

### Why Modernizing
{{WHY_MODERNIZING}}

---

## ✅ What Has Been Completed

### Phase 1: Project Copy ✅
- Copied legacy project to new directory using rsync
- Excluded runtime artifacts {{EXCLUDED_ARTIFACTS}}
- Excluded old .git repository (fresh start)
- Preserved all source code, configs, and documentation

**Command used:**
```bash
{{RSYNC_COMMAND}}
```

### Phase 2: Template Import ✅
Ran: `{{SCAFFOLD_PATH}}/scripts/modernize/import_template.sh`

**What was imported:**
- ✅ `.cursorrules` - Opinionated development rules for AI agents
- ✅ `scripts/github/` - GitHub API automation (PR creation, issue management)
- ✅ `scripts/quality/` - Pre-PR cleanup, linting, dead code detection
- ✅ `scripts/utils/` - GitHub API wrapper
- ✅ `scripts/modernize/` - Modernization scripts (assess, plan, refactor)
- ✅ `docs/planning/` - Planning document templates and guidelines
- ✅ `docs/modernization/` - Assessment, characterization tests, refactor plan templates
- ✅ `.gitignore` - Merged with existing (added tmp/, linter caches, etc.)
- ✅ `.gitattributes` - Enforces LF line endings
- ✅ `.pre-commit-config.yaml` - Automated linting on commit (Ruff, ESLint, Stylelint)
- ✅ `.venv` - Python virtual environment with tools installed
- ✅ Pre-commit hooks installed

**Analysis Results:**
{{ANALYSIS_RESULTS}}

**Import report:** `tmp/import-report-{{TIMESTAMP}}.md`

---

## 🔧 Current State

### Git Status
- **Branch:** {{CURRENT_BRANCH}} (initialized, no commits yet)
- **Status:** All files untracked (ready for initial commit)

### Environment Configuration
- **File:** `.env` (created from template)
- **Status:** ⚠️ **NEEDS YOUR INPUT**

**What needs to be added to .env:**
1. `GITHUB_API_KEY={{GITHUB_TOKEN}}` (user has this token)
2. Leave as placeholders (auto-filled by script):
   - `GITHUB_OWNER=your_github_username`
   - `GITHUB_REPO=your_repository_name`
   - `GITHUB_PROJECT_NUMBER=1`
3. Copy application secrets from old `.env` if needed for testing:
   {{APPLICATION_SECRETS}}
   - (Located in: `{{ORIGINAL_PROJECT_PATH}}/.env`)

### Virtual Environment
- **Location:** `.venv/` (already created and set up)
- **Activation:** `source .venv/bin/activate`
- **Tools installed:** pytest, ruff, pre-commit, vulture, bandit

---

## 🚀 Next Steps (In Order)

### Step 1: Update .env File ⏳ IN PROGRESS
**Action needed from user:**
```bash
nano .env  # or code .env
```

Add:
- Line 8: `GITHUB_API_KEY={{GITHUB_TOKEN}}`
- Optionally copy other secrets from old project

**DO NOT** change these (script will auto-fill):
- `GITHUB_OWNER`
- `GITHUB_REPO`
- `GITHUB_PROJECT_NUMBER`

---

### Step 2: Commit Template Import 🔜 NEXT
Once .env is ready:

```bash
git add .
git commit -m "chore: import modernization template"
```

**Note:** Pre-commit hooks will run automatically (may take 30-60 seconds):
- Ruff (Python linting)
- ESLint (JS/TS linting)
- Stylelint (CSS/SCSS linting)
- File checks (trailing whitespace, EOF, line endings)
- Security checks (Bandit)

If hooks fail, they'll auto-fix most issues and re-run (max 3 attempts).

---

### Step 3: Create GitHub Repository & Project 🔜 READY
Run the automated setup script:

```bash
source .venv/bin/activate
python scripts/github/create_repo_and_project.py \
  --name "{{SUGGESTED_REPO_NAME}}" \
  --description "{{SUGGESTED_REPO_DESCRIPTION}}" \
  --private \
  --init-git
```

**What this does:**
1. Creates GitHub repository: `{{GITHUB_OWNER}}/{{SUGGESTED_REPO_NAME}}`
2. Creates GitHub Project with Kanban board
3. Adds columns: Backlog, Ready, In Progress, In Review, In Testing, Test Failed, Done
4. Initializes local git (or updates existing)
5. Adds remote origin
6. **Auto-updates .env** with:
   - `GITHUB_OWNER={{GITHUB_OWNER}}`
   - `GITHUB_REPO={{SUGGESTED_REPO_NAME}}`
   - `GITHUB_PROJECT_NUMBER=<generated>`

**After script completes:**
```bash
git push -u origin {{DEFAULT_BRANCH}}
```

---

### Step 4: Run Codebase Assessment 🔜 READY
Analyze the legacy codebase:

```bash
source .venv/bin/activate
python scripts/modernize/assess_codebase.py
```

**What this does:**
- Detects languages, frameworks, dependencies
- Analyzes cyclomatic complexity
- Identifies large files (>500 lines)
- Finds TODO/FIXME comments
- Checks for test coverage
- Generates comprehensive report

**Output:** `docs/modernization/assessment.md`

**Review the assessment:**
```bash
cat docs/modernization/assessment.md
```

---

### Step 5: Plan Refactoring 🔜 AFTER ASSESSMENT
Based on assessment, create refactoring plan:

1. **Review findings** in `docs/modernization/assessment.md`
2. **Identify priorities:**
   - Critical complexity hotspots
   - Missing test coverage
   - Security vulnerabilities
   - Performance bottlenecks
3. **Document plan** in `docs/modernization/refactor-plan.md`
4. **Create GitHub Issues** from plan:
   ```bash
   python scripts/modernize/create_refactor_issues.py docs/modernization/refactor-plan.md
   ```

---

### Step 6: Write Characterization Tests 🔜 AFTER PLANNING
**CRITICAL:** Before any refactoring, lock down current behavior:

1. **Identify critical paths** (auth, data flow, API endpoints)
2. **Write characterization tests** (document ACTUAL behavior, not ideal)
3. **Track progress** in `docs/modernization/characterization-tests.md`
4. **Target:** 80%+ coverage of code being refactored

**Example characterization test:**
```python
def test_{{EXAMPLE_FUNCTION}}_current_behavior():
    """
    CHARACTERIZATION TEST - Documents existing behavior.

    Current: {{EXAMPLE_BUG}} (bug)
    TODO: Fix in refactor phase (see issue #XX)
    """
    result = {{EXAMPLE_FUNCTION}}({{EXAMPLE_INPUT}})

    # Test CURRENT behavior (even though it's wrong)
    assert result == {{EXAMPLE_OUTPUT}}  # Bug: should be {{EXPECTED_OUTPUT}}
```

**See:** `docs/planning/features/FEAT-003-legacy-code-modernization.md` for details

---

### Step 7: Refactor Safely 🔜 AFTER CHARACTERIZATION TESTS
Follow strict TDD workflow:

1. **Pick one issue** from Ready column (GitHub Kanban)
2. **Create feature branch:** `git checkout -b refactor/issue-name`
3. **Make small, incremental changes**
4. **Run characterization tests after EVERY change**
5. **Commit frequently:** `git commit -m "refactor: extract method"`
6. **If tests fail:** Revert and try smaller change
7. **When complete:**
   - All characterization tests pass ✅
   - New unit tests added ✅
   - Linters pass ✅
   - Push and create PR
8. **Manual smoke test** before merging

**Agent checklist before each change:**
- [ ] Characterization tests exist for this code (>80% coverage)
- [ ] All tests currently passing
- [ ] Feature branch created
- [ ] Change is small and focused
- [ ] Tests will run after this change

---

## 📚 Key Documentation

### Primary Documents (Read These)
1. **`.cursorrules`** - Complete development workflow rules
   - Planning vs Implementation modes
   - TDD workflow (Red-Green-Refactor)
   - Git workflow (feature branches, PRs)
   - GitHub Kanban integration
   - Legacy Code Modernization section (lines 800+)

2. **`docs/planning/features/FEAT-003-legacy-code-modernization.md`**
   - Complete 5-phase modernization workflow
   - Characterization testing guide
   - Refactoring patterns
   - Agent checklists

3. **`docs/planning/features/FEAT-002-multi-tier-architecture.md`**
   - Monorepo structure for Django + React + PostgreSQL
   - Testing strategy (unit always, E2E feature-dependent)
   - Docker Compose setup

### Secondary Documents (Reference As Needed)
- `tmp/import-report-{{TIMESTAMP}}.md` - Template import summary
- `docs/modernization/assessment.md` - Codebase analysis (generated in Step 4)
- `docs/modernization/characterization-tests.md` - Test tracking template
- `docs/modernization/refactor-plan.md` - Refactor planning template

---

## 🛠️ Available Scripts

### GitHub Automation
```bash
# Create GitHub repo and project (run in Step 3)
python scripts/github/create_repo_and_project.py --name "repo-name" --description "..." --private --init-git

# Create Pull Request
python scripts/github/create_pr.py "PR Title" "PR Description" {{DEFAULT_BRANCH}}

# Move issue to column (used by agents)
# See scripts/utils/github_api.py for API wrapper
```

### Modernization Scripts
```bash
# Assess codebase (run in Step 4)
python scripts/modernize/assess_codebase.py

# Create refactor issues from plan (run in Step 5)
python scripts/modernize/create_refactor_issues.py docs/modernization/refactor-plan.md

# Import template into another project
{{SCAFFOLD_PATH}}/scripts/modernize/import_template.sh
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

---

## ⚙️ Environment & Tools

### Python Virtual Environment
**ALWAYS activate before running Python commands:**
```bash
source .venv/bin/activate
```

**Installed packages:**
- `pytest` - Testing framework
- `pytest-cov` - Coverage reporting
- `ruff` - Python linter & formatter
- `pre-commit` - Git hook framework
- `vulture` - Dead code detection
- `bandit` - Security linter

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
- **Python:** `ruff.toml` (88 char lines, single quotes, 40+ rule sets)
- **JavaScript/TypeScript:** `.eslintrc.js` (Airbnb style, 100 char lines)
- **CSS/SCSS:** `.stylelintrc.json` (standard config, no IDs, max 4 nesting)

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

### TDD Workflow (Default for All New Code)
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

### Stack Choices (User Preferences)
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

### Legacy Modernization Philosophy
**Key principle:** Lock down current behavior BEFORE refactoring

1. **Characterization tests document ACTUAL behavior** (bugs and all)
2. **Small, incremental refactors** (one change at a time)
3. **Tests must always pass** (no "I'll fix later")
4. **Commit frequently** (every logical step)
5. **No behavior changes during refactoring** (fix bugs in separate PRs)

---

## 🚨 Common Pitfalls to Avoid

### ❌ DON'T:
- Commit directly to main/master
- Make changes while on main branch
- Commit if tests are failing
- Merge PRs without user approval
- Refactor without characterization tests
- Make multiple changes in one commit
- Fix bugs during refactoring (separate PR)
- Skip manual smoke testing
- Run Python commands without activating .venv
- Push to main branch (always push feature branches)

### ✅ DO:
- Create feature branch BEFORE any changes
- Run tests after EVERY change
- Make small, incremental changes
- Commit frequently
- Document unexpected behavior
- Verify no behavior change
- Activate .venv for all Python commands
- Create PRs for all work
- Move tickets through proper Kanban columns

---

## 📞 Support & References

### Template Source
- **Location:** `{{SCAFFOLD_PATH}}`
- **GitHub:** {{SCAFFOLD_GITHUB_URL}}
- **Purpose:** Reusable scaffolding for all new/legacy projects

### User Information
{{USER_INFO}}

### GitHub URLs
{{GITHUB_URLS}}

---

## 🎯 Immediate Action Items

**When you start in this workspace, do this:**

1. **Read this handoff document** ✅ (you're doing it!)
2. **Wait for user to update .env** with GitHub API key
3. **Commit template import:**
   ```bash
   git add .
   git commit -m "chore: import modernization template"
   ```
4. **Create GitHub repo and project:**
   ```bash
   source .venv/bin/activate
   python scripts/github/create_repo_and_project.py \
     --name "{{SUGGESTED_REPO_NAME}}" \
     --description "{{SUGGESTED_REPO_DESCRIPTION}}" \
     --private \
     --init-git
   ```
5. **Push initial commit:**
   ```bash
   git push -u origin {{DEFAULT_BRANCH}}
   ```
6. **Run codebase assessment:**
   ```bash
   python scripts/modernize/assess_codebase.py
   ```
7. **Review assessment and plan next steps**

---

## 💡 Tips for Agents

### When User Says...
- **"Plan"** → Provide detailed plan, NO code, evaluate best practices
- **"Implement"** → Check current branch, create feature branch if on main, follow TDD
- **"Create PR"** → Use `scripts/github/create_pr.py`, link to issue, wait for approval

### Before Every Commit
- [ ] All tests passing
- [ ] Feature branch (not main)
- [ ] Linters will auto-fix on commit

### Before Every Refactor
- [ ] Characterization tests exist (>80% coverage)
- [ ] All tests currently passing
- [ ] Change is small and focused

### When Stuck
1. Read `.cursorrules` (search for relevant section)
2. Read planning docs (`docs/planning/features/`)
3. Check handoff document (this file)
4. Ask user for clarification

---

## 📈 Success Metrics

**You'll know modernization is succeeding when:**
- ✅ All code has automated tests (90%+ coverage)
- ✅ Linters pass on every commit (auto-fixed)
- ✅ Pre-commit hooks catch issues before they're committed
- ✅ Every change goes through PR review
- ✅ GitHub Kanban tracks all work
- ✅ Characterization tests prove behavior hasn't changed
- ✅ Code is simple, well-named, and documented
- ✅ No unused code remains
- ✅ Complexity is reduced
- ✅ Technical debt is systematically eliminated

---

## 🎉 Ready to Modernize!

**Current Phase:** Template Import Complete
**Next Phase:** GitHub Setup + Assessment
**Status:** ⏳ Waiting for .env update

**Good luck, Agent!** You have everything you need to modernize this codebase safely and systematically. Follow the rules, run the tests, and keep the user informed. 🚀

---

*This document was auto-generated by import_template.sh*
*Template version: 1.0*
*Generated: {{CURRENT_DATE}}*
