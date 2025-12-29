"""
Utility functions for the SLC AI Tutor API.

This package contains shared utilities extracted from views.py for better
maintainability and reusability.
"""

from .formatting import format_conversation_for_llm
from .openwebui_helpers import get_openwebui_token
from .pagination import get_pagination_data
from .validation import check_chat_not_completed, check_max_turns_not_exceeded


__all__ = [
    'check_chat_not_completed',
    'check_max_turns_not_exceeded',
    'format_conversation_for_llm',
    'get_openwebui_token',
    'get_pagination_data',
]
