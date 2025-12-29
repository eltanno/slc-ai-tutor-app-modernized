"""Conversation formatting utilities for LLM requests."""

from __future__ import annotations

import json
from typing import TYPE_CHECKING


if TYPE_CHECKING:
    from api.models import Chat


def format_conversation_for_llm(chat: Chat, include_json_metadata: bool = True) -> str:
    """
    Format chat data for LLM processing (help/grading requests).

    This creates a standardized format with conversation metadata and
    transcript that can be sent to LLM APIs for help or grading.

    Args:
        chat: The Chat model instance to format.
        include_json_metadata: If True, format metadata as JSON. Otherwise as str.

    Returns:
        Formatted string with conversation metadata and transcript.
    """
    metadata = {
        'title': chat.title,
        'course_data': chat.course_data,
        'avatar_id': chat.avatar_id,
        'interaction_count': chat.interaction_count,
    }

    transcript_lines = []
    for msg in chat.messages:
        role = 'User' if msg.get('role') == 'user' else 'Resident'
        transcript_lines.append(f'{role}: {msg.get("content", "")}')

    transcript = '\n'.join(transcript_lines)

    if include_json_metadata:
        metadata_str = json.dumps(metadata, indent=2)
    else:
        metadata_str = str(metadata)

    return f"""CONVERSATION METADATA:
{metadata_str}

CONVERSATION TRANSCRIPT:
{transcript}"""
