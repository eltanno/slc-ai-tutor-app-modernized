"""
Characterization tests for OpenWebUI client.

These tests verify the current behavior of the OpenWebUI API client,
including authentication, chat completion, and error handling.
"""

from unittest.mock import patch

import pytest
import responses
from api.models import UserProfile
from api.openwebui_client import OpenWebUIClient
from django.contrib.auth.models import User


@pytest.fixture
def mock_user(db):
    """Create a user with profile for testing."""
    user = User.objects.create_user(
        username='testuser', email='test@example.com', password='testpass123'
    )
    UserProfile.objects.create(user=user, openwebui_token='existing-token-123')
    return user


@pytest.fixture
def client_with_token():
    """Create client with token but no user."""
    return OpenWebUIClient(user_token='test-token-456')


@pytest.fixture
def client_with_user(mock_user):
    """Create client with user (gets token from profile)."""
    return OpenWebUIClient(user=mock_user)


class TestOpenWebUIClientInit:
    """Tests for client initialization."""

    def test_init_with_token_only(self):
        """Client can be initialized with just a token."""
        client = OpenWebUIClient(user_token='my-token')
        assert client.user_token == 'my-token'  # noqa: S105
        assert client.user is None

    def test_init_with_user_gets_token_from_profile(self, mock_user):
        """Client gets token from user profile if available."""
        client = OpenWebUIClient(user=mock_user)
        assert client.user_token == 'existing-token-123'  # noqa: S105
        assert client.user == mock_user

    def test_init_with_user_and_token_uses_provided_token(self, mock_user):
        """Provided token overrides profile token."""
        client = OpenWebUIClient(user=mock_user, user_token='override-token')
        assert client.user_token == 'override-token'  # noqa: S105

    def test_init_with_user_without_profile(self, db):
        """Client handles user without profile gracefully."""
        user = User.objects.create_user(
            username='noprofile', email='noprofile@example.com', password='testpass123'
        )
        client = OpenWebUIClient(user=user)
        assert client.user_token is None

    def test_init_uses_env_base_url(self):
        """Client uses OPENWEBUI_BASE_URL from environment."""
        with patch.dict('os.environ', {'OPENWEBUI_BASE_URL': 'http://custom:9000'}):
            client = OpenWebUIClient()
            assert client.base_url == 'http://custom:9000'

    def test_init_default_base_url(self):
        """Client defaults to localhost:8080."""
        with patch.dict('os.environ', {}, clear=True):
            # Remove OPENWEBUI_BASE_URL if it exists
            import os

            old_val = os.environ.pop('OPENWEBUI_BASE_URL', None)
            try:
                client = OpenWebUIClient()
                assert client.base_url == 'http://localhost:8080'
            finally:
                if old_val:
                    os.environ['OPENWEBUI_BASE_URL'] = old_val


class TestGetHeaders:
    """Tests for _get_headers method."""

    def test_headers_with_token(self, client_with_token):
        """Headers include Authorization when token is set."""
        headers = client_with_token._get_headers()
        assert headers['Content-Type'] == 'application/json'
        assert headers['Authorization'] == 'Bearer test-token-456'

    def test_headers_without_token(self):
        """Headers don't include Authorization when no token."""
        client = OpenWebUIClient()
        headers = client._get_headers()
        assert headers['Content-Type'] == 'application/json'
        assert 'Authorization' not in headers


