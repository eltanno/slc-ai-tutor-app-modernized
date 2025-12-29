---
id: FEAT-001
title: Comprehensive Code Linting and Pre-Commit Quality Checks
status: approved
created: 2025-12-25
updated: 2025-12-25
author: AI Agent
priority: high
---

# Feature: Comprehensive Code Linting and Pre-Commit Quality Checks

## Overview

Add automated code linting, formatting, and quality checks for Python, JavaScript/TypeScript, and CSS/SCSS with pre-commit hooks and pre-PR cleanup validation.

## Business Value

**Why this matters:**
- **Consistency**: All code follows uniform standards
- **Quality**: Catch issues before they reach PR review
- **Maintainability**: Clean, well-named code without dead code
- **Speed**: Automated checks reduce manual review time
- **Prevention**: Stop bad code from being committed

**Success Metrics:**
- 100% of commits pass linting
- Zero unused imports/variables in PRs
- Consistent code formatting across all files

## Requirements

### Functional Requirements

- [ ] Python linting with Ruff (modern, fast, comprehensive)
- [ ] JavaScript/TypeScript linting with ESLint
- [ ] CSS/SCSS linting with Stylelint
- [ ] Pre-commit hooks that block commits if linting fails
- [ ] Pre-PR cleanup script that finds unused code
- [ ] Auto-formatting on commit (optional fix mode)
- [ ] Integration with existing TDD workflow

### Non-Functional Requirements

- **Performance**: Linters must be fast (<5 seconds on typical files)
- **Reliability**: Pre-commit hooks must be reliable
- **Usability**: Clear error messages when linting fails
- **Maintainability**: Config files in version control

## Architecture

### High-Level Design

```
Developer writes code
    ↓
Saves file
    ↓
Git add/commit
    ↓
Pre-commit hook triggers
    ↓
Runs linters in parallel:
    - Ruff (Python)
    - ESLint (JS/TS)
    - Stylelint (CSS/SCSS)
    ↓
If PASS: Allow commit ✅
If FAIL: Auto-fix mode
    ↓
Auto-fix attempts:
    1. Run linters with --fix flag
    2. Re-run linters to check
    3. If still failing, try again (max 3 attempts)
    4. Run tests to ensure nothing broke
    ↓
If fixed AND tests pass: Allow commit ✅
If can't fix: Report errors, block commit ❌
    ↓
When ready for PR
    ↓
Agent runs cleanup check:
    - Find unused imports
    - Find unused variables
    - Find unused functions
    - Check naming conventions
    - Auto-fix all issues
    - Run tests again
    ↓
If clean AND tests pass: Create PR ✅
If issues remain: Report to user ❌
```

### Technology Choices

**Python Linting:**
- **Ruff** - Modern, extremely fast (10-100x faster than alternatives)
- Replaces: Flake8, isort, pyupgrade, autoflake
- All-in-one solution
- Why: Speed + comprehensive rules + auto-fix

**JavaScript/TypeScript:**
- **ESLint** - Industry standard
- With TypeScript ESLint plugin
- Prettier integration for formatting
- Why: Most widely adopted, great plugin ecosystem

**CSS/SCSS:**
- **Stylelint** - Standard for CSS linting
- Supports SCSS out of box
- Why: Purpose-built for stylesheets

**Pre-commit Framework:**
- **pre-commit** - Python-based hook manager
- Supports multiple languages
- Cached, fast execution
- Why: Industry standard, reliable

**Unused Code Detection:**
- **vulture** (Python) - Finds dead code
- **ESLint no-unused-vars** (JS/TS) - Built-in
- Custom script to aggregate results

## Implementation Tasks

### 1. Install and Configure Python Linting (Ruff)
- Add ruff to requirements.txt
- Create .ruff.toml configuration
- Configure rules: imports, naming, complexity, unused code
- Test on existing Python files

### 2. Install and Configure JavaScript/TypeScript Linting
- Create package.json with ESLint dependencies
- Create .eslintrc.json configuration
- Add TypeScript support
- Configure Prettier integration
- Test on JS/TS files (if any)

### 3. Install and Configure CSS/SCSS Linting
- Add Stylelint to package.json
- Create .stylelintrc.json configuration
- Configure SCSS support
- Test on CSS/SCSS files (if any)

