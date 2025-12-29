from django.contrib.auth.models import User
from django.db import models


class UserProfile(models.Model):
    """
    Extends User model to store OpenWebUI authentication token.
    """

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    openwebui_token = models.TextField(
        blank=True, null=True, help_text='OpenWebUI authentication token'
    )

    def __str__(self):
        return f"{self.user.username}'s profile"


class Note(models.Model):
    title = models.CharField(max_length=100)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notes')

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['-created_at']


class Chat(models.Model):
    """
    Stores AI tutor chat sessions with associated metadata and scoring.
    """

    # Status choices
    STATUS_READY = 'ready'
    STATUS_IN_PROGRESS = 'in_progress'
    STATUS_THINKING = 'thinking'
    STATUS_GETTING_HELP = 'getting_help'
    STATUS_READY_FOR_GRADING = 'ready_for_grading'
    STATUS_GRADING = 'grading'
    STATUS_COMPLETE = 'complete'

    STATUS_CHOICES = [
        (STATUS_READY, 'Ready'),
        (STATUS_IN_PROGRESS, 'In Progress'),
        (STATUS_THINKING, 'AI Thinking'),
        (STATUS_GETTING_HELP, 'Getting Help'),
        (STATUS_READY_FOR_GRADING, 'Ready for Grading'),
        (STATUS_GRADING, 'Being Graded'),
        (STATUS_COMPLETE, 'Complete'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chats')
    title = models.CharField(max_length=200, help_text='Chat session title')

    # Status tracking
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_READY,
        help_text='Current status of the chat session',
    )

    # Course and avatar data
    course_data = models.JSONField(
        help_text='JSON data for the course being tutored',
        null=True,
        blank=True,
    )
    avatar_id = models.CharField(
        max_length=50,
        help_text='ID of the avatar used in this chat',
        null=True,
        blank=True,
    )

    # Chat messages stored as JSON array
    messages = models.JSONField(
        default=list,
        help_text="Array of chat messages: [{role: 'user'|'assistant', content: '...', timestamp: '...'}]",
    )

    # Scoring and analytics
    score = models.FloatField(
        null=True,
        blank=True,
        help_text='Overall score for this chat session based on user interactions',
    )
    grading_data = models.JSONField(
        null=True,
        blank=True,
        help_text='Complete grading response from LLM evaluator',
    )
    help_responses = models.JSONField(
        default=list,
        help_text="Array of help responses: [{turn: 1, timestamp: '...', help_text: '...'}]",
    )
    interaction_count = models.IntegerField(
        default=0,
        help_text='Number of user messages in this chat',
    )
    completed = models.BooleanField(
        default=False,
        help_text='Whether the chat session is marked as completed',
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # OpenWebUI reference (optional - for sync if needed)
    openwebui_chat_id = models.CharField(
        max_length=100,
        null=True,
        blank=True,
        help_text='Reference to OpenWebUI chat ID if synced',
    )

    def __str__(self):
        return f'{self.title} - {self.user.username}'

    class Meta:
        ordering = ['-updated_at']
        indexes = [
            models.Index(fields=['user', '-updated_at']),
            models.Index(fields=['completed']),
        ]


class ChatMessage(models.Model):
    """
    Individual messages within a chat (alternative to storing in JSON).
    Use this if you need to query/filter individual messages.
    """

    chat = models.ForeignKey(
        Chat, on_delete=models.CASCADE, related_name='chat_messages'
    )
    role = models.CharField(
        max_length=20,
        choices=[('user', 'User'), ('assistant', 'Assistant'), ('system', 'System')],
    )
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    # Optional: track message-level scoring
    relevance_score = models.FloatField(null=True, blank=True)

    class Meta:
        ordering = ['timestamp']

    def __str__(self):
        return f'{self.role}: {self.content[:50]}...'