class TestLogin:
    """Tests for login method."""

    @responses.activate
    def test_login_success(self):
        """Successful login returns token."""
        responses.add(
            responses.POST,
            'http://localhost:8080/api/v1/auths/signin',
            json={'token': 'new-token-789'},
            status=200,
        )

        client = OpenWebUIClient()
        token = client.login('user@example.com', 'password123')

        assert token == 'new-token-789'  # noqa: S105
        assert client.user_token == 'new-token-789'  # noqa: S105

    @responses.activate
    def test_login_saves_token_to_profile(self, mock_user):
        """Login saves token to user profile."""
        responses.add(
            responses.POST,
            'http://localhost:8080/api/v1/auths/signin',
            json={'token': 'new-token-from-login'},
            status=200,
        )

        client = OpenWebUIClient(user=mock_user)
        client.login('user@example.com', 'password123')

        # Refresh from database
        mock_user.profile.refresh_from_db()
        assert mock_user.profile.openwebui_token == 'new-token-from-login'  # noqa: S105

    @responses.activate
    def test_login_creates_profile_if_missing(self, db):
        """Login creates profile if user doesn't have one."""
        user = User.objects.create_user(
            username='noprofile2',
            email='noprofile2@example.com',
            password='testpass123',
        )

        responses.add(
            responses.POST,
            'http://localhost:8080/api/v1/auths/signin',
            json={'token': 'created-profile-token'},
            status=200,
        )

        client = OpenWebUIClient(user=user)
        client.login('user@example.com', 'password123')

        # Profile should now exist
        user.refresh_from_db()
        assert hasattr(user, 'profile')
        assert user.profile.openwebui_token == 'created-profile-token'  # noqa: S105

    @responses.activate
    def test_login_no_token_in_response(self):
        """Login raises error when response has no token."""
        responses.add(
            responses.POST,
            'http://localhost:8080/api/v1/auths/signin',
            json={'error': 'something'},
            status=200,
        )

        client = OpenWebUIClient()
        with pytest.raises(ValueError, match='No token returned'):
            client.login('user@example.com', 'password123')

    @responses.activate
    def test_login_auth_failure(self):
        """Login raises error on authentication failure."""
        import requests

        responses.add(
            responses.POST,
            'http://localhost:8080/api/v1/auths/signin',
            json={'error': 'Invalid credentials'},
            status=401,
        )

        client = OpenWebUIClient()
        with pytest.raises(requests.exceptions.HTTPError):
            client.login('user@example.com', 'wrongpassword')

    @responses.activate
    def test_login_network_error(self):
        """Login raises error on network failure."""
        import requests

        responses.add(
            responses.POST,
            'http://localhost:8080/api/v1/auths/signin',
            body=requests.exceptions.ConnectionError('Connection refused'),
        )

        client = OpenWebUIClient()
        with pytest.raises(requests.exceptions.ConnectionError):
            client.login('user@example.com', 'password123')


class TestChatCompletion:
    """Tests for chat_completion method."""

    @responses.activate
    def test_chat_completion_success(self, client_with_token):
        """Successful chat completion returns response."""
        responses.add(
            responses.POST,
            'http://localhost:8080/api/chat/completions',
            json={'choices': [{'message': {'role': 'assistant', 'content': 'Hello!'}}]},
            status=200,
        )

        result = client_with_token.chat_completion(
            model='test-model', messages=[{'role': 'user', 'content': 'Hi'}]
        )

        assert result['choices'][0]['message']['content'] == 'Hello!'

    @responses.activate
    def test_chat_completion_with_optional_params(self, client_with_token):
        """Chat completion includes optional parameters."""
        responses.add(
            responses.POST,
            'http://localhost:8080/api/chat/completions',
            json={'choices': [{'message': {'content': 'Response'}}]},
            status=200,
        )

        client_with_token.chat_completion(
            model='test-model',
            messages=[{'role': 'user', 'content': 'Hi'}],
            temperature=0.5,
            max_tokens=100,
            timeout=60,
        )

        # Check request body
        request_body = responses.calls[0].request.body
        import json

        body = json.loads(request_body)
        assert body['temperature'] == 0.5
        assert body['max_tokens'] == 100

    @responses.activate
    def test_chat_completion_401_no_user_raises(self, client_with_token):
        """401 error without user raises exception."""
        responses.add(
            responses.POST,
            'http://localhost:8080/api/chat/completions',
            json={'error': 'Unauthorized'},
            status=401,
        )

        with pytest.raises(Exception, match=r'token expired.*no user'):
            client_with_token.chat_completion(
                model='test-model', messages=[{'role': 'user', 'content': 'Hi'}]
            )

    @responses.activate
    def test_chat_completion_401_with_user_raises_reauth_needed(self, client_with_user):
        """401 error with user indicates re-authentication needed."""
        responses.add(
            responses.POST,
            'http://localhost:8080/api/chat/completions',
            json={'error': 'Unauthorized'},
            status=401,
        )

        with pytest.raises(Exception, match='needs to log in again'):
            client_with_user.chat_completion(
                model='test-model', messages=[{'role': 'user', 'content': 'Hi'}]
            )

    @responses.activate
    def test_chat_completion_timeout(self, client_with_token):
        """Timeout raises appropriate exception."""
        import requests as req_lib

        responses.add(
            responses.POST,
            'http://localhost:8080/api/chat/completions',
            body=req_lib.exceptions.Timeout('Request timed out'),
        )

        with pytest.raises(Exception, match='timed out'):
            client_with_token.chat_completion(
                model='test-model',
                messages=[{'role': 'user', 'content': 'Hi'}],
                timeout=1,
            )

    @responses.activate
    def test_chat_completion_server_error(self, client_with_token):
        """Server error returns detailed error message."""
        responses.add(
            responses.POST,
            'http://localhost:8080/api/chat/completions',
            json={'detail': 'Internal server error'},
            status=500,
        )

        with pytest.raises(Exception, match='500'):
            client_with_token.chat_completion(
                model='test-model', messages=[{'role': 'user', 'content': 'Hi'}]
            )

    @responses.activate
    def test_chat_completion_extracts_error_detail(self, client_with_token):
        """Error extraction from various response formats."""
        responses.add(
            responses.POST,
            'http://localhost:8080/api/chat/completions',
            json={'error': {'message': 'Detailed error message'}},
            status=400,
        )

        with pytest.raises(Exception, match='Detailed error message'):
            client_with_token.chat_completion(
                model='test-model', messages=[{'role': 'user', 'content': 'Hi'}]
            )


