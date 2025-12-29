from django.urls import path

from . import views


urlpatterns = [
    path('notes/', views.Notes.as_view(), name='note-list'),
    path('notes/<int:pk>/', views.NoteDetail.as_view(), name='note-detail'),
    path('user/me/', views.GetLoggedInUserView.as_view(), name='user-me'),
    # Debug endpoint (only works in DEBUG mode)
    path('debug/config/', views.DebugConfigView.as_view(), name='debug-config'),
    # User management endpoints (staff only)
    path('users/', views.AllUsersView.as_view(), name='all-users'),
    # Chat endpoints
    path('chats/', views.Chats.as_view(), name='chat-list'),
    path('chats/<int:pk>/', views.ChatDetail.as_view(), name='chat-detail'),
    # Staff-only chat endpoints
    path('users/<int:user_id>/chats/', views.UserChats.as_view(), name='user-chats'),
    # LLM operation endpoints
    path(
        'chats/<int:pk>/send-message/',
        views.ChatSendMessageView.as_view(),
        name='chat-send-message',
    ),
    path(
        'chats/<int:pk>/get-help/',
        views.ChatGetHelpView.as_view(),
        name='chat-get-help',
    ),
    path('chats/<int:pk>/grade/', views.ChatGradeView.as_view(), name='chat-grade'),
]
