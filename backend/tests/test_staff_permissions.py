"""Characterization tests for staff-only endpoints and permissions.

These tests document the CURRENT behavior of staff-only API endpoints.
They test AllUsersView, UserChats, and staff access to ChatDetail.
"""

import pytest

from .factories import ChatFactory, UserFactory


@pytest.mark.django_db
class TestAllUsersView:
    """Tests for the all users endpoint (GET /api/users/)."""

    def test_all_users_staff_only(self, authenticated_client):
        """Non-staff users get 403 Forbidden."""
        response = authenticated_client.get('/api/users/')

        assert response.status_code == 403
        assert response.data['status'] == 'fail'
        assert 'staff' in response.data['message'].lower()

    def test_all_users_returns_list(self, staff_client):
        """Staff can see all users in the system."""
        # Create additional users
        UserFactory(username='alice')
        UserFactory(username='bob')
        UserFactory(username='charlie')

        response = staff_client.get('/api/users/')

        assert response.status_code == 200
        assert response.data['status'] == 'success'

        # Should include the staff user + 3 created users = at least 4
        usernames = [u['username'] for u in response.data['items']]
        assert 'alice' in usernames
        assert 'bob' in usernames
        assert 'charlie' in usernames

    def test_all_users_includes_chat_count(self, staff_client):
        """Each user in the response includes chat_count annotation."""
        # Create a user with some chats
        user_with_chats = UserFactory(username='chatty_user')
        ChatFactory(user=user_with_chats)
        ChatFactory(user=user_with_chats)
        ChatFactory(user=user_with_chats)

        # Create a user with no chats
        UserFactory(username='quiet_user')

        response = staff_client.get('/api/users/')

        assert response.status_code == 200

        # Find users in response
        users_by_name = {u['username']: u for u in response.data['items']}

        assert users_by_name['chatty_user']['chat_count'] == 3
        assert users_by_name['quiet_user']['chat_count'] == 0

    def test_all_users_pagination(self, staff_client):
        """All users endpoint supports pagination."""
        # Create 15 users
        for i in range(15):
            UserFactory(username=f'paged_user_{i:02d}')

        # Default page size is 10
        response = staff_client.get('/api/users/')
        assert response.status_code == 200
        assert len(response.data['items']) == 10
        assert response.data['pagination']['total_pages'] >= 2

        # Custom page size
        response = staff_client.get('/api/users/?page_size=5')
        assert len(response.data['items']) == 5

    def test_all_users_requires_authentication(self, api_client):
        """Unauthenticated requests are rejected."""
        response = api_client.get('/api/users/')
        assert response.status_code == 401


@pytest.mark.django_db
class TestUserChatsView:
    """Tests for viewing a specific user's chats (GET /api/users/:id/chats/)."""

    def test_user_chats_staff_only(self, authenticated_client, user):
        """Non-staff users get 403 Forbidden."""
        other_user = UserFactory()

        response = authenticated_client.get(f'/api/users/{other_user.id}/chats/')

        assert response.status_code == 403
        assert response.data['status'] == 'fail'
        assert 'staff' in response.data['message'].lower()

    def test_user_chats_returns_target_user_chats(self, staff_client):
        """Staff can view any user's chats."""
        # Create a user with chats
        target_user = UserFactory(username='target')
        ChatFactory(user=target_user, title='Target Chat 1')
        ChatFactory(user=target_user, title='Target Chat 2')

        # Create another user's chat (should not appear)
        other_user = UserFactory()
        ChatFactory(user=other_user, title='Other Chat')

        response = staff_client.get(f'/api/users/{target_user.id}/chats/')

        assert response.status_code == 200
        assert response.data['status'] == 'success'
        assert len(response.data['items']) == 2

        titles = [c['title'] for c in response.data['items']]
        assert 'Target Chat 1' in titles
        assert 'Target Chat 2' in titles
        assert 'Other Chat' not in titles

        # Response includes user info
        assert response.data['user']['username'] == 'target'

    def test_user_chats_user_not_found(self, staff_client):
        """Staff gets 404 for non-existent user."""
        response = staff_client.get('/api/users/99999/chats/')

        assert response.status_code == 404
        assert response.data['status'] == 'fail'
        assert 'not found' in response.data['message'].lower()

    def test_user_chats_pagination(self, staff_client):
        """User chats endpoint supports pagination."""
        target_user = UserFactory()
        for i in range(15):
            ChatFactory(user=target_user, title=f'Chat {i}')

        response = staff_client.get(f'/api/users/{target_user.id}/chats/')

        assert response.status_code == 200
        assert len(response.data['items']) == 10
        assert response.data['pagination']['total_pages'] == 2

    def test_user_chats_requires_authentication(self, api_client):
        """Unauthenticated requests are rejected."""
        user = UserFactory()
        response = api_client.get(f'/api/users/{user.id}/chats/')
        assert response.status_code == 401


