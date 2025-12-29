"""Characterization tests for Chat CRUD operations.

These tests document the CURRENT behavior of the Chat API endpoints.
They test the Chats and ChatDetail views.
"""

import pytest

from .factories import ChatFactory, UserFactory


@pytest.mark.django_db
class TestListChats:
    """Tests for listing chats (GET /api/chats/)."""

    def test_list_chats_returns_user_chats_only(self, authenticated_client, user):
        """User sees only their own chats, not other users' chats."""
        # Create chats for the authenticated user
        ChatFactory(user=user, title='My Chat 1')
        ChatFactory(user=user, title='My Chat 2')

        # Create chat for another user
        other_user = UserFactory()
        ChatFactory(user=other_user, title='Other User Chat')

        response = authenticated_client.get('/api/chats/')

        assert response.status_code == 200
        assert response.data['status'] == 'success'
        assert len(response.data['items']) == 2

        # Verify only user's chats are returned
        titles = [chat['title'] for chat in response.data['items']]
        assert 'My Chat 1' in titles
        assert 'My Chat 2' in titles
        assert 'Other User Chat' not in titles

    def test_list_chats_pagination(self, authenticated_client, user):
        """Page and page_size parameters work correctly."""
        # Create 15 chats
        for i in range(15):
            ChatFactory(user=user, title=f'Chat {i}')

        # Get first page with default page_size (10)
        response = authenticated_client.get('/api/chats/')
        assert response.status_code == 200
        assert len(response.data['items']) == 10
        assert response.data['pagination']['page'] == 1
        assert response.data['pagination']['total_pages'] == 2
        assert response.data['pagination']['next_page'] == 2
        assert response.data['pagination']['prev_page'] is None

        # Get second page
        response = authenticated_client.get('/api/chats/?page=2')
        assert response.status_code == 200
        assert len(response.data['items']) == 5
        assert response.data['pagination']['page'] == 2
        assert response.data['pagination']['next_page'] is None
        assert response.data['pagination']['prev_page'] == 1

        # Custom page_size
        response = authenticated_client.get('/api/chats/?page_size=5')
        assert response.status_code == 200
        assert len(response.data['items']) == 5
        assert response.data['pagination']['total_pages'] == 3

    def test_list_chats_pagination_invalid_params(self, authenticated_client, user):
        """Invalid pagination params default to safe values."""
        ChatFactory(user=user)

        # Invalid page (string) defaults to 1
        response = authenticated_client.get('/api/chats/?page=invalid')
        assert response.status_code == 200
        assert response.data['pagination']['page'] == 1

        # Page 0 defaults to 1
        response = authenticated_client.get('/api/chats/?page=0')
        assert response.status_code == 200
        assert response.data['pagination']['page'] == 1

        # Negative page defaults to 1
        response = authenticated_client.get('/api/chats/?page=-5')
        assert response.status_code == 200
        assert response.data['pagination']['page'] == 1

        # Invalid page_size defaults to 10
        response = authenticated_client.get('/api/chats/?page_size=invalid')
        assert response.status_code == 200
        assert response.data['pagination']['page_size'] == 10

    def test_list_chats_requires_authentication(self, api_client):
        """Unauthenticated requests are rejected."""
        response = api_client.get('/api/chats/')
        assert response.status_code == 401


