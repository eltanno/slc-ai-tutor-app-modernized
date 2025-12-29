# Legacy Codebase Assessment

Generated: 2025-12-29

## Executive Summary

The SLC AI Tutor App is a Django/React application that enables students to practice conversations with AI tutors (via OpenWebUI integration), receive real-time help, and get graded on their interactions. The codebase is functional but has significant technical debt:

- **Zero test coverage** - `tests.py` is empty
- **Large monolithic view file** - `views.py` is 977 lines with 12+ view classes
- **Background tasks use raw threading** - not production-ready
- **No version pinning** in requirements.txt
- **Mixed patterns** - duplicate ChatMessage storage (JSON field + separate model)

**Risk Level:** Medium-High - Application works but is fragile, hard to modify safely.

---

## Functionality Inventory

### Core Features

| Feature | Status | Location | Notes |
|---------|--------|----------|-------|
| User Authentication | Working | `TokenObtainPairView` | JWT + OpenWebUI dual auth |
| User Registration | Working | `CreateUserView` | Basic Django auth |
| Notes CRUD | Working | `Notes`, `NoteDetail` | Simple note-taking (appears unused) |
| Chat Sessions | Working | `Chats`, `ChatDetail` | Core feature - list/create/update/delete |
| Send Message to AI | Working | `ChatSendMessageView` | Async via threading |
| Get Help | Working | `ChatGetHelpView` | Separate AI tutor for hints |
| Grade Chat | Working | `ChatGradeView` | Evaluates student performance |
| Staff User List | Working | `AllUsersView` | Admin dashboard |
| Staff View User Chats | Working | `UserChats` | Admin can view any user's chats |

### API Endpoints

| Endpoint | Method | View Class | Purpose |
|----------|--------|------------|---------|
| `/api/user/me/` | GET | `GetLoggedInUserView` | Current user info |
| `/api/users/` | GET | `AllUsersView` | List all users (staff) |
| `/api/notes/` | GET, POST | `Notes` | Notes CRUD |
| `/api/notes/<id>/` | GET, PUT, DELETE | `NoteDetail` | Note detail |
| `/api/chats/` | GET, POST | `Chats` | Chat sessions |
| `/api/chats/<id>/` | GET, PUT, PATCH, DELETE | `ChatDetail` | Chat CRUD |
| `/api/users/<id>/chats/` | GET | `UserChats` | User's chats (staff) |
| `/api/chats/<id>/send-message/` | POST | `ChatSendMessageView` | Send message to AI |
| `/api/chats/<id>/get-help/` | POST | `ChatGetHelpView` | Request help |
| `/api/chats/<id>/grade/` | POST | `ChatGradeView` | Grade conversation |
| `/api/debug/config/` | GET | `DebugConfigView` | Debug info (dev only) |

---

## Architecture

### Current Structure

```
backend/
├── api/
│   ├── models.py          # 157 lines - 4 models
│   ├── views.py           # 977 lines - 12 view classes (TOO LARGE)
│   ├── serializers.py     # 113 lines - 5 serializers
│   ├── urls.py            # 31 lines - 11 routes
│   ├── background_tasks.py # 387 lines - async processing
│   ├── openwebui_client.py # 405 lines - LLM API client
│   ├── prompts.py         # 196 lines - system prompts
│   ├── admin.py           # 32 lines - Django admin
│   ├── tests.py           # 0 lines - EMPTY
│   └── constatnts.py      # 0 lines - typo, empty
└── backend/
    └── settings.py        # Django settings
```

### Architecture Issues

1. **Monolithic views.py** (977 lines)
   - Contains 12 view classes
   - Duplicated code in `ChatGetHelpView` and `ChatGradeView` (_format_conversation)
   - Dead code: `UserChats.post()` method never called
   - Should be split: `views/auth.py`, `views/notes.py`, `views/chats.py`

2. **Dual message storage** - redundant design
   - `Chat.messages` JSONField stores messages inline
   - `ChatMessage` model stores messages in separate table
   - Application only uses JSONField; ChatMessage model appears unused

3. **Threading for background tasks** - not production safe
   - Uses `threading.Thread` for async operations
   - No queue, no retry, no monitoring
   - Will fail silently on worker crash

4. **Tight coupling to OpenWebUI**
   - Hardcoded model names: `slc-resident`, `slc-conversation-helper`, `slc-tutor-evaluator`
   - Login synced to OpenWebUI during Django auth

---

## Test Coverage

### Current State

| Component | Tests | Coverage |
|-----------|-------|----------|
| Models | 0 | 0% |
| Views | 0 | 0% |
| Serializers | 0 | 0% |
| Background tasks | 0 | 0% |
| OpenWebUI client | 0 | 0% |

