"""Chat validation utilities for API views."""

from __future__ import annotations

from typing import TYPE_CHECKING

from rest_framework import status
from rest_framework.response import Response


if TYPE_CHECKING:
    from api.models import Chat


STATUS_COMPLETE = 'complete'  # Matches Chat.STATUS_COMPLETE to avoid circular import


def check_chat_not_completed(
    chat: Chat, action_description: str = 'perform action on'
) -> Response | None:
    """
    Check if a chat is completed or graded.

    Args:
        chat: The Chat model instance to check.
        action_description: Description of the action for the error message.

    Returns:
        Error Response if chat is completed, None otherwise.
    """
    if chat.completed or chat.status == STATUS_COMPLETE:
        return Response(
            {
                'status': 'fail',
                'message': f'Cannot {action_description} a completed or graded chat',
            },
            status=status.HTTP_400_BAD_REQUEST,
        )
    return None


def check_max_turns_not_exceeded(chat: Chat) -> Response | None:
    """
    Check if the maximum number of turns has been reached for a chat.

    Args:
        chat: The Chat model instance to check.

    Returns:
        Error Response if max turns exceeded, None otherwise.
    """
    if chat.course_data and isinstance(chat.course_data, dict):
        max_turns = chat.course_data.get('max_turns')
        if max_turns is not None:
            current_turn_count = len(
                [m for m in chat.messages if m.get('role') == 'user']
            )
            if current_turn_count >= max_turns:
                return Response(
                    {
                        'status': 'fail',
                        'message': f'Maximum turns ({max_turns}) reached for this chat',
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )
    return None


def count_user_messages(messages: list) -> int:
    """
    Count the number of user messages in a message list.

    Args:
        messages: List of message dictionaries.

    Returns:
        Count of messages with role 'user'.
    """
    return len([m for m in messages if m.get('role') == 'user'])
