from django.contrib.auth.models import User
from rest_framework import serializers

from .models import Chat, ChatMessage, Note


class UserSerializer(serializers.ModelSerializer):
    chat_count = serializers.IntegerField(read_only=True, required=False)

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'password',
            'first_name',
            'last_name',
            'email',
            'is_staff',
            'chat_count',
        ]
        extra_kwargs = {
            'password': {'write_only': True},
            'is_staff': {'read_only': True},
        }

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class NoteSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)

    class Meta:
        model = Note
        fields = ['id', 'title', 'content', 'created_at', 'updated_at', 'author']
        extra_kwargs = {
            'author': {'read_only': True},
            'updated_at': {'read_only': True},
        }


class ChatMessageSerializer(serializers.ModelSerializer):
    """Serializer for individual chat messages."""

    class Meta:
        model = ChatMessage
        fields = ['id', 'role', 'content', 'timestamp', 'relevance_score']
        read_only_fields = ['id', 'timestamp']


class ChatSerializer(serializers.ModelSerializer):
    """Serializer for chat sessions."""

    user = UserSerializer(read_only=True)
    chat_messages = ChatMessageSerializer(many=True, read_only=True)

    class Meta:
        model = Chat
        fields = [
            'id',
            'user',
            'title',
            'status',
            'course_data',
            'avatar_id',
            'messages',
            'score',
            'grading_data',
            'help_responses',
            'interaction_count',
            'completed',
            'created_at',
            'updated_at',
            'openwebui_chat_id',
            'chat_messages',
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']


class ChatCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating chats (no nested user object)."""

    class Meta:
        model = Chat
        fields = [
            'id',
            'title',
            'course_data',
            'avatar_id',
            'messages',
            'score',
            'interaction_count',
            'completed',
            'openwebui_chat_id',
        ]
        read_only_fields = ['id']

    def validate_messages(self, value):
        """Ensure messages is a list of valid message objects."""
        if not isinstance(value, list):
            raise serializers.ValidationError('Messages must be a list')

        for msg in value:
            if not isinstance(msg, dict):
                raise serializers.ValidationError('Each message must be an object')
            if 'role' not in msg or 'content' not in msg:
                raise serializers.ValidationError(
                    "Each message must have 'role' and 'content'"
                )

        return value