**Total: 0 tests, 0% coverage**

### Critical Testing Gaps

1. **Authentication flow** - JWT + OpenWebUI dual auth untested
2. **Chat lifecycle** - Create → Send message → Get help → Grade
3. **Permission checks** - Staff-only endpoints
4. **Error handling** - Token expiry, LLM failures
5. **Background task completion** - Message processing, grading

---

## Code Quality

### Complexity Issues

| File | Lines | Cyclomatic Complexity | Issue |
|------|-------|----------------------|-------|
| views.py | 977 | High | Multiple responsibilities |
| background_tasks.py | 387 | Medium | Error handling complex |
| openwebui_client.py | 405 | Medium | Retry logic complex |

### Code Smells

1. **Duplicated conversation formatting** (`views.py:795-817` and `views.py:913-937`)
2. **Bare except clauses** - `except:` without exception type (multiple locations)
3. **Hardcoded magic numbers** - `MAX_CONVERSATION_EXCHANGES = 6`
4. **Print statements** instead of logging (`views.py:54`)
5. **Empty files** - `constatnts.py` (also typo), `tests.py`
6. **Dead code** - `UserChats.post()` method never reachable

### Linting Issues (from pre-commit)

- Ruff identified issues (see initial commit)
- Bandit flagged security concerns
- Currently bypassed with `--no-verify`

---

## Dependencies

### Backend (requirements.txt)

| Package | Current | Pinned? | Notes |
|---------|---------|---------|-------|
| Django | unpinned | No | Should pin major version |
| djangorestframework | unpinned | No | Should pin |
| djangorestframework-simplejwt | unpinned | No | Should pin |
| psycopg2-binary | unpinned | No | Dev only, use psycopg2 in prod |
| requests | unpinned | No | For OpenWebUI client |

**Issue:** No version pinning - builds may break unpredictably.

### Frontend (package.json)

| Package | Version | Notes |
|---------|---------|-------|
| react | ^19.1.0 | Latest major version |
| @mui/material | ^7.3.1 | Current |
| @reduxjs/toolkit | ^2.8.2 | Current |
| vite | ^7.0.4 | Current |
| typescript | ~5.8.3 | Current |

**Frontend is reasonably up-to-date.**

---

## Technical Debt

### High Priority

1. **No tests** - Cannot refactor safely
2. **views.py size** - Too large to maintain
3. **Threading background tasks** - Not production-ready

### Medium Priority

4. **Unpinned dependencies** - Build reproducibility
5. **Dual message storage** - Confusion, wasted space
6. **Bare except clauses** - Hiding errors

### Low Priority

7. **Empty/typo files** - `constatnts.py`
8. **Dead code** - Unreachable methods
9. **Debug endpoint** - Should be disabled in prod

---

## Risk Assessment

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Refactor breaks functionality | High | High | Write characterization tests first |
| Background task fails silently | Medium | Medium | Add proper task queue |
| Dependency update breaks build | Medium | High | Pin versions |
| LLM API changes break app | High | Low | Abstract OpenWebUI client |

---

## Refactor Opportunities

### Phase 1: Safety Net (Characterization Tests)

1. Test authentication flow
2. Test chat CRUD operations
3. Test LLM operations (mocked)
4. Test staff permissions

### Phase 2: Split views.py

```
views/
├── __init__.py      # Re-exports for compatibility
├── auth.py          # TokenObtainPairView, CreateUserView, GetLoggedInUserView
├── notes.py         # Notes, NoteDetail
├── chats.py         # Chats, ChatDetail, UserChats
├── llm_operations.py # ChatSendMessageView, ChatGetHelpView, ChatGradeView
├── admin.py         # AllUsersView, DebugConfigView
└── utils.py         # get_pagination_data
```

### Phase 3: Infrastructure Improvements

1. Replace threading with Celery/Django-Q
2. Pin all dependency versions
3. Remove ChatMessage model (or migrate to use it exclusively)

---

## Recommended Approach

Following the Legacy Code Workflow:

1. **DO NOT** change any code until characterization tests exist
2. Write tests that prove CURRENT behavior (including bugs)
3. Split views.py while keeping tests green
4. Fix linting issues incrementally
5. Replace threading after tests are solid

---

## Next Steps

1. [ ] Create characterization test plan (Phase 2 ticket)
2. [ ] Set up pytest + pytest-django + factory_boy
3. [ ] Write auth flow tests
4. [ ] Write chat CRUD tests
5. [ ] Write LLM operation tests (mocked)
6. [ ] Achieve 80% coverage before any refactoring