@pytest.mark.django_db
class TestStaffChatAccess:
    """Tests for staff access to individual chats."""

    def test_staff_can_view_any_chat(self, staff_client):
        """Staff can GET any user's chat."""
        regular_user = UserFactory()
        user_chat = ChatFactory(
            user=regular_user,
            title='Regular User Chat',
            messages=[{'role': 'user', 'content': 'Hello'}],
        )

        response = staff_client.get(f'/api/chats/{user_chat.id}/')

        assert response.status_code == 200
        assert response.data['status'] == 'success'
        assert response.data['chat']['title'] == 'Regular User Chat'
        assert response.data['chat']['user']['username'] == regular_user.username

    def test_staff_cannot_update_others_chat(self, staff_client):
        """Staff cannot PUT to another user's chat (403)."""
        regular_user = UserFactory()
        user_chat = ChatFactory(user=regular_user, title='Original')

        response = staff_client.put(
            f'/api/chats/{user_chat.id}/',
            {
                'title': 'Staff Edited',
                'course_data': user_chat.course_data,
                'avatar_id': user_chat.avatar_id,
                'messages': [],
            },
            format='json',
        )

        assert response.status_code == 403
        assert response.data['status'] == 'fail'
        assert 'only update your own' in response.data['message'].lower()

        # Verify chat was not modified
        response = staff_client.get(f'/api/chats/{user_chat.id}/')
        assert response.data['chat']['title'] == 'Original'

    def test_staff_cannot_patch_others_chat(self, staff_client):
        """Staff cannot PATCH another user's chat (403)."""
        regular_user = UserFactory()
        user_chat = ChatFactory(user=regular_user, title='Original')

        response = staff_client.patch(
            f'/api/chats/{user_chat.id}/',
            {'title': 'Staff Edited'},
            format='json',
        )

        assert response.status_code == 403
        assert 'only update your own' in response.data['message'].lower()

    def test_staff_cannot_delete_others_chat(self, staff_client):
        """Staff cannot DELETE another user's chat (403)."""
        regular_user = UserFactory()
        user_chat = ChatFactory(user=regular_user)
        chat_id = user_chat.id

        response = staff_client.delete(f'/api/chats/{chat_id}/')

        assert response.status_code == 403
        assert response.data['status'] == 'fail'
        assert 'only delete your own' in response.data['message'].lower()

        # Verify chat still exists
        response = staff_client.get(f'/api/chats/{chat_id}/')
        assert response.status_code == 200

    def test_staff_can_modify_own_chat(self, staff_client, staff_user):
        """Staff can update/delete their own chats."""
        staff_chat = ChatFactory(user=staff_user, title='Staff Chat')

        # Update
        response = staff_client.patch(
            f'/api/chats/{staff_chat.id}/',
            {'title': 'Updated Staff Chat'},
            format='json',
        )
        assert response.status_code == 200
        assert response.data['chat']['title'] == 'Updated Staff Chat'

        # Delete
        response = staff_client.delete(f'/api/chats/{staff_chat.id}/')
        assert response.status_code == 204
