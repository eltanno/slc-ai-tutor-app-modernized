"""
API Views package.

Re-exports all views for backward compatibility with existing imports.
"""

from .auth_views import (
    AllUsersView,
    CreateUserView,
    DebugConfigView,
    GetLoggedInUserView,
    TokenObtainPairView,
)
from .chat_operations_views import (
    ChatGetHelpView,
    ChatGradeView,
    ChatSendMessageView,
)
from .chat_views import (
    ChatDetail,
    Chats,
    UserChats,
)
from .note_views import (
    NoteDetail,
    Notes,
)


__all__ = [
    # Auth views
    'AllUsersView',
    'CreateUserView',
    'DebugConfigView',
    'GetLoggedInUserView',
    'TokenObtainPairView',
    # Note views
    'NoteDetail',
    'Notes',
    # Chat views
    'ChatDetail',
    'Chats',
    'UserChats',
    # Chat operations views
    'ChatGetHelpView',
    'ChatGradeView',
    'ChatSendMessageView',
]