### 4. Setup Pre-commit Hooks with Auto-Fix
- Add pre-commit to requirements.txt
- Create .pre-commit-config.yaml
- Configure hooks for all linters with --fix flags
- Create custom pre-commit script:
  - Run linters with auto-fix
  - Loop until pass or max attempts (3)
  - Run tests after each fix
  - Only allow commit if linting passes AND tests pass
- Install hooks in repository

### 5. Create Pre-PR Cleanup Script with Auto-Fix
- Create scripts/quality/pre_pr_check.py
- Integrate vulture for Python dead code
- Check ESLint unused vars for JS/TS
- Auto-fix all found issues
- Run tests after fixes
- Generate report of what was fixed
- If can't auto-fix, report to user
- Add to PR creation workflow

### 6. Update .cursorrules
- Add linting requirements to commit workflow
- Add pre-PR cleanup to PR workflow
- Add code quality standards (naming, simplicity)
- Emphasize blocking commits on lint failure

### 7. Update Documentation
- Add linting guide to docs/
- Update setup.sh to install pre-commit hooks
- Add troubleshooting guide

### 8. Update .gitignore
- Add linter cache directories
- Add node_modules/ for ESLint

## Test Strategy

### Unit Tests
- Test each linter config with sample files
- Verify pre-commit hooks block bad commits
- Test cleanup script finds unused code

### Integration Tests
- End-to-end: commit with linting errors (should auto-fix)
- End-to-end: commit with clean code (should pass immediately)
- End-to-end: commit with unfixable errors (should block with message)
- End-to-end: verify tests run after auto-fix
- End-to-end: PR creation runs cleanup check and auto-fixes

### Manual Testing Scenarios
1. Write Python with unused import → hook auto-fixes → tests run → commit succeeds
2. Write Python with syntax error → hook can't fix → commit blocked with message
3. Write JS with unused variable → hook auto-fixes → tests run → commit succeeds
4. Create PR with dead code → cleanup script auto-fixes → tests run → PR created
5. Create PR with unfixable issues → cleanup reports → waits for user

### Test Coverage Target
- Minimum 90% on cleanup script
- All linter configs validated
- Pre-commit hook reliability: 100%

## Dependencies

### Internal Dependencies
- Existing TDD workflow must remain intact
- Git workflow (feature branches) unchanged
- PR creation script integration

### External Dependencies
- Python 3.8+ (for Ruff and pre-commit)
- Node.js/npm (for ESLint, Stylelint) - NEW
- Git 2.0+ (for pre-commit hooks)

### Configuration Files to Create
- `.ruff.toml` - Python linting config
- `package.json` - JS dependencies
- `.eslintrc.json` - JS/TS linting config
- `.stylelintrc.json` - CSS/SCSS config
- `.pre-commit-config.yaml` - Hook configuration
- `scripts/quality/pre_pr_check.py` - Cleanup script

## Risks & Mitigation

| Risk | Impact | Likelihood | Mitigation Strategy |
|------|--------|------------|-------------------|
| Pre-commit hooks slow down commits | Medium | Low | Use fast linters (Ruff), cache results, max 3 auto-fix attempts |
| Auto-fix breaks code | High | Low | Run tests after every fix, block if tests fail |
| Infinite auto-fix loops | Medium | Low | Max 3 attempts, then report to user |
| Node.js dependency adds complexity | Medium | High | Document clearly, add to setup.sh |
| Existing code fails new linting | High | High | Run cleanup pass first, auto-fix all issues before enforcing |
| Tests are slow, blocking commits | High | Medium | Run only affected tests, optimize test suite |

## Code Quality Standards

### Naming Conventions
**Python:**
- Classes: `PascalCase`
- Functions/variables: `snake_case`
- Constants: `UPPER_SNAKE_CASE`
- Private: `_leading_underscore`

**JavaScript/TypeScript:**
- Classes: `PascalCase`
- Functions/variables: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- Private: `#privateField` or `_conventionPrivate`

**CSS/SCSS:**
- Classes: `kebab-case`
- IDs: `kebab-case`
- Variables (SCSS): `$kebab-case`

