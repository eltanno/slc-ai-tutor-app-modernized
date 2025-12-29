# Characterization Tests Plan

**Purpose:** Lock down existing behavior before refactoring. Tests prove CURRENT behavior, including any bugs.

**Target Coverage:** 80% before any refactoring begins

---

## Test Infrastructure Setup

### Required Packages

```bash
# Add to requirements.txt (dev section)
pytest>=8.0.0
pytest-django>=4.8.0
pytest-cov>=4.1.0
factory-boy>=3.3.0
responses>=0.25.0  # For mocking HTTP requests
```

### Configuration

```python
# pytest.ini or pyproject.toml
[pytest]
DJANGO_SETTINGS_MODULE = backend.settings
python_files = tests.py test_*.py *_tests.py
addopts = --cov=api --cov-report=html --cov-report=term-missing
```

---

## Critical Path Tests

### 1. Authentication Flow

| Test | Description | Priority |
|------|-------------|----------|
| `test_login_returns_jwt_tokens` | Valid credentials return access + refresh tokens | P0 |
| `test_login_invalid_credentials_fails` | Wrong password returns 401 | P0 |
| `test_login_triggers_openwebui_auth` | Successful login calls OpenWebUI signin | P0 |
| `test_login_openwebui_failure_doesnt_fail_django` | OpenWebUI error is logged but login succeeds | P0 |
| `test_register_creates_user` | Valid data creates user | P1 |
| `test_get_me_returns_user_data` | Authenticated request returns user | P1 |
| `test_get_me_unauthenticated_returns_fail` | No token returns fail status | P1 |

**Coverage Target:** 100%

### 2. Chat CRUD Operations

| Test | Description | Priority |
|------|-------------|----------|
| `test_list_chats_returns_user_chats_only` | User sees only their chats | P0 |
| `test_list_chats_pagination` | Page/page_size params work | P1 |
| `test_create_chat_success` | Valid data creates chat | P0 |
| `test_create_chat_sets_user` | Chat.user is request.user | P0 |
| `test_get_chat_by_id` | Returns chat with all fields | P0 |
| `test_get_chat_not_found` | Wrong ID returns 404 | P1 |
| `test_get_chat_wrong_user_forbidden` | Can't access other user's chat | P0 |
| `test_update_chat_full` | PUT updates all fields | P1 |
| `test_update_chat_partial` | PATCH updates single field | P1 |
| `test_update_chat_recalculates_interaction_count` | Count based on user messages | P1 |
| `test_delete_chat_success` | Owner can delete | P1 |
| `test_delete_chat_wrong_user_forbidden` | Can't delete other's chat | P0 |

**Coverage Target:** 90%

### 3. Staff Permissions

| Test | Description | Priority |
|------|-------------|----------|
| `test_all_users_staff_only` | Non-staff gets 403 | P0 |
| `test_all_users_returns_list` | Staff sees all users | P0 |
| `test_all_users_includes_chat_count` | Each user has chat_count | P1 |
| `test_user_chats_staff_only` | Non-staff gets 403 | P0 |
| `test_user_chats_returns_target_user_chats` | Staff can view any user's chats | P0 |
| `test_staff_can_view_any_chat` | Staff GET on any chat succeeds | P1 |
| `test_staff_cannot_update_others_chat` | Staff PUT returns 403 | P0 |
| `test_staff_cannot_delete_others_chat` | Staff DELETE returns 403 | P0 |

**Coverage Target:** 100%

### 4. LLM Operations (Mocked)

| Test | Description | Priority |
|------|-------------|----------|
| `test_send_message_adds_to_chat` | User message stored in chat.messages | P0 |
| `test_send_message_returns_202` | Async operation returns 202 Accepted | P0 |
| `test_send_message_sets_status_in_progress` | Chat.status updated | P1 |
| `test_send_message_completed_chat_fails` | Can't message completed chat | P0 |
| `test_send_message_max_turns_enforced` | Fails when max_turns exceeded | P1 |
| `test_send_message_no_token_fails` | Missing OpenWebUI token returns 401 | P0 |
| `test_get_help_returns_202` | Help request accepted | P0 |
| `test_get_help_duplicate_turn_fails` | Can't request help twice per turn | P1 |
| `test_get_help_processing_status` | Second request during processing returns 202 | P1 |
| `test_grade_returns_202` | Grading accepted | P0 |
| `test_grade_already_graded_returns_existing` | Re-grading returns cached result | P1 |
| `test_grade_failed_can_retry` | Failed grading allows retry | P1 |

