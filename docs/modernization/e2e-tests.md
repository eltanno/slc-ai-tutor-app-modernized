# E2E Tests Plan (Playwright)

**Purpose:** Test critical user flows end-to-end before any frontend refactoring. Tests verify CURRENT behavior from the user's perspective.

**Target:** All critical happy paths tested, key error states covered.

---

## Test Infrastructure Setup

### Required Packages

Already installed:
```bash
@playwright/test@^1.57.0
```

### Configuration

Create `frontend/playwright.config.ts`:
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5174',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5174',
    reuseExistingServer: !process.env.CI,
  },
});
```

### NPM Scripts

Add to `frontend/package.json`:
```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:headed": "playwright test --headed"
  }
}
```

### Prerequisites

Before running E2E tests, the local dev environment must be running:
1. `./start_db.sh` - Start Docker (db, open-webui, pipelines)
2. `cd backend && ./start_dev.sh` - Start Django backend (port 8000)
3. Frontend will be started automatically by Playwright

### Test User Accounts

Tests require known credentials. Options:
- Use existing dev account credentials (configure in `.env.test`)
- Create test fixtures in backend database

---

## Critical Path Tests

### 1. Authentication Flow

| Test | Description | Priority |
|------|-------------|----------|
| `test_login_page_renders` | Login form visible with email/password fields | P0 |
| `test_login_success_redirects_to_dashboard` | Valid credentials → dashboard | P0 |
| `test_login_invalid_credentials_shows_error` | Wrong password shows error message | P0 |
| `test_login_persists_on_refresh` | Refresh page stays logged in | P0 |
| `test_logout_clears_session` | Logout → redirected to login, can't access protected routes | P0 |
| `test_protected_route_redirects_to_login` | Unauthenticated → /dashboard redirects to /login | P1 |

**File:** `e2e/auth.spec.ts`

### 2. Onboarding Flow (First Visit)

| Test | Description | Priority |
|------|-------------|----------|
| `test_welcome_dialog_shows_on_first_visit` | Dashboard shows welcome modal for new user | P1 |
| `test_welcome_dialog_dismiss_persists` | "Don't show again" prevents future display | P2 |
| `test_avatar_select_page_shows_options` | Avatar selection displays avatar grid | P1 |
| `test_avatar_selection_saves` | Click avatar → confirm → avatar saved | P1 |
| `test_avatar_shows_in_header` | Selected avatar visible in navigation bar | P2 |

**File:** `e2e/onboarding.spec.ts`

### 3. Dashboard & Navigation

| Test | Description | Priority |
|------|-------------|----------|
| `test_dashboard_shows_training_units` | Units displayed with scenario cards | P0 |
| `test_dashboard_unit_expansion` | Click unit → expands to show scenarios | P1 |
| `test_navigation_to_chats` | Click "Chats" → navigates to chat list | P1 |
| `test_navigation_to_avatar` | Click avatar → navigates to avatar select | P2 |

**File:** `e2e/dashboard.spec.ts`

### 4. Chat Creation Flow

| Test | Description | Priority |
|------|-------------|----------|
| `test_scenario_click_opens_instructions` | Click scenario → chat instructions page | P0 |
| `test_instructions_shows_resident_info` | Instructions page shows resident details | P1 |
| `test_instructions_shows_video` | YouTube embed visible (if configured) | P2 |
| `test_start_chat_creates_chat` | Click "Start Chat" → chat page opens | P0 |
| `test_chat_page_shows_conversation_area` | Chat page has message area visible | P0 |
| `test_chat_page_shows_action_buttons` | Scenario actions displayed | P1 |

**File:** `e2e/chat-creation.spec.ts`

### 5. Chat Interaction

| Test | Description | Priority |
|------|-------------|----------|
| `test_send_message_appears_in_conversation` | Type message → send → appears in chat | P0 |
| `test_assistant_response_appears` | After sending, assistant response shows | P0 |
| `test_message_shows_loading_state` | "Thinking" state shown while waiting | P1 |
| `test_action_button_click_sends_action` | Click action → message sent | P0 |
| `test_action_button_disabled_after_use` | Action can only be used once | P1 |
| `test_turn_counter_updates` | Turn count increments after message | P1 |
| `test_max_turns_triggers_grading_state` | Reaching max turns → grading prompt | P1 |

**File:** `e2e/chat-interaction.spec.ts`

### 6. Help Feature

| Test | Description | Priority |
|------|-------------|----------|
| `test_get_help_button_visible` | Help button shown during active chat | P1 |
| `test_get_help_shows_loading` | Click help → loading state | P1 |
| `test_help_modal_displays_feedback` | Help modal appears with feedback text | P1 |
| `test_help_modal_closes` | Close button dismisses modal | P2 |

**File:** `e2e/help-feature.spec.ts`

### 7. Grading Flow

| Test | Description | Priority |
|------|-------------|----------|
| `test_grade_button_visible_after_messages` | Grade button appears after conversation | P1 |
| `test_grade_chat_shows_loading` | Click grade → loading state | P1 |
| `test_grading_results_modal_appears` | Grading complete → results modal | P0 |
| `test_grading_results_shows_scores` | Modal displays score breakdown | P1 |
| `test_grading_results_close_returns_to_chat` | Close modal → back to chat view | P2 |
| `test_completed_chat_shows_status` | Completed chat shows "complete" status | P1 |

**File:** `e2e/grading.spec.ts`

### 8. Chat List & History

| Test | Description | Priority |
|------|-------------|----------|
| `test_chat_list_shows_user_chats` | Chat list displays user's chats | P0 |
| `test_chat_list_pagination` | More than page size → pagination works | P2 |
| `test_click_chat_opens_detail` | Click chat → view chat page | P0 |
| `test_view_chat_shows_transcript` | Chat detail shows full message history | P1 |
| `test_download_transcript` | Download button downloads file | P2 |
| `test_delete_chat` | Delete button removes chat from list | P2 |

**File:** `e2e/chat-list.spec.ts`

### 9. Staff Features

| Test | Description | Priority |
|------|-------------|----------|
| `test_staff_sees_all_users_tab` | Staff user sees "All Users" in chat list | P1 |
| `test_staff_can_view_user_list` | All Users shows list of users | P1 |
| `test_staff_can_view_user_chats` | Click user → see their chats | P1 |
| `test_non_staff_no_all_users_tab` | Regular user doesn't see "All Users" | P1 |

**File:** `e2e/staff-features.spec.ts`

---

## Test Utilities

### Auth Helper

Create `e2e/fixtures/auth.ts`:
```typescript
import { Page } from '@playwright/test';

