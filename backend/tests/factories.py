"""
Factory Boy factories for creating test data.

These factories create model instances with sensible defaults,
making it easy to generate test data without specifying every field.
"""

import factory
from api.models import Chat, ChatMessage, Note, UserProfile
from django.contrib.auth.models import User


class UserFactory(factory.django.DjangoModelFactory):
    """Factory for creating User instances."""

    class Meta:
        model = User
        skip_postgeneration_save = True

    username = factory.Sequence(lambda n: f'testuser{n}')
    email = factory.LazyAttribute(lambda obj: f'{obj.username}@test.com')
    first_name = factory.Faker('first_name')
    last_name = factory.Faker('last_name')
    is_staff = False
    is_active = True

    @factory.post_generation
    def password(self, create, extracted, **kwargs):
        """Set password after user creation."""
        password = extracted or 'testpass123'
        self.set_password(password)
        if create:
            self.save()


class UserProfileFactory(factory.django.DjangoModelFactory):
    """Factory for creating UserProfile instances."""

    class Meta:
        model = UserProfile

    user = factory.SubFactory(UserFactory)
    openwebui_token = factory.Sequence(lambda n: f'test-openwebui-token-{n}')


class NoteFactory(factory.django.DjangoModelFactory):
    """Factory for creating Note instances."""

    class Meta:
        model = Note

    title = factory.Sequence(lambda n: f'Test Note {n}')
    content = factory.Faker('paragraph', nb_sentences=3)
    author = factory.SubFactory(UserFactory)


class ChatFactory(factory.django.DjangoModelFactory):
    """Factory for creating Chat instances."""

    class Meta:
        model = Chat

    user = factory.SubFactory(UserFactory)
    title = factory.Sequence(lambda n: f'Test Chat {n}')
    status = Chat.STATUS_READY
    messages = factory.LazyFunction(list)  # Empty list by default
    course_data = factory.LazyFunction(
        lambda: {
            'unit': 'Test Unit',
            'intro': 'Test introduction',
            'max_turns': 10,
        },
    )
    avatar_id = 'test-avatar'
    interaction_count = 0
    completed = False
    score = None
    grading_data = None
    help_responses = factory.LazyFunction(list)


class ChatWithMessagesFactory(ChatFactory):
    """Factory for creating Chat instances with pre-populated messages."""

    messages = factory.LazyFunction(
        lambda: [
            {'role': 'system', 'content': 'You are a helpful assistant.'},
            {'role': 'user', 'content': 'Hello, how are you?'},
            {
                'role': 'assistant',
                'content': "I'm doing well, thank you! How can I help?",
            },
        ],
    )
    interaction_count = 1


class CompletedChatFactory(ChatFactory):
    """Factory for creating completed/graded Chat instances."""

    status = Chat.STATUS_COMPLETE
    completed = True
    score = 85.0
    grading_data = factory.LazyFunction(
        lambda: {
            'communication_quality': {
                'empathy_score': 8,
                'active_listening_score': 9,
                'clarity_score': 8,
                'patience_score': 9,
                'professionalism_score': 8,
                'overall_score': 8.5,
            },
            'strengths': ['Good rapport', 'Clear communication'],
            'areas_for_improvement': [],
            'overall_summary': 'Good performance overall.',
        },
    )
    messages = factory.LazyFunction(
        lambda: [
            {'role': 'user', 'content': 'Hello'},
            {'role': 'assistant', 'content': 'Hi! How can I help?'},
            {'role': 'user', 'content': 'I have a question'},
            {'role': 'assistant', 'content': 'Sure, go ahead!'},
        ],
    )
    interaction_count = 2


class ChatMessageFactory(factory.django.DjangoModelFactory):
    """Factory for creating ChatMessage instances (separate model, rarely used)."""

    class Meta:
        model = ChatMessage

    chat = factory.SubFactory(ChatFactory)
    role = 'user'
    content = factory.Faker('sentence')
    relevance_score = None
