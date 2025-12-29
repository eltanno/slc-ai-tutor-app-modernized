"""Characterization tests for background tasks.

These tests document the CURRENT behavior of the background task functions:
- process_chat_message_async: Sends messages to LLM and stores responses
- process_help_request_async: Gets help from tutor and stores in help_responses
- process_grading_async: Grades conversation and stores results

All OpenWebUI API calls are mocked. We test database updates directly.
"""

import threading
from unittest.mock import MagicMock, patch

import pytest
from api.background_tasks import (
    process_chat_message_async,
    process_grading_async,
    process_help_request_async,
)
from api.models import Chat

from .factories import ChatFactory, UserProfileFactory


class SyncThread:
    """Mock Thread class that runs target synchronously for testing."""

    def __init__(self, target, daemon=None):
        self.target = target
        self.daemon = daemon

    def start(self):
        self.target()


@pytest.fixture
def sync_threads():
    """Patch threading.Thread to run synchronously."""
    with patch.object(threading, 'Thread', SyncThread):
        yield


@pytest.mark.django_db
class TestProcessChatMessageAsync:
    """Tests for process_chat_message_async background task."""

    def test_process_message_updates_chat(self, sync_threads):
        """After completion, chat has assistant response in messages."""
        profile = UserProfileFactory(openwebui_token='test-token')
        chat = ChatFactory(
            user=profile.user,
            messages=[],
            status=Chat.STATUS_READY,
        )

        with patch('api.background_tasks.OpenWebUIClient') as mock_client_class:
            mock_client = MagicMock()
            mock_client.get_conversation_response.return_value = (
                'Hello! How can I help?'
            )
            mock_client_class.return_value = mock_client

            process_chat_message_async(
                chat_id=chat.id,
                user_message='Hi there',
                openwebui_token='test-token',
            )

        chat.refresh_from_db()

        # Verify messages were updated
        assert len(chat.messages) == 2
        assert chat.messages[0]['role'] == 'user'
        assert chat.messages[0]['content'] == 'Hi there'
        assert chat.messages[1]['role'] == 'assistant'
        assert chat.messages[1]['content'] == 'Hello! How can I help?'

        # Status should be back to ready
        assert chat.status == Chat.STATUS_READY

        # Interaction count should be updated
        assert chat.interaction_count == 1

    def test_process_message_error_stored(self, sync_threads):
        """LLM error is stored in messages as system message."""
        profile = UserProfileFactory(openwebui_token='test-token')
        chat = ChatFactory(
            user=profile.user,
            messages=[{'role': 'user', 'content': 'Previous message'}],
            status=Chat.STATUS_IN_PROGRESS,
        )

        with patch('api.background_tasks.OpenWebUIClient') as mock_client_class:
            mock_client = MagicMock()
            mock_client.get_conversation_response.side_effect = Exception('API timeout')
            mock_client_class.return_value = mock_client

            process_chat_message_async(
                chat_id=chat.id,
                user_message='New message',
                openwebui_token='test-token',
            )

        chat.refresh_from_db()

        # Error should be stored as system message
        last_message = chat.messages[-1]
        assert last_message['role'] == 'system'
        assert 'error' in last_message['content'].lower()
        assert 'API timeout' in last_message['content']

        # Status should be reset to ready
        assert chat.status == Chat.STATUS_READY