export async function login(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.fill('[name="email"]', email);
  await page.fill('[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL('/dashboard');
}

export async function logout(page: Page) {
  await page.goto('/logout');
  await page.waitForURL('/login');
}
```

### Test Data Constants

Create `e2e/fixtures/test-data.ts`:
```typescript
export const TEST_USER = {
  email: process.env.TEST_USER_EMAIL || 'test@example.com',
  password: process.env.TEST_USER_PASSWORD || 'testpass123',
};

export const TEST_STAFF_USER = {
  email: process.env.TEST_STAFF_EMAIL || 'staff@example.com',
  password: process.env.TEST_STAFF_PASSWORD || 'staffpass123',
};
```

---

## Test File Structure

```
frontend/
├── e2e/
│   ├── fixtures/
│   │   ├── auth.ts           # Login/logout helpers
│   │   └── test-data.ts      # Test constants
│   ├── auth.spec.ts          # Authentication tests
│   ├── onboarding.spec.ts    # First-visit experience
│   ├── dashboard.spec.ts     # Dashboard & navigation
│   ├── chat-creation.spec.ts # Starting new chats
│   ├── chat-interaction.spec.ts # Messaging & actions
│   ├── help-feature.spec.ts  # Help functionality
│   ├── grading.spec.ts       # Chat grading
│   ├── chat-list.spec.ts     # Chat history
│   └── staff-features.spec.ts # Staff-only features
├── playwright.config.ts
└── package.json
```

---

## Summary

| Category | Tests | Priority Distribution |
|----------|-------|-----------------------|
| Authentication | 6 | 4 P0, 2 P1 |
| Onboarding | 5 | 2 P1, 3 P2 |
| Dashboard | 4 | 1 P0, 2 P1, 1 P2 |
| Chat Creation | 6 | 3 P0, 2 P1, 1 P2 |
| Chat Interaction | 7 | 2 P0, 5 P1 |
| Help Feature | 4 | 3 P1, 1 P2 |
| Grading | 6 | 1 P0, 4 P1, 1 P2 |
| Chat List | 6 | 2 P0, 1 P1, 3 P2 |
| Staff Features | 4 | 4 P1 |
| **Total** | **48** | **12 P0, 27 P1, 9 P2** |

---

## GitHub Issues to Create

### Issue 1: Set up Playwright infrastructure
- Create `playwright.config.ts`
- Add npm scripts to `package.json`
- Create `e2e/fixtures/` with auth helpers
- Create empty test files with skipped tests
- Run `npx playwright install` for browser binaries

### Issue 2: Authentication E2E tests (6 tests)
- Implement all auth.spec.ts tests
- P0 priority - foundation for other tests

### Issue 3: Dashboard & Navigation E2E tests (4 tests)
- Dashboard rendering
- Unit expansion
- Navigation links

### Issue 4: Chat Creation E2E tests (6 tests)
- Scenario → instructions → chat flow
- Depends on auth tests working

### Issue 5: Chat Interaction E2E tests (7 tests)
- Message sending/receiving
- Action buttons
- Turn counting

### Issue 6: Help Feature E2E tests (4 tests)
- Help button and modal

### Issue 7: Grading E2E tests (6 tests)
- Grade button, results modal

### Issue 8: Chat List E2E tests (6 tests)
- Chat history and navigation

### Issue 9: Staff Features E2E tests (4 tests)
- Staff-only functionality
- Requires staff test account

### Issue 10: Onboarding E2E tests (5 tests)
- Welcome dialogs
- Avatar selection
- Lower priority (P1/P2)

---

## Execution Plan

1. **Infrastructure setup** - Config, scripts, fixtures, empty test files
2. **Authentication tests** - Foundation (P0)
3. **Dashboard + Chat Creation** - Core happy path (P0)
4. **Chat Interaction** - Main feature tests (P0/P1)
5. **Grading + Help** - Complete chat lifecycle (P1)
6. **Chat List + Staff** - Secondary features (P1)
7. **Onboarding** - Polish tests (P2)

**Do NOT begin frontend refactoring until E2E tests cover critical paths.**

---

## Risks & Considerations

1. **Backend dependency** - Tests require running backend + database
2. **Test user management** - Need consistent test accounts
3. **LLM responses** - Chat/grading responses are non-deterministic; may need mocking or flexible assertions
4. **Timeouts** - LLM operations can be slow; configure appropriate timeouts
5. **State cleanup** - Tests may create chats; need cleanup strategy

---

# Phase 2: Functional Tests (Unit & Component)

**Purpose:** Fast, isolated tests for utilities, Redux logic, and React components. Run without browser or backend.

**Target:** Cover all utility functions and complex components with fast feedback loops.

---

## Functional Test Infrastructure

### Required Packages

```bash
# Add to devDependencies
vitest                    # Fast unit test runner for Vite
@testing-library/react    # React component testing
@testing-library/jest-dom # DOM matchers
@testing-library/user-event # User interaction simulation
jsdom                     # DOM environment for tests
msw                       # Mock Service Worker for API mocking
```

### Configuration

Create `frontend/vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      reporter: ['text', 'html'],
      exclude: ['node_modules/', 'src/test/'],
    },
  },
});
```

Create `frontend/src/test/setup.ts`:
```typescript
import '@testing-library/jest-dom';
```

### NPM Scripts

Add to `frontend/package.json`:
```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage"
  }
}
```

---

## Unit Tests (Pure Functions)

### 1. Message Converter Utils

**File:** `src/app/utils/openWebUiMessageConverter.test.ts`

| Test | Description |
|------|-------------|
| `convertMessagesToOpenWebUIFormat_empty_array` | Empty input returns empty structure |
| `convertMessagesToOpenWebUIFormat_single_user_message` | Single message has correct structure |
| `convertMessagesToOpenWebUIFormat_user_assistant_pair` | Parent/child IDs linked correctly |
| `convertMessagesToOpenWebUIFormat_assistant_has_model_fields` | Assistant messages include model metadata |
| `convertMessagesToOpenWebUIFormat_user_has_models_array` | User messages have models array |
| `convertOpenWebUIMessagesToSimple_extracts_role_content` | Converts back to simple format |
| `convertOpenWebUIMessagesToSimple_ignores_metadata` | Extra fields stripped |

### 2. Grading Utils

**File:** `src/app/utils/formatGradingRequest.test.ts`

| Test | Description |
|------|-------------|
| `formatGradingRequest_formats_user_as_learner` | User messages labeled "LEARNER:" |
| `formatGradingRequest_formats_assistant_as_resident` | Assistant messages labeled "RESIDENT:" |
| `formatGradingRequest_formats_scenario_as_action` | Scenario messages show as "[ACTION TAKEN]:" |
| `formatGradingRequest_excludes_system_messages` | System role messages not in transcript |
| `formatGradingRequest_includes_metadata_json` | Chat metadata block present |
| `prepareGradingMessages_returns_single_user_message` | Returns array with one user message |
| `prepareGradingMessages_logs_token_estimate` | Console logs prompt stats |

### 3. Lookup Utils

**File:** `src/app/utils/getAvatarById.test.ts`

| Test | Description |
|------|-------------|
| `getAvatarById_returns_avatar_for_valid_id` | ID "1" returns first avatar |
| `getAvatarById_returns_undefined_for_invalid_id` | ID "999" returns undefined |
| `getAvatarById_handles_string_ids` | String IDs work correctly |
| `AVATAR_LIST_has_expected_count` | List contains all avatars |

**File:** `src/app/utils/getChatMetadataById.test.ts`

| Test | Description |
|------|-------------|
| `getChatMetadataById_returns_metadata_for_valid_id` | Returns matching chat config |
| `getChatMetadataById_returns_undefined_for_invalid_id` | Unknown ID returns undefined |
| `getChatMetadataById_handles_undefined_input` | undefined input returns undefined |
| `CHAT_METADATA_LIST_has_all_conversations` | All unit conversations present |

---

## Redux Store Tests

### Preferences Slice

**File:** `src/app/store/preferences.slice.test.ts`

| Test | Description |
|------|-------------|
| `setUserAvatarId_updates_state` | Action updates userAvatarId |
| `setApiToken_stores_token` | Token stored in state |
| `setRefreshToken_stores_token` | Refresh token stored |
| `setSeenDialog_marks_dialog_seen` | Dialog marked as seen |
| `resetState_clears_all_preferences` | Reset returns to initial state |
| `setChatSettings_stores_settings` | Chat settings persisted |
| `getUserAvatar_selector_returns_avatar` | Selector looks up avatar |
| `getApiToken_selector_returns_token` | Selector returns token |

---

## Component Tests

### 1. Conversation Component

**File:** `src/app/components/conversation/Conversation.test.tsx`

| Test | Description |
|------|-------------|
| `renders_empty_state_with_no_messages` | No messages shows empty container |
| `renders_user_message_correctly` | User message styled as user |
| `renders_assistant_message_correctly` | Assistant message styled as assistant |
| `renders_scenario_message_with_special_styling` | Scenario has orange box styling |
| `scrolls_to_bottom_on_new_message` | Auto-scroll behavior works |
| `displays_avatar_for_each_message` | Avatars shown next to messages |

### 2. ChatMessageBox Component

**File:** `src/app/components/conversation/ChatMessageBox.test.tsx`

| Test | Description |
|------|-------------|
| `renders_message_content` | Content displayed |
| `renders_avatar_image` | Avatar shown |
| `applies_user_styling_for_user_role` | User messages right-aligned |
| `applies_assistant_styling_for_assistant_role` | Assistant messages left-aligned |
| `renders_markdown_content` | Markdown parsed and rendered |

### 3. GradingResults Component

**File:** `src/app/components/grading-results/GradingResults.test.tsx`

| Test | Description |
|------|-------------|
| `renders_overall_score` | Score displayed prominently |
| `renders_category_breakdown` | Individual categories shown |
| `renders_feedback_text` | Feedback text displayed |
| `handles_missing_optional_fields` | Graceful with partial data |

### 4. ForceLogin Component

**File:** `src/app/components/force-login/ForceLogin.test.tsx`

| Test | Description |
|------|-------------|
| `renders_children_when_authenticated` | Auth user sees content |
| `redirects_when_not_authenticated` | No auth redirects to login |
| `checks_both_tokens` | Both apiToken and refreshToken required |

### 5. AvatarImg Component

**File:** `src/app/components/avatar-img/AvatarImg.test.tsx`

| Test | Description |
|------|-------------|
| `renders_image_with_src` | Image src set correctly |
| `applies_size_prop` | Width/height applied |
| `handles_missing_avatar_gracefully` | Fallback for unknown avatar |

### 6. TutorDialogModal Component

**File:** `src/app/components/tutor-dialog-modal/TutorDialogModal.test.tsx`

| Test | Description |
|------|-------------|
| `shows_when_not_previously_seen` | Modal opens for new dialog |
| `hides_when_previously_seen` | Modal stays closed if seen |
| `dont_show_again_updates_state` | Checkbox persists preference |
| `close_button_dismisses_modal` | Close works |

---

## Functional Test Summary

| Category | Tests | Type |
|----------|-------|------|
| Message Converter Utils | 7 | Unit |
| Grading Utils | 7 | Unit |
| Lookup Utils (Avatar) | 4 | Unit |
| Lookup Utils (ChatMetadata) | 4 | Unit |
| Redux Preferences Slice | 8 | Unit |
| Conversation Component | 6 | Component |
| ChatMessageBox Component | 5 | Component |
| GradingResults Component | 4 | Component |
| ForceLogin Component | 3 | Component |
| AvatarImg Component | 3 | Component |
| TutorDialogModal Component | 4 | Component |
| **Total** | **55** | |

---

## Additional GitHub Issues for Functional Tests

### Issue 11: Set up Vitest infrastructure
- Install vitest, testing-library packages
- Create `vitest.config.ts`
- Create test setup file
- Add npm scripts
- Verify test runner works

### Issue 12: Unit tests - Message converter utils (7 tests)
- `openWebUiMessageConverter.test.ts`
- Test both conversion directions

### Issue 13: Unit tests - Grading utils (7 tests)
- `formatGradingRequest.test.ts`
- Test formatting and message preparation

### Issue 14: Unit tests - Lookup utils (8 tests)
- `getAvatarById.test.ts`
- `getChatMetadataById.test.ts`

### Issue 15: Unit tests - Redux preferences slice (8 tests)
- `preferences.slice.test.ts`
- Test actions and selectors

### Issue 16: Component tests - Conversation components (11 tests)
- `Conversation.test.tsx`
- `ChatMessageBox.test.tsx`

### Issue 17: Component tests - Grading & Auth components (10 tests)
- `GradingResults.test.tsx`
- `ForceLogin.test.tsx`

### Issue 18: Component tests - UI components (7 tests)
- `AvatarImg.test.tsx`
- `TutorDialogModal.test.tsx`

---

## Updated Execution Plan

### Phase 1: E2E Tests (Playwright)
1. Infrastructure setup (Issue 1)
2. Authentication tests (Issue 2)
3. Dashboard + Chat Creation (Issues 3-4)
4. Chat Interaction (Issue 5)
5. Help + Grading (Issues 6-7)
6. Chat List + Staff (Issues 8-9)
7. Onboarding (Issue 10)

### Phase 2: Functional Tests (Vitest)
8. Infrastructure setup (Issue 11)
9. Unit tests - Utils (Issues 12-14)
10. Unit tests - Redux (Issue 15)
11. Component tests (Issues 16-18)

---

## Complete Issue List

| # | Title | Type | Tests |
|---|-------|------|-------|
| 1 | Set up Playwright E2E infrastructure | E2E | - |
| 2 | E2E: Authentication tests | E2E | 6 |
| 3 | E2E: Dashboard & Navigation tests | E2E | 4 |
| 4 | E2E: Chat Creation tests | E2E | 6 |
| 5 | E2E: Chat Interaction tests | E2E | 7 |
| 6 | E2E: Help Feature tests | E2E | 4 |
| 7 | E2E: Grading tests | E2E | 6 |
| 8 | E2E: Chat List tests | E2E | 6 |
| 9 | E2E: Staff Features tests | E2E | 4 |
| 10 | E2E: Onboarding tests | E2E | 5 |
| 11 | Set up Vitest infrastructure | Unit | - |
| 12 | Unit: Message converter utils | Unit | 7 |
| 13 | Unit: Grading utils | Unit | 7 |
| 14 | Unit: Lookup utils | Unit | 8 |
| 15 | Unit: Redux preferences slice | Unit | 8 |
| 16 | Component: Conversation components | Component | 11 |
| 17 | Component: Grading & Auth components | Component | 10 |
| 18 | Component: UI components | Component | 7 |
| **Total** | | | **103 tests** |
