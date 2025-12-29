"""Tests for API utility functions."""

import pytest
from api.models import Chat
from api.utils import (
    check_chat_not_completed,
    check_max_turns_not_exceeded,
    format_conversation_for_llm,
    get_openwebui_token,
    get_pagination_data,
)
from django.contrib.auth.models import User
from rest_framework.test import APIRequestFactory


@pytest.fixture
def factory():
    """Create API request factory."""
    return APIRequestFactory()


@pytest.fixture
def user(db):
    """Create test user."""
    return User.objects.create_user(
        username='testuser',
        email='test@example.com',
        password='testpass123',
    )


@pytest.fixture
def chat(db, user):
    """Create test chat."""
    return Chat.objects.create(
        user=user,
        title='Test Chat',
        messages=[
            {'role': 'user', 'content': 'Hello'},
            {'role': 'assistant', 'content': 'Hi there!'},
        ],
        course_data={'course_name': 'Test Course'},
        avatar_id='test_avatar',
    )


class TestGetPaginationData:
    """Tests for get_pagination_data utility."""

    def test_default_pagination(self, factory):
        """Test default pagination values."""
        request = factory.get('/')
        result = get_pagination_data(request, 100)

        assert result['page'] == 1
        assert result['page_size'] == 10
        assert result['total_items'] == 100
        assert result['total_pages'] == 10
        assert result['start_index'] == 0
        assert result['end_index'] == 10
        assert result['start_item'] == 1
        assert result['end_item'] == 10
        assert result['next_page'] == 2
        assert result['prev_page'] is None

    def test_custom_page(self, factory):
        """Test custom page number."""
        request = factory.get('/?page=3')
        result = get_pagination_data(request, 100)

        assert result['page'] == 3
        assert result['start_index'] == 20
        assert result['end_index'] == 30
        assert result['next_page'] == 4
        assert result['prev_page'] == 2

    def test_custom_page_size(self, factory):
        """Test custom page size."""
        request = factory.get('/?page_size=25')
        result = get_pagination_data(request, 100)

        assert result['page_size'] == 25
        assert result['total_pages'] == 4
        assert result['end_index'] == 25

    def test_last_page(self, factory):
        """Test last page has no next_page."""
        request = factory.get('/?page=10')
        result = get_pagination_data(request, 100)

        assert result['page'] == 10
        assert result['next_page'] is None
        assert result['prev_page'] == 9

    def test_empty_results(self, factory):
        """Test pagination with zero items."""
        request = factory.get('/')
        result = get_pagination_data(request, 0)

        assert result['total_items'] == 0
        assert result['total_pages'] == 1
        assert result['start_item'] == 0
        assert result['end_item'] == 0

    def test_invalid_page_defaults_to_one(self, factory):
        """Test invalid page number defaults to 1."""
        request = factory.get('/?page=invalid')
        result = get_pagination_data(request, 100)

        assert result['page'] == 1

    def test_negative_page_defaults_to_one(self, factory):
        """Test negative page number defaults to 1."""
        request = factory.get('/?page=-5')
        result = get_pagination_data(request, 100)

        assert result['page'] == 1

    def test_zero_page_size_defaults_to_ten(self, factory):
        """Test zero page size defaults to 10."""
        request = factory.get('/?page_size=0')
        result = get_pagination_data(request, 100)

        assert result['page_size'] == 10


class TestCheckChatNotCompleted:
    """Tests for check_chat_not_completed utility."""

    def test_active_chat_returns_none(self, chat):
        """Test that active chat returns None (no error)."""
        result = check_chat_not_completed(chat)
        assert result is None

    def test_completed_chat_returns_error(self, chat):
        """Test that completed chat returns error response."""
        chat.completed = True
        chat.save()

        result = check_chat_not_completed(chat)
        assert result is not None
        assert result.status_code == 400
        assert result.data['status'] == 'fail'
        assert 'completed or graded' in result.data['message']

    def test_graded_chat_returns_error(self, chat):
        """Test that graded chat (status=complete) returns error."""
        chat.status = Chat.STATUS_COMPLETE
        chat.save()

        result = check_chat_not_completed(chat)
        assert result is not None
        assert result.status_code == 400

    def test_custom_action_description(self, chat):
        """Test custom action description in error message."""
        chat.completed = True
        chat.save()

        result = check_chat_not_completed(chat, 'send messages to')
        assert 'send messages to' in result.data['message']