### Simplicity Rules
- Functions: Max 50 lines (warning at 30)
- Complexity: Max cyclomatic complexity of 10
- Nesting: Max 4 levels deep
- Parameters: Max 5 parameters per function
- Line length: 88 chars (Python), 100 chars (JS/TS)

### Dead Code Rules
- No unused imports
- No unused variables
- No unused functions
- No commented-out code blocks
- No unreachable code after return

## Linter Configuration Details

### Ruff Rules (Python)
```toml
[tool.ruff]
line-length = 88
target-version = "py38"

[tool.ruff.lint]
select = [
    "E",    # pycodestyle errors
    "W",    # pycodestyle warnings
    "F",    # pyflakes
    "I",    # isort
    "N",    # pep8-naming
    "UP",   # pyupgrade
    "B",    # flake8-bugbear
    "C4",   # flake8-comprehensions
    "SIM",  # flake8-simplify
    "TCH",  # flake8-type-checking
    "Q",    # flake8-quotes
]
ignore = []
```

### ESLint Rules (JS/TS)
```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ],
  "rules": {
    "no-unused-vars": "error",
    "no-console": "warn",
    "complexity": ["error", 10],
    "max-depth": ["error", 4],
    "max-lines-per-function": ["warn", 50]
  }
}
```

### Stylelint Rules (CSS/SCSS)
```json
{
  "extends": [
    "stylelint-config-standard-scss",
    "stylelint-config-prettier"
  ],
  "rules": {
    "selector-class-pattern": "^[a-z][a-z0-9-]*$",
    "max-nesting-depth": 4
  }
}
```

## Pre-PR Cleanup Workflow

```bash
# Agent runs before creating PR:
python scripts/quality/pre_pr_check.py --auto-fix

# Process:
# 1. Run vulture on changed Python files
# 2. Run ESLint with unused-vars on JS/TS files
# 3. Check for TODO comments (warn only)
# 4. Check for console.log (warn only)
# 5. Verify all imports are used
# 6. Check naming conventions

# Auto-fix:
# 1. Remove unused imports
# 2. Remove unused variables (if safe)
# 3. Remove unused functions (if private/internal)
# 4. Fix naming convention issues
# 5. Run tests after each fix
# 6. Revert if tests fail

# Output:
# ✅ Auto-fixed 3 issues, all tests pass - PR ready
#
# Fixed:
#   - file.py:10 - Removed unused variable 'x'
#   - file.ts:20 - Removed unused import 'Component'
#   - utils.py:15 - Renamed 'MyFunc' to 'my_func' (snake_case)
#
# OR
# ❌ Could not auto-fix:
#   - file.py:50 - Complex unused function 'process_data' (manual review needed)
#
# Agent: Reports issues to user, waits for manual fix
```

## Timeline Estimate

- Python linting setup: 1 hour
- JS/TS linting setup: 1 hour
- CSS/SCSS linting setup: 30 min
- Pre-commit hooks with auto-fix loop: 2 hours
- Pre-PR cleanup script with auto-fix: 3 hours
- Test integration and verification: 2 hours
- Testing and documentation: 2 hours
- **Total: ~11.5 hours**

## Open Questions

- [x] Should auto-fix be enabled on commit, or just report errors?
  - **ANSWER**: ✅ Auto-fix enabled, with test verification
- [x] Should we lint on git push as well as commit?
  - **ANSWER**: Only on commit (push would duplicate checks)
- [x] How strict should naming rules be initially?
  - **ANSWER**: ✅ Strict from the start
- [x] Should cleanup script auto-fix or just report?
  - **ANSWER**: ✅ Auto-fix with test verification, report only if can't fix
- [x] Max auto-fix attempts: 3 sufficient?
  - **ANSWER**: ✅ Yes, try 3 and adjust if needed
- [x] Run full test suite or only affected tests after auto-fix?
  - **ANSWER**: Full test suite for safety (can optimize later)

## References

- Ruff: https://docs.astral.sh/ruff/
- ESLint: https://eslint.org/
- Stylelint: https://stylelint.io/
- pre-commit: https://pre-commit.com/
- vulture: https://github.com/jendrikseipp/vulture

---

## Status History

| Date | Status | Notes |
|------|--------|-------|
| 2025-12-25 | draft | Initial plan created |
| 2025-12-25 | approved | User approved: auto-fix, strict rules, Node.js OK, cleanup first |
