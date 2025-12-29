"""Characterization tests for LLM operations.

These tests document the CURRENT behavior of the LLM-related API endpoints:
- ChatSendMessageView (POST /api/chats/:id/send-message/)
- ChatGetHelpView (POST /api/chats/:id/get-help/)
- ChatGradeView (POST /api/chats/:id/grade/)

All OpenWebUI API calls are mocked - we test the view logic, not actual LLM responses.
"""

import pytest
from api.models import Chat

from .factories import ChatFactory, UserFactory


@pytest.mark.django_db
class TestSendMessage:
    """Tests for sending messages (POST /api/chats/:id/send-message/)."""

    def test_send_message_returns_202(
        self, authenticated_client_with_profile, user_with_profile
    ):
        """Valid message returns 202 Accepted (async processing)."""
        chat = ChatFactory(user=user_with_profile, messages=[])

        response = authenticated_client_with_profile.post(
            f'/api/chats/{chat.id}/send-message/',
            {'message': 'Hello, tutor!'},
            format='json',
        )

        assert response.status_code == 202
        assert response.data['status'] == 'success'
        assert response.data['processing'] is True
        assert 'chat' in response.data

    def test_send_message_sets_status_in_progress(
        self, authenticated_client_with_profile, user_with_profile
    ):
        """Chat.status is updated to in_progress when message sent."""
        chat = ChatFactory(
            user=user_with_profile,
            status=Chat.STATUS_READY,
            messages=[],
        )

        authenticated_client_with_profile.post(
            f'/api/chats/{chat.id}/send-message/',
            {'message': 'Hello'},
            format='json',
        )

        # Refresh from database
        chat.refresh_from_db()
        assert chat.status == Chat.STATUS_IN_PROGRESS

    def test_send_message_completed_chat_fails(
        self, authenticated_client_with_profile, user_with_profile
    ):
        """Cannot send messages to a completed chat."""
        chat = ChatFactory(
            user=user_with_profile,
            completed=True,
            messages=[{'role': 'user', 'content': 'Previous'}],
        )

        response = authenticated_client_with_profile.post(
            f'/api/chats/{chat.id}/send-message/',
            {'message': 'New message'},
            format='json',
        )

        assert response.status_code == 400
        assert response.data['status'] == 'fail'
        assert 'completed' in response.data['message'].lower()

    def test_send_message_graded_chat_fails(
        self, authenticated_client_with_profile, user_with_profile
    ):
        """Cannot send messages to a graded (complete status) chat."""
        chat = ChatFactory(
            user=user_with_profile,
            status=Chat.STATUS_COMPLETE,
            messages=[{'role': 'user', 'content': 'Previous'}],
        )

        response = authenticated_client_with_profile.post(
            f'/api/chats/{chat.id}/send-message/',
            {'message': 'New message'},
            format='json',
        )

        assert response.status_code == 400
        assert response.data['status'] == 'fail'
        assert 'completed' in response.data['message'].lower()

    def test_send_message_max_turns_enforced(
        self, authenticated_client_with_profile, user_with_profile
    ):
        """Fails when max_turns from course_data is exceeded."""
        chat = ChatFactory(
            user=user_with_profile,
            course_data={'unit': 'Test', 'max_turns': 2},
            messages=[
                {'role': 'user', 'content': 'First'},
                {'role': 'assistant', 'content': 'Response 1'},
                {'role': 'user', 'content': 'Second'},
                {'role': 'assistant', 'content': 'Response 2'},
            ],
        )

        response = authenticated_client_with_profile.post(
            f'/api/chats/{chat.id}/send-message/',
            {'message': 'Third message'},
            format='json',
        )

        assert response.status_code == 400
        assert response.data['status'] == 'fail'
        assert 'maximum turns' in response.data['message'].lower()

    def test_send_message_no_token_fails(self, authenticated_client, user):
        """Missing OpenWebUI token returns 401."""
        # User without profile (no openwebui_token)
        chat = ChatFactory(user=user, messages=[])

        response = authenticated_client.post(
            f'/api/chats/{chat.id}/send-message/',
            {'message': 'Hello'},
            format='json',
        )

        assert response.status_code == 401
        assert response.data['status'] == 'fail'
        assert response.data.get('error_code') == 'TOKEN_EXPIRED'
        assert 'token' in response.data['message'].lower()

    def test_send_message_empty_message_fails(
        self, authenticated_client_with_profile, user_with_profile
    ):
        """Empty message content returns 400."""
        chat = ChatFactory(user=user_with_profile, messages=[])

        response = authenticated_client_with_profile.post(
            f'/api/chats/{chat.id}/send-message/',
            {'message': ''},
            format='json',
        )

        assert response.status_code == 400
        assert response.data['status'] == 'fail'
        assert 'required' in response.data['message'].lower()

    def test_send_message_requires_authentication(self, api_client):
        """Unauthenticated requests are rejected."""
        user = UserFactory()
        chat = ChatFactory(user=user)

        response = api_client.post(
            f'/api/chats/{chat.id}/send-message/',
            {'message': 'Hello'},
            format='json',
        )

        assert response.status_code == 401


