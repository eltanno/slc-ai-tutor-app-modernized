"""Characterization tests for Notes CRUD operations.

These tests document the CURRENT behavior of the Notes API endpoints.
They test the Notes (list/create) and NoteDetail (get/update/delete) views.

Note: The Notes feature appears unused in the main app flow but exists in codebase.
"""

import pytest

from .factories import NoteFactory, UserFactory


@pytest.mark.django_db
class TestListNotes:
    """Tests for listing notes (GET /api/notes/)."""

    def test_list_notes_returns_user_notes_only(self, authenticated_client, user):
        """User sees only their own notes, not other users' notes."""
        # Create notes for the authenticated user
        NoteFactory(author=user, title='My Note 1')
        NoteFactory(author=user, title='My Note 2')

        # Create note for another user
        other_user = UserFactory()
        NoteFactory(author=other_user, title='Other User Note')

        response = authenticated_client.get('/api/notes/')

        assert response.status_code == 200
        assert response.data['status'] == 'success'
        assert len(response.data['items']) == 2

        # Verify only user's notes are returned
        titles = [note['title'] for note in response.data['items']]
        assert 'My Note 1' in titles
        assert 'My Note 2' in titles
        assert 'Other User Note' not in titles

    def test_list_notes_pagination(self, authenticated_client, user):
        """Notes list supports pagination."""
        for i in range(15):
            NoteFactory(author=user, title=f'Note {i:02d}')

        # Default page
        response = authenticated_client.get('/api/notes/')
        assert response.status_code == 200
        assert len(response.data['items']) == 10
        assert response.data['pagination']['total_pages'] == 2

        # Second page
        response = authenticated_client.get('/api/notes/?page=2')
        assert len(response.data['items']) == 5

    def test_list_notes_requires_authentication(self, api_client):
        """Unauthenticated requests are rejected."""
        response = api_client.get('/api/notes/')
        assert response.status_code == 401


@pytest.mark.django_db
class TestCreateNote:
    """Tests for creating notes (POST /api/notes/)."""

    def test_create_note_success(self, authenticated_client, user):
        """Valid data creates a note with author set to request.user."""
        response = authenticated_client.post(
            '/api/notes/',
            {
                'title': 'My New Note',
                'content': 'This is the note content.',
            },
            format='json',
        )

        assert response.status_code == 201
        assert response.data['status'] == 'success'
        assert response.data['note']['title'] == 'My New Note'
        assert response.data['note']['content'] == 'This is the note content.'
        # Author should be automatically set to the authenticated user
        assert response.data['note']['author']['id'] == user.id

    def test_create_note_validation(self, authenticated_client):
        """Missing required fields returns validation errors."""
        response = authenticated_client.post(
            '/api/notes/',
            {},
            format='json',
        )

        assert response.status_code == 400
        assert response.data['status'] == 'fail'
        assert 'errors' in response.data

    def test_create_note_requires_authentication(self, api_client):
        """Unauthenticated requests are rejected."""
        response = api_client.post(
            '/api/notes/',
            {'title': 'Test', 'content': 'Content'},
            format='json',
        )
        assert response.status_code == 401


@pytest.mark.django_db
class TestGetNote:
    """Tests for getting a single note (GET /api/notes/:id/)."""

    def test_get_note_success(self, authenticated_client, user):
        """Returns note with all fields."""
        note = NoteFactory(
            author=user,
            title='Test Note',
            content='Note content here.',
        )

        response = authenticated_client.get(f'/api/notes/{note.id}/')

        assert response.status_code == 200
        assert response.data['status'] == 'success'
        assert response.data['note']['id'] == note.id
        assert response.data['note']['title'] == 'Test Note'
        assert response.data['note']['content'] == 'Note content here.'

    def test_get_note_not_found(self, authenticated_client):
        """Wrong ID returns 404."""
        response = authenticated_client.get('/api/notes/99999/')

        assert response.status_code == 404
        assert response.data['status'] == 'fail'
        assert 'not found' in response.data['message'].lower()

    def test_get_note_wrong_user(self, authenticated_client):
        """Cannot access another user's note (returns 404)."""
        other_user = UserFactory()
        other_note = NoteFactory(author=other_user, title='Private Note')

        response = authenticated_client.get(f'/api/notes/{other_note.id}/')

        # Returns 404 because queryset filters by author
        assert response.status_code == 404


@pytest.mark.django_db
class TestUpdateNote:
    """Tests for updating notes (PUT /api/notes/:id/)."""

    def test_update_note_success(self, authenticated_client, user):
        """PUT modifies note content."""
        note = NoteFactory(
            author=user,
            title='Original Title',
            content='Original content.',
        )

        response = authenticated_client.put(
            f'/api/notes/{note.id}/',
            {
                'title': 'Updated Title',
                'content': 'Updated content.',
            },
            format='json',
        )

        assert response.status_code == 200
        assert response.data['status'] == 'success'
        assert response.data['note']['title'] == 'Updated Title'
        assert response.data['note']['content'] == 'Updated content.'

    def test_update_note_not_found(self, authenticated_client):
        """Updating non-existent note returns 404."""
        response = authenticated_client.put(
            '/api/notes/99999/',
            {'title': 'Test', 'content': 'Content'},
            format='json',
        )

        assert response.status_code == 404

    def test_update_note_wrong_user(self, authenticated_client):
        """Cannot update another user's note (returns 404)."""
        other_user = UserFactory()
        other_note = NoteFactory(author=other_user)

        response = authenticated_client.put(
            f'/api/notes/{other_note.id}/',
            {'title': 'Hacked', 'content': 'Hacked content'},
            format='json',
        )

        assert response.status_code == 404


@pytest.mark.django_db
class TestDeleteNote:
    """Tests for deleting notes (DELETE /api/notes/:id/)."""

    def test_delete_note_success(self, authenticated_client, user):
        """Owner can delete their note."""
        note = NoteFactory(author=user)
        note_id = note.id

        response = authenticated_client.delete(f'/api/notes/{note_id}/')

        assert response.status_code == 204

        # Verify note is deleted
        response = authenticated_client.get(f'/api/notes/{note_id}/')
        assert response.status_code == 404

    def test_delete_note_not_found(self, authenticated_client):
        """Deleting non-existent note returns 404."""
        response = authenticated_client.delete('/api/notes/99999/')
        assert response.status_code == 404

    def test_delete_note_wrong_user(self, authenticated_client):
        """Cannot delete another user's note (returns 404)."""
        other_user = UserFactory()
        other_note = NoteFactory(author=other_user)

        response = authenticated_client.delete(f'/api/notes/{other_note.id}/')

        assert response.status_code == 404
