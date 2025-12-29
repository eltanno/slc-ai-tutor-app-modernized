---
id: FEAT-003
title: Legacy Code Modernization Workflow
status: draft
created: 2025-12-26
updated: 2025-12-26
author: AI Agent
priority: high
type: architecture
---

# Legacy Code Modernization Workflow

## Overview

Define a comprehensive, agent-assisted workflow for modernizing legacy codebases by importing the cursor-test template scaffolding and safely refactoring existing code while preserving all current behavior.

**Key Principle:** Never break existing functionality. Characterization tests lock down current behavior before any refactoring begins.

## Business Value

- **Risk Mitigation**: Safe modernization with comprehensive testing
- **Incremental Progress**: Small, verifiable improvements over big-bang rewrites
- **Preservation**: Existing functionality guaranteed to work
- **Quality**: Bring legacy code up to modern standards (testing, linting, documentation)
- **Efficiency**: Agent-assisted analysis and refactoring
- **Knowledge Transfer**: Documentation and tests capture how the system works

## Requirements

### Functional Requirements

1. **Import Template Scaffolding**
   - Script to analyze legacy project
   - Import `.cursorrules`, scripts, tooling
   - Merge with existing files (don't overwrite)
   - Initialize template workflow (planning, TDD, linting)

2. **Codebase Analysis**
   - Agent reviews entire codebase
   - Generate comprehensive assessment report
   - Identify functionality, architecture, dependencies
   - Detect test coverage gaps
   - Flag refactor opportunities and risks

3. **Characterization Testing**
   - Write tests that prove current behavior
   - Cover critical paths first
   - Pin down edge cases and quirks
   - Create safety net before refactoring

4. **Refactor Planning**
   - Break modernization into discrete tasks
   - Prioritize by risk and value
   - Create GitHub Issues for each task
   - Define clear acceptance criteria

5. **Safe Refactoring Workflow**
   - Characterization tests must always pass
   - Small, incremental changes
   - Each PR maintains existing behavior
   - Agent validates before and after

### Non-Functional Requirements

1. **Safety**: Zero regression in existing functionality
2. **Reversibility**: Easy rollback if issues arise
3. **Transparency**: Clear documentation of all changes
4. **Traceability**: Link refactors to assessment findings
5. **Gradual**: No big-bang rewrites
6. **Maintainability**: Leave code better than found

## The Legacy Code Challenge

### What Makes Legacy Code Hard

1. **No Tests**: Can't verify behavior
2. **Unknown Dependencies**: Hidden coupling
3. **Undocumented**: How does it work?
4. **Organic Growth**: No clear architecture
5. **Fear of Change**: Breaking production
6. **Technical Debt**: Accumulated shortcuts

### Why Traditional TDD Doesn't Work

**Greenfield TDD**: Write test → Implement → Refactor
**Legacy Code**: Implement exists → Must write tests around it → Then refactor

**The Problem**: You can't write tests for code not designed for testing.

### The Solution: Characterization Tests

**Characterization Tests** (Michael Feathers, "Working Effectively with Legacy Code"):
- Tests that describe what the system *actually does*
- Not what it *should* do (that comes later)
- Pin down current behavior (bugs and all)
- Create safety net for refactoring

**Process**:
1. Find a seam (place to insert test)
2. Run test with dummy assertion (it fails)
3. Read actual output
4. Update test to expect actual output
5. Test now passes (behavior locked down)
6. Repeat for all behaviors

## Proposed Workflow

### Phase 1: Import Template Scaffolding

**Script**: `scripts/modernize/import_template.sh`

**Usage**:
```bash
cd /path/to/legacy-project
/path/to/cursor-test/scripts/modernize/import_template.sh
```

**What It Does**:

1. **Analyze Legacy Project**
   - Detect language(s): Python, JavaScript, TypeScript, Go, etc.
   - Detect framework: Django, Flask, React, Express, etc.
   - Detect structure: monolith, multi-tier, library, CLI
   - Check for existing tests, linters, CI/CD

2. **Import Template Files** (Non-Destructive)
   - **Copy (if missing)**:
     - `.cursorrules` (with legacy mode guidance)
     - `scripts/` directory (GitHub API, quality checks, modernization)
     - `docs/` directory (planning, guides, architecture)
     - `.gitignore` additions (merge with existing)
     - `.gitattributes` (LF line endings)
     - `.env.example` (template for project vars)

   - **Merge (if exists)**:
     - `.gitignore`: Append template entries
     - `README.md`: Add template sections
     - `.pre-commit-config.yaml`: Merge hooks

   - **Skip (never overwrite)**:
     - Existing source code
     - Existing tests
     - Project-specific configs
     - `.env` (actual secrets)

3. **Setup Tooling**
   - Create Python virtual environment (`.venv`)
   - Install linters (Ruff, ESLint, Stylelint based on detected languages)
   - Install pre-commit hooks
   - Install testing frameworks (pytest, Jest, etc.)

4. **Create Initial Structure**
   - `docs/modernization/` directory
   - `docs/modernization/assessment.md` (initial template)
   - `docs/modernization/characterization-tests.md` (tracking)
   - `docs/modernization/refactor-plan.md` (planning template)
   - `tmp/` directory for temporary files

5. **Initialize Git Workflow**
   - Create feature branch: `feature/modernization-init`
   - Commit template imports
   - Create PR for user review

6. **Generate Import Report**
   - What was imported
   - What was merged
   - What was skipped
   - Next steps for user

**Script Output**:
```
🔍 Analyzing legacy project...
   Language: Python 3.9
   Framework: Django 3.2
   Structure: Multi-tier (monolithic)
   Tests: 12 files found (pytest)
   Linters: None detected
   CI/CD: None detected

📦 Importing template scaffolding...
   ✅ Copied .cursorrules
   ✅ Copied scripts/ directory
   ✅ Copied docs/ directory
   ✅ Merged .gitignore (added 45 entries)
   ✅ Created .gitattributes
   ✅ Copied .env.example
   ⏭️  Skipped .env (already exists)
   ✅ Merged .pre-commit-config.yaml

🔧 Setting up tooling...
   ✅ Created .venv
   ✅ Installed ruff (Python linter)
   ✅ Installed pre-commit hooks
   ✅ Installed pytest-cov (coverage)

📁 Created modernization structure...
   ✅ docs/modernization/
   ✅ docs/modernization/assessment.md
   ✅ docs/modernization/characterization-tests.md
   ✅ docs/modernization/refactor-plan.md

🎉 Template scaffolding imported successfully!

📋 Next Steps:
   1. Review changes: git diff
   2. Commit template: git add . && git commit -m "chore: import modernization template"
   3. Run assessment: python scripts/modernize/assess_codebase.py
   4. Review assessment: docs/modernization/assessment.md
   5. Begin characterization tests

🚀 Ready to modernize your legacy codebase!
```

### Phase 2: Codebase Analysis & Assessment

**Script**: `scripts/modernize/assess_codebase.py`

**What It Does**:

1. **Functionality Inventory**
   - List all modules, classes, functions
   - Identify entry points (main, CLI, API endpoints)
   - Map user-facing features
   - Detect critical paths

2. **Architecture Analysis**
   - Dependency graph (what imports what)
   - Identify layers (if any)
   - Find circular dependencies
   - Detect coupling hotspots

3. **Code Quality Metrics**
   - Cyclomatic complexity per function
   - Code duplication detection
   - Dead code detection
   - Linting violations (run linters)

4. **Test Coverage Analysis**
   - Existing test count
   - Line coverage percentage
   - Untested modules
   - Critical paths without tests

5. **Dependency Analysis**
   - External dependencies (requirements.txt, package.json)
   - Outdated dependencies
   - Security vulnerabilities (Bandit, npm audit)
   - Unused dependencies

6. **Technical Debt Assessment**
   - TODO/FIXME comments
   - Hardcoded values
   - Configuration issues
   - Missing documentation

7. **Risk Identification**
   - Modules with no tests and high complexity
   - Large files (>500 lines)
   - Functions with >10 parameters
   - Global state and singletons
   - Database migrations issues

**Output**: `docs/modernization/assessment.md`

```markdown
# Legacy Codebase Assessment

Generated: 2025-12-26

## Executive Summary

- **Total Lines**: 15,234
- **Languages**: Python (98%), JavaScript (2%)
- **Test Coverage**: 23%
- **Linting Issues**: 1,247
- **Security Issues**: 3 high, 12 medium
- **Refactor Priority**: High

## Functionality Inventory

### Core Features
1. User authentication (login, logout, registration)
2. Product catalog (CRUD operations)
3. Shopping cart
4. Order processing
5. Admin dashboard

### Entry Points
- `manage.py runserver` (Django)
- `manage.py process_orders` (management command)
- Celery tasks (background jobs)

## Architecture

### Current Structure
```
legacy-project/
├── app/
│   ├── models.py (1,234 lines - RISK!)
│   ├── views.py (987 lines - RISK!)
│   └── utils.py (543 lines)
├── static/
└── templates/
```

### Issues
- ❌ Monolithic models.py (should be split)
- ❌ Fat views (business logic mixed with presentation)
- ❌ No service layer
- ❌ No API layer (views return HTML only)

### Dependencies
- 23 circular dependencies detected
- High coupling in `app.models` and `app.views`

## Test Coverage

### Current State
- **Unit Tests**: 12 files, 87 tests
- **Integration Tests**: 0
- **E2E Tests**: 0
- **Coverage**: 23%

### Gaps
- ❌ No tests for `app.views.checkout` (CRITICAL PATH)
- ❌ No tests for `app.utils.process_payment` (CRITICAL)
- ❌ No tests for `app.models.Order.validate` (BUSINESS LOGIC)
- ⚠️  Minimal tests for authentication

### Characterization Tests Needed
1. Checkout flow (end-to-end)
2. Payment processing
3. Order validation logic
4. User authentication flows
5. Admin dashboard functionality

## Code Quality

### Complexity
- 15 functions with complexity >10 (REFACTOR)
- `app.views.checkout`: complexity 23 (URGENT)
- `app.utils.process_payment`: complexity 18 (URGENT)

### Duplication
- 45% code duplication in `app.views`
- 38% duplication in `app.models`

### Linting Issues
- 1,247 total issues
  - 234 errors (must fix)
  - 1,013 warnings (should fix)

### Dead Code
- 12 unused functions
- 5 unused imports
- 3 unused models

## Dependencies

### Outdated
- Django 3.2 → 4.2 (security updates)
- requests 2.25 → 2.31 (security updates)
- celery 5.0 → 5.3 (bug fixes)

### Security Issues
- ❌ HIGH: Django 3.2 has known vulnerabilities
- ❌ HIGH: requests 2.25 has known vulnerabilities
- ❌ HIGH: Hardcoded SECRET_KEY in settings.py
- ⚠️  MEDIUM: SQL queries use string concatenation (injection risk)

### Unused
- 3 dependencies not imported anywhere

## Technical Debt

### High Priority
1. Split monolithic models.py (1,234 lines)
2. Extract business logic from views
3. Add service layer
4. Move hardcoded values to environment variables
5. Fix security vulnerabilities

### Medium Priority
1. Add API layer (Django REST Framework)
2. Refactor complex functions (complexity >10)
3. Remove code duplication
4. Add logging
5. Add monitoring

### Low Priority
1. Update docstrings
2. Remove dead code
3. Organize imports
4. Improve naming conventions

## Risk Assessment

### High Risk (Refactor with Extreme Care)
- `app.views.checkout` - Critical path, no tests, high complexity
- `app.utils.process_payment` - Handles money, no tests
- `app.models.Order.validate` - Business rules, minimal tests

### Medium Risk
- `app.views` (general) - Mixed concerns, low test coverage
- `app.models` (general) - Monolithic, circular dependencies

### Low Risk
- `app.utils.helpers` - Simple utilities, well-tested
- Static files - No logic

## Refactor Opportunities

### Quick Wins (Low Risk, High Value)
1. ✅ Add environment variables for config
2. ✅ Run linters and fix auto-fixable issues
3. ✅ Remove dead code
4. ✅ Update dependencies (with tests)
5. ✅ Add docstrings

### Strategic Refactors (High Value, Requires Planning)
1. 📋 Extract service layer from views
2. 📋 Split models.py into separate modules
3. 📋 Add Django REST Framework API
4. 📋 Implement proper error handling
5. 📋 Add comprehensive logging

### Long-Term Improvements
1. 🔮 Migrate to multi-tier architecture (frontend/backend split)
2. 🔮 Add caching layer (Redis)
3. 🔮 Add message queue (Celery improvements)
4. 🔮 Containerize (Docker)

## Recommended Approach

### Phase 1: Stabilize (Weeks 1-2)
1. Import template scaffolding ✅
2. Run assessment ✅
3. Write characterization tests for critical paths
4. Fix security vulnerabilities
5. Update dependencies

### Phase 2: Quick Wins (Weeks 3-4)
1. Add environment variables
2. Run linters, fix auto-fixable issues
3. Remove dead code
4. Add missing docstrings
5. Improve test coverage to 50%

### Phase 3: Strategic Refactor (Months 2-3)
1. Extract service layer
2. Split monolithic files
3. Reduce complexity of high-risk functions
4. Add API layer
5. Improve test coverage to 80%

### Phase 4: Architectural Improvements (Months 4-6)
1. Consider multi-tier architecture
2. Add caching
3. Improve CI/CD
4. Add monitoring and alerting

## Success Criteria

- [ ] Test coverage >80%
- [ ] All linting issues resolved
- [ ] No security vulnerabilities
- [ ] No functions with complexity >10
- [ ] No files >500 lines
- [ ] All critical paths have characterization tests
- [ ] Dependencies up-to-date
- [ ] Documentation complete

## Next Steps

1. **Review this assessment** with team
2. **Prioritize refactor tasks** based on risk/value
3. **Begin characterization tests** for critical paths
4. **Create GitHub Issues** for each refactor task
5. **Start with Quick Wins** to build momentum
```

### Phase 3: Characterization Testing

**Goal**: Lock down current behavior before refactoring.

**Strategy**: "Preserve and Document, Then Improve"

#### Characterization Test Workflow

**For each critical path:**

1. **Identify Seam** (place to insert test)
   ```python
   # Legacy code (no seam)
   def process_payment(order):
       # 50 lines of complex logic
       # No clear separation
       # Multiple side effects
   ```

2. **Create Test Harness**
   ```python
   # tests/characterization/test_payment.py
   def test_process_payment_with_valid_order():
       # Arrange: Setup test data
       order = create_test_order(amount=100.00, currency="USD")

       # Act: Run the actual code
       result = process_payment(order)

       # Assert: What does it ACTUALLY do?
       # (We don't know yet - run test to find out)
       assert result == ???  # Dummy assertion
   ```

3. **Run Test (It Will Fail)**
   ```
   AssertionError: assert {'status': 'success', 'transaction_id': '12345'} == ???
   ```

4. **Update Test with Actual Behavior**
   ```python
   def test_process_payment_with_valid_order():
       order = create_test_order(amount=100.00, currency="USD")
       result = process_payment(order)

       # Now we know what it returns
       assert result == {
           'status': 'success',
           'transaction_id': '12345'
       }
   ```

5. **Test Passes (Behavior Locked)**
   - Now we have a safety net
   - If refactoring changes behavior, test fails
   - We can refactor with confidence

6. **Expand Coverage**
   ```python
   def test_process_payment_with_invalid_card():
       # Test edge case

   def test_process_payment_with_zero_amount():
       # Test another edge case

   def test_process_payment_with_duplicate_order():
       # Test error condition
   ```

#### Characterization Test Priorities

**Priority 1: Critical Paths (Business Impact)**
- Payment processing
- Order fulfillment
- User authentication
- Data integrity operations

**Priority 2: Complex Functions (Technical Risk)**
- High cyclomatic complexity
- Multiple side effects
- External dependencies (API calls, DB operations)

**Priority 3: Frequently Changed Code (Churn)**
- Code changed often (git history)
- Bug-prone areas
- User-reported issues

**Priority 4: Everything Else**
- Simple utilities
- Static data
- Configuration

#### Tracking Characterization Tests

**Document**: `docs/modernization/characterization-tests.md`

```markdown
# Characterization Tests Progress

## Critical Paths

### Payment Processing
- [x] test_process_payment_with_valid_order
- [x] test_process_payment_with_invalid_card
- [x] test_process_payment_with_zero_amount
- [x] test_process_payment_with_duplicate_order
- [ ] test_process_payment_with_refund
- **Coverage**: 78% (target: 90%)

### Order Fulfillment
- [x] test_create_order_with_valid_data
- [x] test_create_order_with_invalid_data
- [ ] test_cancel_order
- [ ] test_update_order_status
- **Coverage**: 45% (target: 90%)

## Complex Functions

### app.views.checkout (complexity: 23)
- [x] test_checkout_happy_path
- [x] test_checkout_empty_cart
- [ ] test_checkout_insufficient_stock
- [ ] test_checkout_payment_failure
- **Coverage**: 52% (target: 90%)

## Summary

- **Total Tests Written**: 12
- **Total Tests Needed**: 47 (estimated)
- **Overall Coverage**: 23% → 52% (goal: 80%)
- **Critical Paths Coverage**: 56% (goal: 90%)
```

#### Characterization Testing Guidelines

**DO:**
- ✅ Test actual behavior (not ideal behavior)
- ✅ Include quirks and bugs (document them)
- ✅ Test edge cases
- ✅ Test error conditions
- ✅ Use descriptive test names
- ✅ Add comments explaining "why this is weird"

**DON'T:**
- ❌ Fix bugs while writing characterization tests
- ❌ Change behavior to make tests easier
- ❌ Skip "bad" behavior (test it!)
- ❌ Write ideal tests (that's for later)
- ❌ Mock too much (test real behavior)

**Example - Testing a Bug**:
```python
def test_calculate_discount_rounds_incorrectly():
    """
    CHARACTERIZATION TEST - Documents existing bug.

    Current behavior: Discount calculation rounds to 2 decimals
    mid-calculation, causing incorrect results.

    Example: $10.00 with 33% discount:
      - Correct: $10.00 * 0.33 = $3.30 discount, $6.70 final
      - Actual:  $10.00 * 0.33 = $3.29 discount, $6.71 final

    TODO: Fix after characterization phase complete.
    See issue #42 for refactor plan.
    """
    result = calculate_discount(amount=10.00, percent=33)

    # Test CURRENT behavior (even though it's wrong)
    assert result == 6.71  # Bug: should be 6.70
```

### Phase 4: Refactor Planning

**Goal**: Create detailed, safe refactor plan based on assessment and characterization tests.

**Document**: `docs/modernization/refactor-plan.md`

#### Refactor Plan Structure

```markdown
# Legacy Code Refactor Plan

## Overview

This plan breaks the modernization into discrete, safe tasks.

**Guiding Principles**:
1. Characterization tests must pass at all times
2. Small, incremental changes
3. Each PR maintains existing behavior
4. Test coverage increases with each task
5. No big-bang rewrites

## Task Breakdown

### Phase 1: Stabilize (Weeks 1-2)

#### TASK-001: Fix Critical Security Issues
**Priority**: URGENT
**Risk**: Low (no behavior change)
**Effort**: 1 day

**What**:
- Update Django 3.2 → 4.2
- Update requests 2.25 → 2.31
- Move hardcoded SECRET_KEY to environment variable
- Fix SQL injection vulnerabilities

**Why**:
- Critical security vulnerabilities
- Production risk

**Acceptance Criteria**:
- [ ] All dependencies updated
- [ ] No security vulnerabilities (Bandit clean)
- [ ] SECRET_KEY in .env
- [ ] All characterization tests pass
- [ ] Manual smoke test of critical paths

**Dependencies**: None

---

#### TASK-002: Write Characterization Tests for Payment Processing
**Priority**: HIGH
**Risk**: Low (just tests)
**Effort**: 2 days

**What**:
- Test `app.utils.process_payment()` with all scenarios
- Cover happy path, error cases, edge cases
- Achieve 90% coverage of payment module

**Why**:
- Critical path with no tests
- Handles money (high risk)
- Needed before refactoring

**Acceptance Criteria**:
- [ ] 90% coverage of `app.utils.process_payment`
- [ ] All edge cases covered
- [ ] Tests document current behavior (including quirks)
- [ ] Tests pass

**Dependencies**: None

---

### Phase 2: Quick Wins (Weeks 3-4)

#### TASK-003: Run Linters and Fix Auto-Fixable Issues
**Priority**: MEDIUM
**Risk**: Low (auto-fixes are safe)
**Effort**: 1 day

**What**:
- Run Ruff on entire codebase
- Apply auto-fixes (imports, formatting, etc.)
- Fix linting errors blocking refactoring

**Why**:
- Improve code consistency
- Make refactoring easier
- Quick win for morale

**Acceptance Criteria**:
- [ ] Ruff runs clean (or only warnings)
- [ ] All characterization tests pass
- [ ] Code formatting consistent

**Dependencies**: TASK-002 (need characterization tests)

---

#### TASK-004: Extract `process_payment` to Service Layer
**Priority**: HIGH
**Risk**: MEDIUM (refactoring critical path)
**Effort**: 3 days

**What**:
- Create `app/services/payment_service.py`
- Move `process_payment()` logic to service
- Update views to use service
- Keep exact same behavior

**Why**:
- Separate concerns (views vs business logic)
- Easier to test
- Foundation for API layer

**Acceptance Criteria**:
- [ ] `PaymentService` class created
- [ ] All payment logic moved to service
- [ ] Views use service (thin controllers)
- [ ] All characterization tests pass
- [ ] No behavior change
- [ ] New unit tests for service

**Dependencies**: TASK-002, TASK-003

---

### Phase 3: Strategic Refactor (Months 2-3)

#### TASK-005: Split Monolithic `models.py`
**Priority**: MEDIUM
**Risk**: MEDIUM (import changes)
**Effort**: 5 days

**What**:
- Split `app/models.py` (1,234 lines) into:
  - `app/models/user.py`
  - `app/models/product.py`
  - `app/models/order.py`
  - `app/models/__init__.py` (re-exports)
- Update all imports

**Why**:
- Improve maintainability
- Reduce merge conflicts
- Better organization

**Acceptance Criteria**:
- [ ] `models.py` split into logical modules
- [ ] All imports updated
- [ ] All characterization tests pass
- [ ] Django migrations unaffected
- [ ] No behavior change

**Dependencies**: TASK-003

---

(More tasks...)

## Risk Mitigation

### For Each Task

**Before Starting**:
1. Ensure characterization tests exist and pass
2. Create feature branch
3. Review risk level

**During Work**:
1. Make small commits
2. Run characterization tests frequently
3. Document any surprises

**Before PR**:
1. All characterization tests pass
2. New unit tests added (if new code)
3. Linters pass
4. Manual smoke test

**Rollback Plan**:
- If tests fail: Revert commit
- If production issue: Revert PR
- All changes are reversible

## Progress Tracking

Use GitHub Issues and Kanban board:
- Label: `modernization`
- Each task = 1 issue
- Track in Kanban columns
```

#### Creating GitHub Issues from Plan

**Script**: `scripts/modernize/create_refactor_issues.py`

```bash
# After creating refactor-plan.md
python scripts/modernize/create_refactor_issues.py docs/modernization/refactor-plan.md
```

**Output**:
```
Creating GitHub Issues from refactor plan...

✅ Created Issue #20: [Modernization] TASK-001: Fix Critical Security Issues
   Priority: URGENT, Label: modernization, security

✅ Created Issue #21: [Modernization] TASK-002: Characterization Tests - Payment
   Priority: HIGH, Label: modernization, testing

✅ Created Issue #22: [Modernization] TASK-003: Run Linters and Fix Auto-Fixes
   Priority: MEDIUM, Label: modernization, quality

... (more issues)

✅ All issues added to Backlog column
📋 Total issues created: 15

Next: Review issues and move to Ready when prioritized.
```

### Phase 5: Safe Refactoring Workflow

**Agent Behavior for Legacy Code Refactoring**

#### Before Starting Any Refactor

1. **Verify Characterization Tests Exist**
   ```bash
   # Check test coverage
   pytest --cov=app.utils.process_payment tests/characterization/
   ```
   - Must have >80% coverage of code being refactored
   - If not, STOP and write characterization tests first

2. **Run Full Test Suite**
   ```bash
   pytest tests/
   ```
   - All tests must pass before starting
   - If any fail, STOP and fix them first

3. **Create Feature Branch**
   ```bash
   git checkout -b feature/modernization-task-004
   ```

#### During Refactoring

1. **Small, Incremental Changes**
   - Change one thing at a time
   - Commit frequently (every logical step)
   - Run tests after each change

2. **Refactoring Patterns**

   **Extract Method**:
   ```python
   # Before (complex function)
   def checkout(request):
       # 50 lines of mixed logic
       # validation, payment, inventory, email

   # After (extracted methods)
   def checkout(request):
       order = validate_checkout_data(request.POST)
       payment = process_payment(order)
       update_inventory(order)
       send_confirmation_email(order)
       return render_success(order)
   ```

   **Extract Service**:
   ```python
   # Before (fat view)
   def checkout_view(request):
       # Complex business logic in view

   # After (thin view, fat service)
   def checkout_view(request):
       service = CheckoutService()
       result = service.process_checkout(request.data)
       return render(result)
   ```

   **Introduce Parameter Object**:
   ```python
   # Before (too many parameters)
   def process_payment(card_number, cvv, expiry, amount, currency, user_id):
       pass

   # After (parameter object)
   @dataclass
   class PaymentRequest:
       card_number: str
       cvv: str
       expiry: str
       amount: Decimal
       currency: str
       user_id: int

   def process_payment(payment_request: PaymentRequest):
       pass
   ```

3. **Run Tests Continuously**
   ```bash
   # After each small change
   pytest tests/characterization/

   # If tests fail, investigate immediately
   # Either: Revert change (it broke behavior)
   # Or: Update characterization test (if intentional)
   ```

4. **Document Surprises**
   ```python
   # If you discover unexpected behavior
   # TODO: Investigate why order total is calculated twice
   # This seems inefficient but might be intentional
   # See characterization test: test_order_total_calculation_quirk()
   ```

#### After Refactoring

1. **Verify Characterization Tests**
   ```bash
   pytest tests/characterization/ -v
   ```
   - All must pass
   - If any fail, behavior changed (unintentional)
   - Revert or investigate

2. **Add New Unit Tests**
   ```python
   # If you extracted new functions/classes
   # Add proper unit tests (not just characterization)
   def test_validate_checkout_data_with_valid_input():
       # Test the new, cleaner function
   ```

3. **Run Full Test Suite**
   ```bash
   pytest tests/ --cov
   ```
   - All tests pass
   - Coverage should increase (or stay same)

4. **Run Linters**
   ```bash
   ruff check .
   ```
   - Should pass (pre-commit will check anyway)

5. **Manual Smoke Test**
   - Test the refactored feature manually
   - Verify UI/UX unchanged
   - Check logs for errors

6. **Commit and Push**
   ```bash
   git add .
   git commit -m "refactor(payment): extract payment logic to service layer

   - Created PaymentService class
   - Moved process_payment logic from utils to service
   - Updated views to use service
   - All characterization tests pass
   - No behavior change"

   git push origin feature/modernization-task-004
   ```

7. **Create Pull Request**
   ```bash
   python scripts/github/create_pr.py \
     "Refactor: Extract Payment Service" \
     "Implements TASK-004 from refactor plan..." \
     main
   ```

8. **Wait for Review**
   - User reviews changes
   - Approves PR
   - Merges to main

#### Agent Guidelines for Legacy Code

**ALWAYS:**
- ✅ Check characterization tests exist before refactoring
- ✅ Run tests after every change
- ✅ Make small, incremental changes
- ✅ Commit frequently
- ✅ Document unexpected behavior
- ✅ Verify no behavior change

**NEVER:**
- ❌ Refactor without characterization tests
- ❌ Make multiple changes in one commit
- ❌ Fix bugs during refactoring (separate PR)
- ❌ Change behavior "because it's wrong" (document, fix later)
- ❌ Skip manual smoke testing

## Updated `.cursorrules` for Legacy Code

Add section to `.cursorrules`:

```markdown
## 🔧 Legacy Code Modernization

### When Working on Legacy Code

**Legacy code** = Code without tests, unclear architecture, technical debt.

**Different workflow than greenfield TDD:**

1. **Characterization Tests First**
   - Write tests that prove CURRENT behavior
   - Lock down existing functionality
   - Create safety net for refactoring

2. **Small, Safe Refactors**
   - Characterization tests must always pass
   - No behavior changes (document bugs, fix later)
   - Incremental improvements

3. **Agent Checklist Before Refactoring**
   - [ ] Characterization tests exist (>80% coverage)
   - [ ] All tests currently passing
   - [ ] Feature branch created
   - [ ] Refactor plan reviewed

4. **Agent Checklist After Refactoring**
   - [ ] All characterization tests pass
   - [ ] New unit tests added (if applicable)
   - [ ] Linters pass
   - [ ] Manual smoke test complete
   - [ ] No behavior change verified

### Characterization Testing

**Goal**: Document what code ACTUALLY does (not what it should do).

**Process**:
1. Identify seam (place to test)
2. Write test with dummy assertion
3. Run test (it fails, shows actual output)
4. Update test to expect actual output
5. Test passes (behavior locked down)
6. Repeat for all paths/edge cases

**Document**: `docs/modernization/characterization-tests.md`

### Import Template Scaffolding

**Script**: `scripts/modernize/import_template.sh`

Imports template into existing legacy project:
- Analyzes existing structure
- Imports .cursorrules, scripts, docs (non-destructive)
- Sets up tooling (linters, tests, pre-commit)
- Creates modernization structure

### Assessment and Planning

**Script**: `scripts/modernize/assess_codebase.py`

Analyzes legacy codebase:
- Functionality inventory
- Architecture analysis
- Code quality metrics
- Test coverage gaps
- Technical debt
- Risk assessment

**Output**: `docs/modernization/assessment.md`

### See Planning Doc

Complete workflow: `docs/planning/features/FEAT-003-legacy-code-modernization.md`
```

## Implementation Tasks

If this plan is approved, create these scripts/tools:

### High Priority (Core Workflow)

1. **`scripts/modernize/import_template.sh`**
   - Analyze legacy project
   - Import template files (non-destructive)
   - Setup tooling
   - Generate report

2. **`scripts/modernize/assess_codebase.py`**
   - Analyze code quality, architecture, tests
   - Generate assessment report
   - Identify risks and opportunities

3. **`scripts/modernize/create_refactor_issues.py`**
   - Parse refactor-plan.md
   - Create GitHub Issues for each task
   - Add to Backlog column

4. **Update `.cursorrules`**
   - Add legacy code modernization section
   - Characterization testing guidelines
   - Agent behavior for legacy refactoring

### Medium Priority (Documentation)

5. **`docs/guides/legacy-modernization-guide.md`**
   - Step-by-step guide for users
   - Examples and best practices
   - Common pitfalls

6. **Template Documents**
   - `docs/modernization/assessment-template.md`
   - `docs/modernization/characterization-tests-template.md`
   - `docs/modernization/refactor-plan-template.md`

### Low Priority (Nice to Have)

7. **`scripts/modernize/coverage_watcher.sh`**
   - Watch test coverage during refactoring
   - Alert if coverage decreases

8. **`scripts/modernize/behavior_diff.py`**
   - Capture outputs before refactor
   - Compare outputs after refactor
   - Verify no behavior change

## Success Criteria

- [ ] Import script works for Python, JavaScript, TypeScript projects
- [ ] Assessment script generates comprehensive report
- [ ] Characterization testing workflow documented
- [ ] Refactor planning template complete
- [ ] Agent guidelines for legacy code added to `.cursorrules`
- [ ] Scripts create GitHub Issues from plan
- [ ] All scripts follow template standards (linting, tests, docs)

## Risks & Mitigation

### Risk 1: Breaking Production

**Mitigation**:
- Characterization tests are mandatory
- Small, incremental changes
- All tests must pass before PR
- Manual smoke testing required
- Easy rollback (revert PR)

### Risk 2: Incomplete Characterization Tests

**Mitigation**:
- Require >80% coverage before refactoring
- Track coverage per module
- Agent checks coverage before starting

### Risk 3: Scope Creep (Rewrite Instead of Refactor)

**Mitigation**:
- Strict "no behavior change" rule
- Characterization tests enforce this
- Small tasks with clear acceptance criteria
- Agent trained to preserve existing behavior

### Risk 4: Legacy Code Too Messy to Test

**Mitigation**:
- "Seam" techniques from Michael Feathers
- Introduce abstractions gradually
- Test at higher levels first (integration)
- Refactor for testability, then add tests

### Risk 5: Import Script Conflicts with Existing Files

**Mitigation**:
- Non-destructive by default
- Merge (don't overwrite) existing configs
- User review before committing changes
- Detailed import report

## References

- **"Working Effectively with Legacy Code"** by Michael Feathers
  - Characterization testing
  - Seam techniques
  - Breaking dependencies

- **"Refactoring"** by Martin Fowler
  - Refactoring patterns
  - Safe refactoring techniques

- **"Clean Code"** by Robert C. Martin
  - Code quality principles
  - Naming, structure, functions

## Future Enhancements

- Support for more languages (Go, Ruby, Java)
- Automated refactoring suggestions (AI-powered)
- Performance benchmarking (ensure refactor doesn't slow down)
- Migration paths (e.g., Django 2.x → 4.x step-by-step)
- Visual dependency graphs
- Refactoring metrics dashboard

---

## Approval Status

**Status:** Draft - Awaiting user review

**Next Steps After Approval:**
1. Create implementation tasks as GitHub Issues
2. User prioritizes tasks (Backlog → Ready)
3. Implement high-priority scripts first
4. Test with real legacy project
5. Iterate based on learnings

**Questions:**
- Any specific legacy project types to prioritize? (Django, Flask, Express, etc.)
- Preferred assessment depth? (Quick scan vs deep analysis)
- Integration with existing tools? (SonarQube, CodeClimate, etc.)