@pytest.mark.django_db
class TestGetHelp:
    """Tests for getting conversation help (POST /api/chats/:id/get-help/)."""

    def test_get_help_returns_202(
        self, authenticated_client_with_profile, user_with_profile
    ):
        """Valid help request returns 202 Accepted (async processing)."""
        chat = ChatFactory(
            user=user_with_profile,
            messages=[
                {'role': 'user', 'content': 'Hello'},
                {'role': 'assistant', 'content': 'Hi there!'},
            ],
        )

        response = authenticated_client_with_profile.post(
            f'/api/chats/{chat.id}/get-help/',
            {},
            format='json',
        )

        assert response.status_code == 202
        assert response.data['status'] == 'success'
        assert response.data['processing'] is True
        assert 'turn' in response.data

    def test_get_help_duplicate_turn_fails(
        self, authenticated_client_with_profile, user_with_profile
    ):
        """Cannot request help twice for the same turn (if first completed)."""
        chat = ChatFactory(
            user=user_with_profile,
            messages=[
                {'role': 'user', 'content': 'Hello'},
                {'role': 'assistant', 'content': 'Hi there!'},
            ],
            help_responses=[
                {
                    'turn': 1,
                    'help_text': 'Previous help',
                    'status': 'completed',
                },
            ],
        )

        response = authenticated_client_with_profile.post(
            f'/api/chats/{chat.id}/get-help/',
            {},
            format='json',
        )

        assert response.status_code == 400
        assert response.data['status'] == 'fail'
        assert 'already' in response.data['message'].lower()

    def test_get_help_processing_returns_202(
        self, authenticated_client_with_profile, user_with_profile
    ):
        """Second request during processing returns 202 (still processing)."""
        chat = ChatFactory(
            user=user_with_profile,
            messages=[
                {'role': 'user', 'content': 'Hello'},
                {'role': 'assistant', 'content': 'Hi there!'},
            ],
            help_responses=[
                {
                    'turn': 1,
                    'help_text': '',
                    'status': 'processing',
                },
            ],
        )

        response = authenticated_client_with_profile.post(
            f'/api/chats/{chat.id}/get-help/',
            {},
            format='json',
        )

        assert response.status_code == 202
        assert response.data['status'] == 'success'
        assert response.data['processing'] is True

    def test_get_help_no_messages_fails(
        self, authenticated_client_with_profile, user_with_profile
    ):
        """Cannot get help for empty conversation."""
        chat = ChatFactory(user=user_with_profile, messages=[])

        response = authenticated_client_with_profile.post(
            f'/api/chats/{chat.id}/get-help/',
            {},
            format='json',
        )

        assert response.status_code == 400
        assert response.data['status'] == 'fail'
        assert 'no conversation' in response.data['message'].lower()

    def test_get_help_no_token_fails(self, authenticated_client, user):
        """Missing OpenWebUI token returns 401."""
        # User without profile (no openwebui_token)
        chat = ChatFactory(
            user=user,
            messages=[{'role': 'user', 'content': 'Hello'}],
        )

        response = authenticated_client.post(
            f'/api/chats/{chat.id}/get-help/',
            {},
            format='json',
        )

        assert response.status_code == 401
        assert response.data.get('error_code') == 'TOKEN_EXPIRED'

    def test_get_help_requires_authentication(self, api_client):
        """Unauthenticated requests are rejected."""
        user = UserFactory()
        chat = ChatFactory(user=user, messages=[{'role': 'user', 'content': 'Hi'}])

        response = api_client.post(f'/api/chats/{chat.id}/get-help/', {}, format='json')

        assert response.status_code == 401