@pytest.mark.django_db
class TestCreateChat:
    """Tests for creating chats (POST /api/chats/)."""

    def test_create_chat_success(self, authenticated_client):
        """Valid data creates a chat."""
        response = authenticated_client.post(
            '/api/chats/',
            {
                'title': 'New Chat',
                'course_data': {
                    'unit': 'Test Unit',
                    'intro': 'Test intro',
                    'max_turns': 10,
                },
                'avatar_id': 'avatar-1',
                'messages': [],
            },
            format='json',
        )

        assert response.status_code == 201
        assert response.data['status'] == 'success'
        assert response.data['chat']['title'] == 'New Chat'
        assert response.data['chat']['avatar_id'] == 'avatar-1'
        assert response.data['chat']['messages'] == []

    def test_create_chat_sets_user(self, authenticated_client, user):
        """Chat.user is automatically set to request.user."""
        response = authenticated_client.post(
            '/api/chats/',
            {
                'title': 'My Chat',
                'course_data': {'unit': 'Test'},
                'avatar_id': 'avatar-1',
                'messages': [],
            },
            format='json',
        )

        assert response.status_code == 201
        # User should be set to the authenticated user
        assert response.data['chat']['user']['id'] == user.id
        assert response.data['chat']['user']['username'] == user.username

    def test_create_chat_requires_authentication(self, api_client):
        """Unauthenticated requests are rejected."""
        response = api_client.post(
            '/api/chats/',
            {'title': 'Test'},
            format='json',
        )
        assert response.status_code == 401


@pytest.mark.django_db
class TestGetChat:
    """Tests for retrieving a single chat (GET /api/chats/:id/)."""

    def test_get_chat_by_id(self, authenticated_client, user):
        """Returns chat with all fields."""
        chat = ChatFactory(
            user=user,
            title='Test Chat',
            messages=[
                {'role': 'user', 'content': 'Hello'},
                {'role': 'assistant', 'content': 'Hi there!'},
            ],
            score=85.0,
            interaction_count=1,
        )

        response = authenticated_client.get(f'/api/chats/{chat.id}/')

        assert response.status_code == 200
        assert response.data['status'] == 'success'
        assert response.data['chat']['id'] == chat.id
        assert response.data['chat']['title'] == 'Test Chat'
        assert len(response.data['chat']['messages']) == 2
        assert response.data['chat']['score'] == 85.0
        assert response.data['chat']['interaction_count'] == 1
        assert response.data['chat']['user']['id'] == user.id

    def test_get_chat_not_found(self, authenticated_client):
        """Wrong ID returns 404."""
        response = authenticated_client.get('/api/chats/99999/')

        assert response.status_code == 404
        assert response.data['status'] == 'fail'
        assert 'not found' in response.data['message'].lower()

    def test_get_chat_wrong_user_forbidden(self, authenticated_client):
        """Cannot access another user's chat (returns 404, not 403)."""
        other_user = UserFactory()
        other_chat = ChatFactory(user=other_user, title='Private Chat')

        response = authenticated_client.get(f'/api/chats/{other_chat.id}/')

        # Note: Returns 404 (not 403) because queryset filters by user
        # This is actually good security practice (don't reveal existence)
        assert response.status_code == 404

    def test_get_chat_staff_can_access_any(self, staff_client):
        """Staff users can access any chat."""
        other_user = UserFactory()
        other_chat = ChatFactory(user=other_user, title='User Chat')

        response = staff_client.get(f'/api/chats/{other_chat.id}/')

        assert response.status_code == 200
        assert response.data['chat']['title'] == 'User Chat'