class TestGetConversationResponse:
    """Tests for get_conversation_response method."""

    @responses.activate
    def test_get_conversation_response_success(self, client_with_token):
        """Successful conversation response extracts content."""
        responses.add(
            responses.POST,
            'http://localhost:8080/api/chat/completions',
            json={
                'choices': [
                    {'message': {'role': 'assistant', 'content': 'How can I help you?'}}
                ]
            },
            status=200,
        )

        result = client_with_token.get_conversation_response(
            model='slc-resident', messages=[{'role': 'user', 'content': 'Hello'}]
        )

        assert result == 'How can I help you?'

    @responses.activate
    def test_get_conversation_response_skips_invalid_messages(self, client_with_token):
        """Invalid messages are filtered out."""
        responses.add(
            responses.POST,
            'http://localhost:8080/api/chat/completions',
            json={
                'choices': [{'message': {'role': 'assistant', 'content': 'Response'}}]
            },
            status=200,
        )

        # Include some invalid messages
        messages = [
            {'role': 'user', 'content': 'Valid message'},
            {'role': 'user'},  # Missing content
            {'content': 'Missing role'},  # Missing role
            {'role': 'assistant', 'content': 'Also valid'},
        ]

        client_with_token.get_conversation_response(
            model='slc-resident', messages=messages
        )

        # Check only valid messages were sent
        import json

        request_body = json.loads(responses.calls[0].request.body)
        assert len(request_body['messages']) == 2

    @responses.activate
    def test_get_conversation_response_missing_choices(self, client_with_token):
        """Missing choices field raises exception."""
        responses.add(
            responses.POST,
            'http://localhost:8080/api/chat/completions',
            json={'result': 'something'},
            status=200,
        )

        with pytest.raises(Exception, match="missing 'choices'"):
            client_with_token.get_conversation_response(
                model='slc-resident', messages=[{'role': 'user', 'content': 'Hello'}]
            )

    @responses.activate
    def test_get_conversation_response_empty_choices(self, client_with_token):
        """Empty choices array raises exception."""
        responses.add(
            responses.POST,
            'http://localhost:8080/api/chat/completions',
            json={'choices': []},
            status=200,
        )

        with pytest.raises(Exception, match='No choices returned'):
            client_with_token.get_conversation_response(
                model='slc-resident', messages=[{'role': 'user', 'content': 'Hello'}]
            )

    @responses.activate
    def test_get_conversation_response_invalid_structure(self, client_with_token):
        """Invalid response structure raises exception."""
        responses.add(
            responses.POST,
            'http://localhost:8080/api/chat/completions',
            json={'choices': [{'wrong': 'structure'}]},
            status=200,
        )

        with pytest.raises(Exception, match='Invalid response structure'):
            client_with_token.get_conversation_response(
                model='slc-resident', messages=[{'role': 'user', 'content': 'Hello'}]
            )