**Coverage Target:** 85%

### 5. Background Tasks (Integration)

| Test | Description | Priority |
|------|-------------|----------|
| `test_process_message_updates_chat` | After completion, chat has response | P0 |
| `test_process_message_error_stored` | LLM error stored in messages | P1 |
| `test_process_help_updates_help_responses` | Help text added to array | P0 |
| `test_process_grading_sets_score` | Grading data and score populated | P0 |
| `test_process_grading_marks_complete` | Chat.completed=True after grading | P1 |

**Coverage Target:** 80%

### 6. Notes CRUD (Secondary)

| Test | Description | Priority |
|------|-------------|----------|
| `test_list_notes_returns_user_notes` | Only own notes | P2 |
| `test_create_note` | Creates with author | P2 |
| `test_update_note` | Modifies content | P2 |
| `test_delete_note` | Removes note | P2 |

**Coverage Target:** 70%

---

## Complex Functions to Test

### `get_pagination_data(request, total_items)` - views.py:940-977

| Test | Input | Expected Output |
|------|-------|-----------------|
| `test_pagination_defaults` | No params | page=1, page_size=10 |
| `test_pagination_custom_page` | page=3 | page=3, correct slice |
| `test_pagination_invalid_page_string` | page="abc" | Defaults to 1 |
| `test_pagination_negative_page` | page=-1 | Defaults to 1 |
| `test_pagination_zero_page_size` | page_size=0 | Defaults to 10 |
| `test_pagination_total_pages_calculation` | 25 items, size 10 | total_pages=3 |
| `test_pagination_start_end_index` | page=2, size=10 | start=10, end=20 |

### `OpenWebUIClient.chat_completion()` - openwebui_client.py:91-248

| Test | Scenario | Expected |
|------|----------|----------|
| `test_chat_completion_success` | 200 response | Returns JSON |
| `test_chat_completion_401_raises` | Token expired | Exception raised |
| `test_chat_completion_timeout` | Slow response | Timeout exception |
| `test_chat_completion_extracts_error` | Error in body | Detailed error message |

### `process_chat_message_async()` - background_tasks.py:19-186

| Test | Scenario | Expected |
|------|----------|----------|
| `test_limits_conversation_history` | 20 messages | Trimmed to last 12 |
| `test_action_message_converted` | is_action=True | [Action: ...] format |
| `test_error_appends_system_message` | LLM fails | Error in messages |

---

## Test Data Factories

```python
# tests/factories.py
import factory
from django.contrib.auth.models import User
from api.models import Chat, UserProfile

class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = User
    username = factory.Sequence(lambda n: f"user{n}")
    email = factory.LazyAttribute(lambda o: f"{o.username}@test.com")
    password = factory.PostGenerationMethodCall('set_password', 'testpass123')

class UserProfileFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = UserProfile
    user = factory.SubFactory(UserFactory)
    openwebui_token = "test-token-123"

class ChatFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Chat
    user = factory.SubFactory(UserFactory)
    title = factory.Sequence(lambda n: f"Test Chat {n}")
    messages = []
    course_data = {"max_turns": 10}
```

---

## Summary

| Category | Tests | Coverage Target |
|----------|-------|-----------------|
| Authentication | 7 | 100% |
| Chat CRUD | 12 | 90% |
| Staff Permissions | 8 | 100% |
| LLM Operations | 12 | 85% |
| Background Tasks | 5 | 80% |
| Notes CRUD | 4 | 70% |
| **Total** | **48** | **80%+** |

---

## Execution Plan

1. **Week 1:** Set up pytest infrastructure, write auth tests
2. **Week 2:** Chat CRUD + Staff permission tests
3. **Week 3:** LLM operation tests (mocked)
4. **Week 4:** Background task integration tests, reach 80% coverage

**Do NOT refactor until coverage target is met.**