@pytest.mark.django_db
class TestProcessHelpRequestAsync:
    """Tests for process_help_request_async background task."""

    def test_process_help_updates_help_responses(self, sync_threads):
        """Help text is added to help_responses array."""
        profile = UserProfileFactory(openwebui_token='test-token')
        chat = ChatFactory(
            user=profile.user,
            messages=[
                {'role': 'user', 'content': 'Hello'},
                {'role': 'assistant', 'content': 'Hi there!'},
            ],
            help_responses=[],
            status=Chat.STATUS_READY,
        )

        with patch('api.background_tasks.OpenWebUIClient') as mock_client_class:
            mock_client = MagicMock()
            mock_client.get_help_response.return_value = (
                'Try asking about the topic more directly.'
            )
            mock_client_class.return_value = mock_client

            process_help_request_async(
                chat_id=chat.id,
                user_token='test-token',
            )

        chat.refresh_from_db()

        # Help response should be added
        assert len(chat.help_responses) == 1
        help_entry = chat.help_responses[0]
        assert help_entry['turn'] == 1
        assert help_entry['status'] == 'completed'
        assert help_entry['help_text'] == 'Try asking about the topic more directly.'

        # Status should be back to ready
        assert chat.status == Chat.STATUS_READY


@pytest.mark.django_db
class TestProcessGradingAsync:
    """Tests for process_grading_async background task."""

    def test_process_grading_sets_score(self, sync_threads):
        """grading_data and score are populated after grading."""
        profile = UserProfileFactory(openwebui_token='test-token')
        chat = ChatFactory(
            user=profile.user,
            messages=[
                {'role': 'user', 'content': 'I will help you today'},
                {'role': 'assistant', 'content': 'Thank you!'},
            ],
            status=Chat.STATUS_GRADING,
            grading_data=None,
            score=None,
        )

        grading_result = {
            'score': {'percentage': 85, 'grade': 'B'},
            'feedback': 'Good communication skills.',
            'strengths': ['Clear communication'],
            'areas_for_improvement': ['Could be more specific'],
        }

        with patch('api.background_tasks.OpenWebUIClient') as mock_client_class:
            mock_client = MagicMock()
            mock_client.get_grading_response.return_value = grading_result
            mock_client_class.return_value = mock_client

            process_grading_async(
                chat_id=chat.id,
                openwebui_token='test-token',
            )

        chat.refresh_from_db()

        # Grading data should be stored
        assert chat.grading_data == grading_result
        assert chat.score == 85

    def test_process_grading_marks_complete(self, sync_threads):
        """Chat.completed=True and status=complete after grading."""
        profile = UserProfileFactory(openwebui_token='test-token')
        chat = ChatFactory(
            user=profile.user,
            messages=[{'role': 'user', 'content': 'Hello'}],
            status=Chat.STATUS_GRADING,
            completed=False,
        )

        grading_result = {
            'score': {'percentage': 75},
            'feedback': 'Decent effort.',
        }

        with patch('api.background_tasks.OpenWebUIClient') as mock_client_class:
            mock_client = MagicMock()
            mock_client.get_grading_response.return_value = grading_result
            mock_client_class.return_value = mock_client

            process_grading_async(
                chat_id=chat.id,
                openwebui_token='test-token',
            )

        chat.refresh_from_db()

        # Chat should be marked complete
        assert chat.completed is True
        assert chat.status == Chat.STATUS_COMPLETE

    def test_process_grading_error_stored(self, sync_threads):
        """Failed grading stores error in grading_data."""
        profile = UserProfileFactory(openwebui_token='test-token')
        chat = ChatFactory(
            user=profile.user,
            messages=[{'role': 'user', 'content': 'Hello'}],
            status=Chat.STATUS_GRADING,
            grading_data=None,
        )

        with patch('api.background_tasks.OpenWebUIClient') as mock_client_class:
            mock_client = MagicMock()
            mock_client.get_grading_response.side_effect = Exception(
                'Grading service unavailable'
            )
            mock_client_class.return_value = mock_client

            process_grading_async(
                chat_id=chat.id,
                openwebui_token='test-token',
            )

        chat.refresh_from_db()

        # Error should be stored in grading_data
        assert chat.grading_data['status'] == 'failed'
        assert 'Grading service unavailable' in chat.grading_data['error']

        # Status should be reset to ready_for_grading (allow retry)
        assert chat.status == Chat.STATUS_READY_FOR_GRADING
