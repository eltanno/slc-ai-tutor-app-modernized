from django.contrib import admin

from .models import Chat, ChatMessage, Note


@admin.register(Chat)
class ChatAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'title',
        'user',
        'avatar_id',
        'interaction_count',
        'score',
        'completed',
        'created_at',
        'updated_at',
    ]
    list_filter = ['completed', 'created_at', 'user']
    search_fields = ['title', 'user__username']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ['id', 'chat', 'role', 'timestamp', 'relevance_score']
    list_filter = ['role', 'timestamp']
    search_fields = ['content', 'chat__title']
    readonly_fields = ['timestamp']


admin.site.register(Note)