@pytest.mark.django_db
class TestUpdateChat:
    """Tests for updating chats (PUT/PATCH /api/chats/:id/)."""

    def test_update_chat_full(self, authenticated_client, user):
        """PUT updates all fields."""
        chat = ChatFactory(user=user, title='Original Title')

        response = authenticated_client.put(
            f'/api/chats/{chat.id}/',
            {
                'title': 'Updated Title',
                'course_data': {'unit': 'New Unit'},
                'avatar_id': 'new-avatar',
                'messages': [
                    {'role': 'user', 'content': 'New message'},
                ],
            },
            format='json',
        )

        assert response.status_code == 200
        assert response.data['status'] == 'success'
        assert response.data['chat']['title'] == 'Updated Title'
        assert response.data['chat']['avatar_id'] == 'new-avatar'
        assert len(response.data['chat']['messages']) == 1

    def test_update_chat_partial(self, authenticated_client, user):
        """PATCH updates only specified fields."""
        chat = ChatFactory(
            user=user,
            title='Original Title',
            avatar_id='original-avatar',
        )

        response = authenticated_client.patch(
            f'/api/chats/{chat.id}/',
            {'title': 'Updated Title'},
            format='json',
        )

        assert response.status_code == 200
        assert response.data['chat']['title'] == 'Updated Title'
        # Unspecified fields remain unchanged
        assert response.data['chat']['avatar_id'] == 'original-avatar'

    def test_update_chat_recalculates_interaction_count(
        self, authenticated_client, user
    ):
        """Interaction count is recalculated based on user messages."""
        chat = ChatFactory(user=user, interaction_count=0, messages=[])

        # Update with messages containing 3 user messages
        response = authenticated_client.put(
            f'/api/chats/{chat.id}/',
            {
                'title': chat.title,
                'course_data': chat.course_data,
                'avatar_id': chat.avatar_id,
                'messages': [
                    {'role': 'user', 'content': 'First'},
                    {'role': 'assistant', 'content': 'Response 1'},
                    {'role': 'user', 'content': 'Second'},
                    {'role': 'assistant', 'content': 'Response 2'},
                    {'role': 'user', 'content': 'Third'},
                ],
            },
            format='json',
        )

        assert response.status_code == 200
        # interaction_count should be 3 (number of user messages)
        assert response.data['chat']['interaction_count'] == 3

    def test_update_chat_wrong_user_forbidden(self, authenticated_client):
        """Cannot update another user's chat."""
        other_user = UserFactory()
        other_chat = ChatFactory(user=other_user)

        response = authenticated_client.put(
            f'/api/chats/{other_chat.id}/',
            {'title': 'Hacked'},
            format='json',
        )

        # Returns 404 because queryset filters by user
        assert response.status_code == 404

    def test_update_chat_staff_cannot_update_others(self, staff_client, staff_user):
        """Staff can view but cannot update other users' chats."""
        other_user = UserFactory()
        other_chat = ChatFactory(user=other_user, title='Original')

        response = staff_client.put(
            f'/api/chats/{other_chat.id}/',
            {
                'title': 'Staff Edit',
                'course_data': other_chat.course_data,
                'avatar_id': other_chat.avatar_id,
                'messages': [],
            },
            format='json',
        )

        # Staff can GET but PUT returns 403
        assert response.status_code == 403
        assert 'only update your own' in response.data['message'].lower()


@pytest.mark.django_db
class TestDeleteChat:
    """Tests for deleting chats (DELETE /api/chats/:id/)."""

    def test_delete_chat_success(self, authenticated_client, user):
        """Owner can delete their chat."""
        chat = ChatFactory(user=user)
        chat_id = chat.id

        response = authenticated_client.delete(f'/api/chats/{chat_id}/')

        assert response.status_code == 204

        # Verify chat is deleted
        response = authenticated_client.get(f'/api/chats/{chat_id}/')
        assert response.status_code == 404

    def test_delete_chat_wrong_user_forbidden(self, authenticated_client):
        """Cannot delete another user's chat."""
        other_user = UserFactory()
        other_chat = ChatFactory(user=other_user)

        response = authenticated_client.delete(f'/api/chats/{other_chat.id}/')

        # Returns 404 because queryset filters by user
        assert response.status_code == 404

    def test_delete_chat_staff_cannot_delete_others(self, staff_client):
        """Staff can view but cannot delete other users' chats."""
        other_user = UserFactory()
        other_chat = ChatFactory(user=other_user)

        response = staff_client.delete(f'/api/chats/{other_chat.id}/')

        # Staff can GET but DELETE returns 403
        assert response.status_code == 403
        assert 'only delete your own' in response.data['message'].lower()

    def test_delete_chat_not_found(self, authenticated_client):
        """Deleting non-existent chat returns 404."""
        response = authenticated_client.delete('/api/chats/99999/')

        assert response.status_code == 404