class TestGetHelpResponse:
    """Tests for get_help_response method."""

    @responses.activate
    def test_get_help_response_success(self, client_with_token):
        """Successful help response extracts content."""
        responses.add(
            responses.POST,
            'http://localhost:8080/api/chat/completions',
            json={'choices': [{'message': {'content': 'Here is some help text.'}}]},
            status=200,
        )

        result = client_with_token.get_help_response(
            messages=[{'role': 'user', 'content': 'Help me'}]
        )

        assert result == 'Here is some help text.'

        # Verify correct model and temperature
        import json

        request_body = json.loads(responses.calls[0].request.body)
        assert request_body['model'] == 'slc-conversation-helper'
        assert request_body['temperature'] == 0.7

    @responses.activate
    def test_get_help_response_invalid_format(self, client_with_token):
        """Invalid help response raises exception."""
        responses.add(
            responses.POST,
            'http://localhost:8080/api/chat/completions',
            json={'not': 'valid'},
            status=200,
        )

        with pytest.raises(Exception, match='Invalid response format'):
            client_with_token.get_help_response(
                messages=[{'role': 'user', 'content': 'Help'}]
            )

    @responses.activate
    def test_get_help_response_extraction_error(self, client_with_token):
        """Failed content extraction raises exception."""
        responses.add(
            responses.POST,
            'http://localhost:8080/api/chat/completions',
            json={'choices': [{'bad': 'structure'}]},
            status=200,
        )

        with pytest.raises(Exception, match='Invalid help response structure'):
            client_with_token.get_help_response(
                messages=[{'role': 'user', 'content': 'Help'}]
            )


class TestGetGradingResponse:
    """Tests for get_grading_response method."""

    @responses.activate
    def test_get_grading_response_success(self, client_with_token):
        """Successful grading response returns parsed JSON."""
        grading_json = '{"score": 85, "feedback": "Good work!"}'
        responses.add(
            responses.POST,
            'http://localhost:8080/api/chat/completions',
            json={'choices': [{'message': {'content': grading_json}}]},
            status=200,
        )

        result = client_with_token.get_grading_response(
            messages=[{'role': 'user', 'content': 'Grade this'}]
        )

        assert result['score'] == 85
        assert result['feedback'] == 'Good work!'

        # Verify correct model, temperature, and timeout
        import json

        request_body = json.loads(responses.calls[0].request.body)
        assert request_body['model'] == 'slc-tutor-evaluator'
        assert request_body['temperature'] == 0.3

    @responses.activate
    def test_get_grading_response_invalid_format(self, client_with_token):
        """Invalid grading response raises exception."""
        responses.add(
            responses.POST,
            'http://localhost:8080/api/chat/completions',
            json={'not': 'valid'},
            status=200,
        )

        with pytest.raises(Exception, match='Invalid response format'):
            client_with_token.get_grading_response(
                messages=[{'role': 'user', 'content': 'Grade'}]
            )

    @responses.activate
    def test_get_grading_response_extraction_error(self, client_with_token):
        """Failed content extraction raises exception."""
        responses.add(
            responses.POST,
            'http://localhost:8080/api/chat/completions',
            json={'choices': [{'bad': 'structure'}]},
            status=200,
        )

        with pytest.raises(Exception, match='Invalid grading response structure'):
            client_with_token.get_grading_response(
                messages=[{'role': 'user', 'content': 'Grade'}]
            )

    @responses.activate
    def test_get_grading_response_invalid_json(self, client_with_token):
        """Non-JSON content raises exception."""
        responses.add(
            responses.POST,
            'http://localhost:8080/api/chat/completions',
            json={'choices': [{'message': {'content': 'This is not JSON'}}]},
            status=200,
        )

        with pytest.raises(Exception, match='Failed to parse grading response as JSON'):
            client_with_token.get_grading_response(
                messages=[{'role': 'user', 'content': 'Grade'}]
            )
