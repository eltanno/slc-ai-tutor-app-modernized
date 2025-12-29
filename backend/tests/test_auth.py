"""Characterization tests for authentication flow.

These tests document the CURRENT behavior of the authentication system.
They test the TokenObtainPairView, CreateUserView, and GetLoggedInUserView.
"""

import pytest
from django.contrib.auth.models import User

from .factories import UserFactory


@pytest.mark.django_db
class TestLogin:
    """Tests for the login endpoint (TokenObtainPairView)."""

    def test_login_returns_jwt_tokens(self, api_client):
        """Valid credentials return access and refresh tokens."""
        # Create user with known password
        user = UserFactory(password='testpass123')

        response = api_client.post(
            '/api/token/',
            {'username': user.username, 'password': 'testpass123'},
            format='json',
        )

        assert response.status_code == 200
        assert 'access' in response.data
        assert 'refresh' in response.data
        # Tokens should be non-empty strings
        assert len(response.data['access']) > 0
        assert len(response.data['refresh']) > 0

    def test_login_invalid_credentials_fails(self, api_client):
        """Wrong password returns 401 Unauthorized."""
        user = UserFactory(password='correctpassword')

        response = api_client.post(
            '/api/token/',
            {'username': user.username, 'password': 'wrongpassword'},
            format='json',
        )

        assert response.status_code == 401
        assert 'access' not in response.data
        assert 'refresh' not in response.data

    def test_login_nonexistent_user_fails(self, api_client):
        """Login with non-existent username returns 401."""
        response = api_client.post(
            '/api/token/',
            {'username': 'nonexistent', 'password': 'anypassword'},
            format='json',
        )

        assert response.status_code == 401

    def test_login_triggers_openwebui_auth(self, api_client, responses):
        """Successful login calls OpenWebUI signin endpoint."""
        import os

        base_url = os.getenv('OPENWEBUI_BASE_URL', 'http://localhost:8080')

        # Mock OpenWebUI login endpoint
        responses.add(
            responses.POST,
            f'{base_url}/api/v1/auths/signin',
            json={'token': 'openwebui-token-123'},
            status=200,
        )

        user = UserFactory(password='testpass123')

        response = api_client.post(
            '/api/token/',
            {'username': user.username, 'password': 'testpass123'},
            format='json',
        )

        # Django login should succeed
        assert response.status_code == 200

        # OpenWebUI signin should have been called
        assert len(responses.calls) == 1
        assert '/api/v1/auths/signin' in responses.calls[0].request.url

    def test_login_openwebui_failure_doesnt_fail_django(self, api_client, responses):
        """OpenWebUI error is logged but Django login still succeeds."""
        import os

        base_url = os.getenv('OPENWEBUI_BASE_URL', 'http://localhost:8080')

        # Mock OpenWebUI login to fail
        responses.add(
            responses.POST,
            f'{base_url}/api/v1/auths/signin',
            json={'detail': 'Internal server error'},
            status=500,
        )

        user = UserFactory(password='testpass123')

        response = api_client.post(
            '/api/token/',
            {'username': user.username, 'password': 'testpass123'},
            format='json',
        )

        # Django login should still succeed despite OpenWebUI failure
        assert response.status_code == 200
        assert 'access' in response.data
        assert 'refresh' in response.data


@pytest.mark.django_db
class TestRegister:
    """Tests for the user registration endpoint (CreateUserView)."""

    def test_register_creates_user(self, api_client):
        """Valid data creates a new user."""
        response = api_client.post(
            '/api/user/register/',
            {
                'username': 'newuser',
                'password': 'securepass123',
                'email': 'newuser@example.com',
                'first_name': 'New',
                'last_name': 'User',
            },
            format='json',
        )

        assert response.status_code == 201

        # User should exist in database
        assert User.objects.filter(username='newuser').exists()
        user = User.objects.get(username='newuser')
        assert user.email == 'newuser@example.com'
        assert user.first_name == 'New'
        assert user.last_name == 'User'
        # Password should be hashed, not stored as plain text
        assert user.check_password('securepass123')

    def test_register_duplicate_username_fails(self, api_client):
        """Registration with existing username fails."""
        UserFactory(username='existinguser')

        response = api_client.post(
            '/api/user/register/',
            {
                'username': 'existinguser',
                'password': 'securepass123',
                'email': 'new@example.com',
            },
            format='json',
        )

        assert response.status_code == 400
        assert 'username' in response.data

    def test_register_missing_required_fields_fails(self, api_client):
        """Registration without required fields fails."""
        response = api_client.post(
            '/api/user/register/',
            {'email': 'test@example.com'},
            format='json',
        )

        assert response.status_code == 400


@pytest.mark.django_db
class TestGetMe:
    """Tests for the get logged-in user endpoint (GetLoggedInUserView)."""

    def test_get_me_returns_user_data(self, authenticated_client, user):
        """Authenticated request returns user data."""
        response = authenticated_client.get('/api/user/me/')

        assert response.status_code == 200
        assert response.data['status'] == 'success'
        assert response.data['user']['id'] == user.id
        assert response.data['user']['username'] == user.username
        assert response.data['user']['email'] == user.email
        # Password should NOT be in response
        assert 'password' not in response.data['user']

    def test_get_me_unauthenticated_returns_anonymous_user(self, api_client):
        """Unauthenticated request returns success with AnonymousUser data.

        Note: This is a BUG in the current implementation. The view checks
        `if user:` which is True for AnonymousUser. This test documents the
        CURRENT behavior. The expected behavior would be to return 'fail'.

        Current behavior: Returns success with AnonymousUser serialized data.
        """
        response = api_client.get('/api/user/me/')

        assert response.status_code == 200
        # BUG: Returns 'success' instead of 'fail' for unauthenticated users
        assert response.data['status'] == 'success'
        # AnonymousUser has no ID or meaningful data
        assert 'user' in response.data