@pytest.mark.django_db
class TestGrade:
    """Tests for grading chats (POST /api/chats/:id/grade/)."""

    def test_grade_returns_202(
        self, authenticated_client_with_profile, user_with_profile
    ):
        """Valid grade request returns 202 Accepted (async processing)."""
        chat = ChatFactory(
            user=user_with_profile,
            messages=[
                {'role': 'user', 'content': 'Hello'},
                {'role': 'assistant', 'content': 'Hi there!'},
            ],
        )

        response = authenticated_client_with_profile.post(
            f'/api/chats/{chat.id}/grade/',
            {},
            format='json',
        )

        assert response.status_code == 202
        assert response.data['status'] == 'success'
        assert response.data['processing'] is True

    def test_grade_sets_status_grading(
        self, authenticated_client_with_profile, user_with_profile
    ):
        """Chat.status is updated to grading when grade request starts."""
        chat = ChatFactory(
            user=user_with_profile,
            status=Chat.STATUS_READY,
            messages=[{'role': 'user', 'content': 'Hello'}],
        )

        authenticated_client_with_profile.post(
            f'/api/chats/{chat.id}/grade/',
            {},
            format='json',
        )

        chat.refresh_from_db()
        assert chat.status == Chat.STATUS_GRADING

    def test_grade_already_graded_returns_existing(
        self, authenticated_client_with_profile, user_with_profile
    ):
        """Re-grading returns cached/existing result."""
        chat = ChatFactory(
            user=user_with_profile,
            messages=[{'role': 'user', 'content': 'Hello'}],
            grading_data={
                'score': 85,
                'feedback': 'Good job!',
            },
        )

        response = authenticated_client_with_profile.post(
            f'/api/chats/{chat.id}/grade/',
            {},
            format='json',
        )

        assert response.status_code == 200
        assert response.data['status'] == 'success'
        assert 'already graded' in response.data['message'].lower()
        assert response.data['grading']['score'] == 85

    def test_grade_failed_can_retry(
        self, authenticated_client_with_profile, user_with_profile
    ):
        """Failed grading allows retry."""
        chat = ChatFactory(
            user=user_with_profile,
            messages=[{'role': 'user', 'content': 'Hello'}],
            grading_data={
                'status': 'failed',
                'error': 'API timeout',
            },
        )

        response = authenticated_client_with_profile.post(
            f'/api/chats/{chat.id}/grade/',
            {},
            format='json',
        )

        # Should allow retry and return 202
        assert response.status_code == 202
        assert response.data['processing'] is True

    def test_grade_in_progress_returns_202(
        self, authenticated_client_with_profile, user_with_profile
    ):
        """Second request during grading returns 202 (still processing)."""
        chat = ChatFactory(
            user=user_with_profile,
            status=Chat.STATUS_GRADING,
            messages=[{'role': 'user', 'content': 'Hello'}],
        )

        response = authenticated_client_with_profile.post(
            f'/api/chats/{chat.id}/grade/',
            {},
            format='json',
        )

        assert response.status_code == 202
        assert response.data['status'] == 'success'
        assert response.data['processing'] is True
        assert 'still in progress' in response.data['message'].lower()

    def test_grade_no_messages_fails(
        self, authenticated_client_with_profile, user_with_profile
    ):
        """Cannot grade empty conversation."""
        chat = ChatFactory(user=user_with_profile, messages=[])

        response = authenticated_client_with_profile.post(
            f'/api/chats/{chat.id}/grade/',
            {},
            format='json',
        )

        assert response.status_code == 400
        assert response.data['status'] == 'fail'
        assert 'no conversation' in response.data['message'].lower()

    def test_grade_no_token_fails(self, authenticated_client, user):
        """Missing OpenWebUI token returns 401."""
        # User without profile (no openwebui_token)
        chat = ChatFactory(
            user=user,
            messages=[{'role': 'user', 'content': 'Hello'}],
        )

        response = authenticated_client.post(
            f'/api/chats/{chat.id}/grade/',
            {},
            format='json',
        )

        assert response.status_code == 401
        assert response.data.get('error_code') == 'TOKEN_EXPIRED'

    def test_grade_requires_authentication(self, api_client):
        """Unauthenticated requests are rejected."""
        user = UserFactory()
        chat = ChatFactory(user=user, messages=[{'role': 'user', 'content': 'Hi'}])

        response = api_client.post(f'/api/chats/{chat.id}/grade/', {}, format='json')

        assert response.status_code == 401
