"""
Pytest configuration and fixtures for SLC AI Tutor tests.

This file is automatically loaded by pytest and provides:
- Django database access via pytest-django
- Reusable fixtures for authentication and common test data
- API client fixtures for testing endpoints
"""

import pytest
import responses as responses_lib
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from .factories import ChatFactory, NoteFactory, UserFactory, UserProfileFactory


@pytest.fixture
def responses():
    """Activate responses mock for HTTP requests.

    This fixture activates the responses library to mock HTTP requests.
    All requests made during the test will be intercepted unless explicitly mocked.
    """
    with responses_lib.RequestsMock() as rsps:
        yield rsps


@pytest.fixture
def api_client():
    """Return an unauthenticated API client."""
    return APIClient()


@pytest.fixture
def user(db):
    """Create and return a regular user."""
    return UserFactory()


@pytest.fixture
def user_with_profile(db):
    """Create and return a user with an OpenWebUI profile (has token)."""
    user = UserFactory()
    UserProfileFactory(user=user)
    return user


@pytest.fixture
def staff_user(db):
    """Create and return a staff user."""
    return UserFactory(is_staff=True)


@pytest.fixture
def staff_user_with_profile(db):
    """Create and return a staff user with an OpenWebUI profile."""
    user = UserFactory(is_staff=True)
    UserProfileFactory(user=user)
    return user


@pytest.fixture
def authenticated_client(api_client, user):
    """Return an API client authenticated as a regular user."""
    refresh = RefreshToken.for_user(user)
    api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
    return api_client


@pytest.fixture
def authenticated_client_with_profile(api_client, user_with_profile):
    """Return an API client authenticated as a user with OpenWebUI profile."""
    refresh = RefreshToken.for_user(user_with_profile)
    api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
    return api_client


@pytest.fixture
def staff_client(api_client, staff_user):
    """Return an API client authenticated as a staff user."""
    refresh = RefreshToken.for_user(staff_user)
    api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
    return api_client


@pytest.fixture
def staff_client_with_profile(api_client, staff_user_with_profile):
    """Return an API client authenticated as staff with OpenWebUI profile."""
    refresh = RefreshToken.for_user(staff_user_with_profile)
    api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
    return api_client


@pytest.fixture
def chat(db, user):
    """Create and return a chat for the default user."""
    return ChatFactory(user=user)


@pytest.fixture
def chat_with_messages(db, user):
    """Create and return a chat with some messages."""
    return ChatFactory(
        user=user,
        messages=[
            {'role': 'user', 'content': 'Hello'},
            {'role': 'assistant', 'content': 'Hi there! How can I help you today?'},
        ],
        interaction_count=1,
    )


@pytest.fixture
def note(db, user):
    """Create and return a note for the default user."""
    return NoteFactory(author=user)


@pytest.fixture
def openwebui_mock(responses):
    """
    Set up mock responses for OpenWebUI API.

    Usage:
        def test_something(openwebui_mock):
            openwebui_mock.add_chat_completion("Hello!")
            # ... test code
    """
    import os

    base_url = os.getenv('OPENWEBUI_BASE_URL', 'http://localhost:8080')

    class OpenWebUIMock:
        def __init__(self, responses_mock, base_url):
            self.responses = responses_mock
            self.base_url = base_url

        def add_chat_completion(self, content, model=None):
            """Mock a successful chat completion response."""
            self.responses.add(
                self.responses.POST,
                f'{self.base_url}/api/chat/completions',
                json={
                    'choices': [
                        {
                            'message': {
                                'role': 'assistant',
                                'content': content,
                            },
                        },
                    ],
                },
                status=200,
            )

        def add_login_success(self, token='test-token-123'):
            """Mock a successful login response."""
            self.responses.add(
                self.responses.POST,
                f'{self.base_url}/api/v1/auths/signin',
                json={'token': token},
                status=200,
            )

        def add_login_failure(self):
            """Mock a failed login response."""
            self.responses.add(
                self.responses.POST,
                f'{self.base_url}/api/v1/auths/signin',
                json={'detail': 'Invalid credentials'},
                status=401,
            )

        def add_chat_completion_error(self, status=500, detail='Internal server error'):
            """Mock an error response from chat completion."""
            self.responses.add(
                self.responses.POST,
                f'{self.base_url}/api/chat/completions',
                json={'detail': detail},
                status=status,
            )

    return OpenWebUIMock(responses, base_url)