class TestCheckMaxTurnsNotExceeded:
    """Tests for check_max_turns_not_exceeded utility."""

    def test_no_max_turns_returns_none(self, chat):
        """Test that chat without max_turns returns None."""
        result = check_max_turns_not_exceeded(chat)
        assert result is None

    def test_under_max_turns_returns_none(self, chat):
        """Test that chat under max turns returns None."""
        chat.course_data = {'max_turns': 10}
        chat.messages = [{'role': 'user', 'content': 'Hello'}]
        chat.save()

        result = check_max_turns_not_exceeded(chat)
        assert result is None

    def test_at_max_turns_returns_error(self, chat):
        """Test that chat at max turns returns error."""
        chat.course_data = {'max_turns': 2}
        chat.messages = [
            {'role': 'user', 'content': 'Hello'},
            {'role': 'assistant', 'content': 'Hi'},
            {'role': 'user', 'content': 'How are you?'},
        ]
        chat.save()

        result = check_max_turns_not_exceeded(chat)
        assert result is not None
        assert result.status_code == 400
        assert 'Maximum turns' in result.data['message']

    def test_no_course_data_returns_none(self, chat):
        """Test that chat without course_data returns None."""
        chat.course_data = None
        chat.save()

        result = check_max_turns_not_exceeded(chat)
        assert result is None


class TestFormatConversationForLLM:
    """Tests for format_conversation_for_llm utility."""

    def test_basic_formatting(self, chat):
        """Test basic conversation formatting."""
        result = format_conversation_for_llm(chat)

        assert 'CONVERSATION METADATA:' in result
        assert 'CONVERSATION TRANSCRIPT:' in result
        assert 'Test Chat' in result
        assert 'User: Hello' in result
        assert 'Resident: Hi there!' in result

    def test_json_metadata(self, chat):
        """Test that metadata is JSON formatted by default."""
        result = format_conversation_for_llm(chat)

        # Should contain JSON structure
        assert '"title": "Test Chat"' in result
        assert '"avatar_id": "test_avatar"' in result

    def test_without_json_metadata(self, chat):
        """Test formatting without JSON metadata."""
        result = format_conversation_for_llm(chat, include_json_metadata=False)

        # Should not contain JSON quotes but still have metadata
        assert 'Test Chat' in result
        assert '"title"' not in result

    def test_empty_messages(self, user, db):
        """Test formatting with empty messages."""
        chat = Chat.objects.create(
            user=user,
            title='Empty Chat',
            messages=[],
        )

        result = format_conversation_for_llm(chat)
        assert 'CONVERSATION TRANSCRIPT:' in result
        assert 'Empty Chat' in result


class TestGetOpenwebuiToken:
    """Tests for get_openwebui_token utility."""

    def test_missing_profile_returns_error(self, user):
        """Test that user without profile returns error."""
        # Delete profile if it exists
        if hasattr(user, 'profile'):
            user.profile.delete()
            user.refresh_from_db()

        token, error = get_openwebui_token(user)
        assert token is None
        assert error is not None
        assert error.status_code == 401
        assert error.data['error_code'] == 'TOKEN_EXPIRED'

    def test_empty_token_returns_error(self, user):
        """Test that empty token returns error."""
        # Ensure profile exists with empty token
        from api.models import UserProfile

        UserProfile.objects.get_or_create(user=user, defaults={'openwebui_token': ''})
        user.profile.openwebui_token = ''
        user.profile.save()

        token, error = get_openwebui_token(user)
        assert token is None
        assert error is not None
        assert error.status_code == 401

    def test_valid_token_returns_token(self, user):
        """Test that valid token is returned."""
        from api.models import UserProfile

        profile, _ = UserProfile.objects.get_or_create(user=user)
        profile.openwebui_token = 'valid_test_token'
        profile.save()

        token, error = get_openwebui_token(user)
        assert token == 'valid_test_token'
        assert error is None
