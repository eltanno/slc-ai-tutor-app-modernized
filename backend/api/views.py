import math

from django.contrib.auth.models import User
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import (
    TokenObtainPairView as BaseTokenObtainPairView,
)

from .background_tasks import (
    process_chat_message_async,
    process_grading_async,
    process_help_request_async,
)
from .models import Chat, Note
from .openwebui_client import OpenWebUIClient
from .serializers import (
    ChatCreateUpdateSerializer,
    ChatSerializer,
    NoteSerializer,
    UserSerializer,
)


class TokenObtainPairView(BaseTokenObtainPairView):
    """
    Custom JWT token view that also authenticates with OpenWebUI.
    """

    def post(self, request, *args, **kwargs):
        # Get the JWT tokens from the parent class
        response = super().post(request, *args, **kwargs)

        # If login was successful, also login to OpenWebUI
        if response.status_code == 200:
            username = request.data.get('username')
            password = request.data.get('password')

            try:
                # Get the user
                user = User.objects.get(username=username)

                # Login to OpenWebUI
                client = OpenWebUIClient(user=user)
                client.login(email=username, password=password)

                # Token is automatically saved to user profile by the login method

            except Exception as e:
                # Log the error but don't fail the Django login
                print(f'Warning: OpenWebUI login failed for user {username}: {e}')

        return response


class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]


class GetLoggedInUserView(generics.GenericAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        user = request.user
        if user:
            serializer = self.serializer_class(user)
            return Response(
                {'status': 'success', 'user': serializer.data},
                status=status.HTTP_200_OK,
            )
        return Response(
            {'status': 'fail', 'message': 'User not logged in', 'user': None},
            status=status.HTTP_200_OK,
        )


class AllUsersView(generics.GenericAPIView):
    """List all users in the system (staff only)."""

    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        from django.db.models import Count

        # Only allow staff users
        if not request.user.is_staff:
            return Response(
                {
                    'status': 'fail',
                    'message': 'Only staff users can access this endpoint',
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        users = User.objects.annotate(
            chat_count=Count('chats'),
        ).order_by('username')
        total_items = users.count()
        pagination = get_pagination_data(request, total_items)

        serializer = self.serializer_class(
            users[pagination['start_index'] : pagination['end_index']],
            many=True,
        )

        return Response(
            {
                'status': 'success',
                'pagination': pagination,
                'items': serializer.data,
            },
            status=status.HTTP_200_OK,
        )


class DebugConfigView(APIView):
    """
    Debug endpoint to check OpenWebUI configuration.
    Only available in DEBUG mode.
    """

    permission_classes = [permissions.AllowAny]

    def get(self, request):
        import os

        from django.conf import settings

        # Only allow in debug mode
        if not settings.DEBUG:
            return Response(
                {'error': 'Debug endpoint only available in DEBUG mode'}, status=403
            )

        config_info = {
            'openwebui_base_url': os.getenv(
                'OPENWEBUI_BASE_URL', 'http://localhost:8080'
            ),
            'user_has_profile': hasattr(request.user, 'profile'),
            'user_has_token': False,
            'django_debug': settings.DEBUG,
            'environment': {
                'OPENWEBUI_BASE_URL': os.getenv('OPENWEBUI_BASE_URL'),
                'DJANGO_DEBUG': os.getenv('DJANGO_DEBUG'),
            },
        }

        try:
            profile = request.user.profile
            config_info['user_has_token'] = bool(profile.openwebui_token)
            config_info['token_length'] = (
                len(profile.openwebui_token) if profile.openwebui_token else 0
            )
        except:
            pass

        return Response(config_info)


# crud for notes
class Notes(generics.GenericAPIView):
    serializer_class = NoteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Note.objects.filter(author=user).order_by('-id')

    def get(self, request):
        notes = self.get_queryset()
        total_items = notes.count()
        pagination = get_pagination_data(self.request, total_items)
        # use zero-based slice indices
        serializer = self.serializer_class(
            notes[pagination['start_index'] : pagination['end_index']], many=True
        )
        return Response(
            {
                'status': 'success',
                'pagination': pagination,
                'items': serializer.data,
            },
            status=status.HTTP_200_OK,
        )

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save(author=request.user)
            return Response(
                {
                    'status': 'success',
                    'message': 'Note created successfully',
                    'note': serializer.data,
                },
                status=status.HTTP_201_CREATED,
            )
        return Response(
            {
                'status': 'fail',
                'message': 'Note creation failed',
                'errors': serializer.errors,
            },
            status=status.HTTP_400_BAD_REQUEST,
        )


class NoteDetail(generics.GenericAPIView):
    serializer_class = NoteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Note.objects.filter(author=user)

    def get_note(self, pk):
        try:
            return self.get_queryset().get(pk=pk)
        except Note.DoesNotExist:
            return None

    def get(self, request, pk):
        note = self.get_note(pk)
        if note:
            serializer = self.serializer_class(note)
            return Response(
                {'status': 'success', 'note': serializer.data},
                status=status.HTTP_200_OK,
            )
        return Response(
            {'status': 'fail', 'message': 'Note not found'},
            status=status.HTTP_404_NOT_FOUND,
        )

    def put(self, request, pk):
        note = self.get_note(pk)
        if note:
            serializer = self.serializer_class(note, data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(
                    {
                        'status': 'success',
                        'message': 'Note updated successfully',
                        'note': serializer.data,
                    },
                    status=status.HTTP_200_OK,
                )
            return Response(
                {
                    'status': 'fail',
                    'message': 'Note update failed',
                    'errors': serializer.errors,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(
            {'status': 'fail', 'message': 'Note not found'},
            status=status.HTTP_404_NOT_FOUND,
        )

    def delete(self, request, pk):
        note = self.get_note(pk)
        if note:
            note.delete()
            return Response(
                {'status': 'success', 'message': 'Note deleted successfully'},
                status=status.HTTP_204_NO_CONTENT,
            )
        return Response(
            {'status': 'fail', 'message': 'Note not found'},
            status=status.HTTP_404_NOT_FOUND,
        )


# ============= CHAT VIEWS =============


class Chats(generics.GenericAPIView):
    """List all chats for the authenticated user or create a new chat."""

    serializer_class = ChatCreateUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Chat.objects.filter(user=user).order_by('-updated_at')

    def get(self, request):
        """List all chats with pagination."""
        chats = self.get_queryset()
        total_items = chats.count()
        pagination = get_pagination_data(self.request, total_items)

        # Use ChatSerializer for GET (includes full user object)
        serializer = ChatSerializer(
            chats[pagination['start_index'] : pagination['end_index']],
            many=True,
        )

        return Response(
            {
                'status': 'success',
                'pagination': pagination,
                'items': serializer.data,
            },
            status=status.HTTP_200_OK,
        )

    def post(self, request):
        """Create a new chat."""
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            chat = serializer.save(user=request.user)
            # Return with full user object
            response_serializer = ChatSerializer(chat)
            return Response(
                {
                    'status': 'success',
                    'message': 'Chat created successfully',
                    'chat': response_serializer.data,
                },
                status=status.HTTP_201_CREATED,
            )
        return Response(
            {
                'status': 'fail',
                'message': 'Chat creation failed',
                'errors': serializer.errors,
            },
            status=status.HTTP_400_BAD_REQUEST,
        )


class UserChats(generics.GenericAPIView):
    """List all chats for a specific user (staff only)."""

    serializer_class = ChatSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, user_id):
        """List all chats for specified user with pagination."""
        # Only allow staff users
        if not request.user.is_staff:
            return Response(
                {
                    'status': 'fail',
                    'message': 'Only staff users can access this endpoint',
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        # Verify user exists
        try:
            target_user = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return Response(
                {
                    'status': 'fail',
                    'message': 'User not found',
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        chats = Chat.objects.filter(user=target_user).order_by('-updated_at')
        total_items = chats.count()
        pagination = get_pagination_data(request, total_items)

        serializer = self.serializer_class(
            chats[pagination['start_index'] : pagination['end_index']],
            many=True,
        )

        return Response(
            {
                'status': 'success',
                'pagination': pagination,
                'items': serializer.data,
                'user': UserSerializer(target_user).data,
            },
            status=status.HTTP_200_OK,
        )
        """Create a new chat."""
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            chat = serializer.save(user=request.user)
            # Return with full user object
            response_serializer = ChatSerializer(chat)
            return Response(
                {
                    'status': 'success',
                    'message': 'Chat created successfully',
                    'chat': response_serializer.data,
                },
                status=status.HTTP_201_CREATED,
            )
        return Response(
            {
                'status': 'fail',
                'message': 'Chat creation failed',
                'errors': serializer.errors,
            },
            status=status.HTTP_400_BAD_REQUEST,
        )


class ChatDetail(generics.GenericAPIView):
    """Retrieve, update, or delete a specific chat."""

    serializer_class = ChatCreateUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Staff users can access all chats
        if user.is_staff:
            return Chat.objects.all()
        return Chat.objects.filter(user=user)

    def get_chat(self, pk):
        try:
            return self.get_queryset().get(pk=pk)
        except Chat.DoesNotExist:
            return None

    def get(self, request, pk):
        """Get a specific chat by ID."""
        chat = self.get_chat(pk)
        if chat:
            serializer = ChatSerializer(chat)  # Use full serializer
            return Response(
                {
                    'status': 'success',
                    'chat': serializer.data,
                },
                status=status.HTTP_200_OK,
            )
        return Response(
            {
                'status': 'fail',
                'message': 'Chat not found',
            },
            status=status.HTTP_404_NOT_FOUND,
        )

    def put(self, request, pk):
        """Update a chat (full update)."""
        chat = self.get_chat(pk)
        if chat:
            # Only allow chat owner to update (not staff)
            if chat.user != request.user:
                return Response(
                    {
                        'status': 'fail',
                        'message': 'You can only update your own chats',
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )

            serializer = self.serializer_class(chat, data=request.data)
            if serializer.is_valid():
                chat = serializer.save()
                # Update interaction count based on messages
                user_messages = [m for m in chat.messages if m.get('role') == 'user']
                chat.interaction_count = len(user_messages)
                chat.save()

                response_serializer = ChatSerializer(chat)
                return Response(
                    {
                        'status': 'success',
                        'message': 'Chat updated successfully',
                        'chat': response_serializer.data,
                    },
                    status=status.HTTP_200_OK,
                )
            return Response(
                {
                    'status': 'fail',
                    'message': 'Chat update failed',
                    'errors': serializer.errors,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(
            {
                'status': 'fail',
                'message': 'Chat not found',
            },
            status=status.HTTP_404_NOT_FOUND,
        )

    def patch(self, request, pk):
        """Partial update a chat."""
        chat = self.get_chat(pk)
        if chat:
            # Only allow chat owner to update (not staff)
            if chat.user != request.user:
                return Response(
                    {
                        'status': 'fail',
                        'message': 'You can only update your own chats',
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )

            serializer = self.serializer_class(chat, data=request.data, partial=True)
            if serializer.is_valid():
                chat = serializer.save()
                # Update interaction count if messages were updated
                if 'messages' in request.data:
                    user_messages = [
                        m for m in chat.messages if m.get('role') == 'user'
                    ]
                    chat.interaction_count = len(user_messages)
                    chat.save()

                response_serializer = ChatSerializer(chat)
                return Response(
                    {
                        'status': 'success',
                        'message': 'Chat updated successfully',
                        'chat': response_serializer.data,
                    },
                    status=status.HTTP_200_OK,
                )
            return Response(
                {
                    'status': 'fail',
                    'message': 'Chat update failed',
                    'errors': serializer.errors,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(
            {
                'status': 'fail',
                'message': 'Chat not found',
            },
            status=status.HTTP_404_NOT_FOUND,
        )

    def delete(self, request, pk):
        """Delete a chat."""
        chat = self.get_chat(pk)
        if chat:
            # Only allow chat owner to delete (not staff)
            if chat.user != request.user:
                return Response(
                    {
                        'status': 'fail',
                        'message': 'You can only delete your own chats',
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )

            chat.delete()
            return Response(
                {
                    'status': 'success',
                    'message': 'Chat deleted successfully',
                },
                status=status.HTTP_204_NO_CONTENT,
            )
        return Response(
            {
                'status': 'fail',
                'message': 'Chat not found',
            },
            status=status.HTTP_404_NOT_FOUND,
        )


class ChatSendMessageView(APIView):
    """Send a user message and get LLM response asynchronously."""

    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        """Send message to chat and start async LLM processing."""
        try:
            chat = Chat.objects.get(pk=pk, user=request.user)
        except Chat.DoesNotExist:
            return Response(
                {
                    'status': 'fail',
                    'message': 'Chat not found',
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        # Check if chat is completed or graded
        if chat.completed or chat.status == Chat.STATUS_COMPLETE:
            return Response(
                {
                    'status': 'fail',
                    'message': 'Cannot send messages to a completed or graded chat',
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Check if max turns reached (if max_turns is set in course_data)
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

        user_message = request.data.get('message')
        if not user_message:
            return Response(
                {
                    'status': 'fail',
                    'message': 'Message content is required',
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Check if this is an action message (for scenario display)
        is_action = request.data.get('is_action', False)

        # Get OpenWebUI token from user profile
        try:
            openwebui_token = request.user.profile.openwebui_token
        except:
            openwebui_token = None

        if not openwebui_token:
            return Response(
                {
                    'status': 'fail',
                    'message': 'OpenWebUI token not found. Please log in again.',
                    'error_code': 'TOKEN_EXPIRED',
                },
                status=status.HTTP_401_UNAUTHORIZED,
            )

        # Update chat status to in_progress immediately
        chat.status = Chat.STATUS_IN_PROGRESS
        chat.save()

        # Start async processing with is_action flag
        process_chat_message_async(chat.id, user_message, openwebui_token, is_action)

        # Return immediately with current chat state
        serializer = ChatSerializer(chat)
        return Response(
            {
                'status': 'success',
                'message': 'Message is being processed',
                'chat': serializer.data,
                'processing': True,
            },
            status=status.HTTP_202_ACCEPTED,
        )


class ChatGetHelpView(APIView):
    """Get conversation help from the helper tutor asynchronously."""

    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        """Start async help request processing."""
        try:
            chat = Chat.objects.get(pk=pk, user=request.user)
        except Chat.DoesNotExist:
            return Response(
                {
                    'status': 'fail',
                    'message': 'Chat not found',
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        # Check if chat is completed or graded
        if chat.completed or chat.status == Chat.STATUS_COMPLETE:
            return Response(
                {
                    'status': 'fail',
                    'message': 'Cannot request help for a completed or graded chat',
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Check if max turns reached (if max_turns is set in course_data)
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

        if not chat.messages:
            return Response(
                {
                    'status': 'fail',
                    'message': 'No conversation to get help for',
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Calculate current turn (number of user messages)
        current_turn = len([m for m in chat.messages if m.get('role') == 'user'])

        # Check if help was already requested for this turn
        help_responses = chat.help_responses or []
        existing_help = [h for h in help_responses if h.get('turn') == current_turn]

        if existing_help:
            # Check if it's still processing
            if existing_help[-1].get('status') == 'processing':
                return Response(
                    {
                        'status': 'success',
                        'message': 'Help request is still being processed',
                        'processing': True,
                        'turn': current_turn,
                    },
                    status=status.HTTP_202_ACCEPTED,
                )
            # Already completed
            return Response(
                {
                    'status': 'fail',
                    'message': 'Help has already been requested for this turn',
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Get OpenWebUI token from user profile
        try:
            openwebui_token = request.user.profile.openwebui_token
        except:
            openwebui_token = None

        if not openwebui_token:
            return Response(
                {
                    'status': 'fail',
                    'message': 'OpenWebUI token not found. Please log in again.',
                    'error_code': 'TOKEN_EXPIRED',
                },
                status=status.HTTP_401_UNAUTHORIZED,
            )

        # Add "processing" placeholder
        help_entry = {
            'turn': current_turn,
            'timestamp': timezone.now().isoformat(),
            'help_text': '',
            'status': 'processing',
        }
        help_responses.append(help_entry)
        chat.help_responses = help_responses
        chat.save()

        # Start async processing
        process_help_request_async(chat.id, openwebui_token)

        return Response(
            {
                'status': 'success',
                'message': 'Help request is being processed',
                'processing': True,
                'turn': current_turn,
            },
            status=status.HTTP_202_ACCEPTED,
        )

    def _format_conversation(self, chat: Chat) -> str:
        """Format chat data for help request."""
        # Get metadata
        metadata = {
            'title': chat.title,
            'course_data': chat.course_data,
            'avatar_id': chat.avatar_id,
            'interaction_count': chat.interaction_count,
        }

        # Format transcript
        transcript_lines = []
        for msg in chat.messages:
            role = 'User' if msg.get('role') == 'user' else 'Resident'
            transcript_lines.append(f'{role}: {msg.get("content", "")}')

        transcript = '\n'.join(transcript_lines)

        return f"""CONVERSATION METADATA:
{metadata}

CONVERSATION TRANSCRIPT:
{transcript}"""


class ChatGradeView(APIView):
    """Grade and score a completed chat asynchronously."""

    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        """Start async grading process."""
        try:
            chat = Chat.objects.get(pk=pk, user=request.user)
        except Chat.DoesNotExist:
            return Response(
                {
                    'status': 'fail',
                    'message': 'Chat not found',
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        if not chat.messages:
            return Response(
                {
                    'status': 'fail',
                    'message': 'No conversation to grade',
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Check if already successfully graded (but allow re-grading if there was an error)
        if chat.grading_data:
            # Check if it's an error state
            if (
                isinstance(chat.grading_data, dict)
                and chat.grading_data.get('status') == 'failed'
            ):
                # Allow retry on failed grading
                pass
            elif isinstance(chat.grading_data, dict) and 'error' in chat.grading_data:
                # Also allow retry if error property exists
                pass
            else:
                # Already successfully graded - return existing results
                return Response(
                    {
                        'status': 'success',
                        'grading': chat.grading_data,
                        'message': 'Chat was already graded (returning existing results)',
                    },
                    status=status.HTTP_200_OK,
                )

        # Check if currently grading
        if chat.status == Chat.STATUS_GRADING:
            return Response(
                {
                    'status': 'success',
                    'message': 'Grading is still in progress',
                    'processing': True,
                },
                status=status.HTTP_202_ACCEPTED,
            )

        # Get OpenWebUI token from user profile
        try:
            openwebui_token = request.user.profile.openwebui_token
        except:
            openwebui_token = None

        if not openwebui_token:
            return Response(
                {
                    'status': 'fail',
                    'message': 'OpenWebUI token not found. Please log in again.',
                    'error_code': 'TOKEN_EXPIRED',
                },
                status=status.HTTP_401_UNAUTHORIZED,
            )

        # Update chat status to grading
        chat.status = Chat.STATUS_GRADING
        chat.save()

        # Start async processing
        process_grading_async(chat.id, openwebui_token)

        return Response(
            {
                'status': 'success',
                'message': 'Grading is being processed',
                'processing': True,
            },
            status=status.HTTP_202_ACCEPTED,
        )

    def _format_conversation(self, chat: Chat) -> str:
        """Format chat data for grading request."""
        import json

        # Get metadata
        metadata = {
            'title': chat.title,
            'course_data': chat.course_data,
            'avatar_id': chat.avatar_id,
            'interaction_count': chat.interaction_count,
        }

        # Format transcript
        transcript_lines = []
        for msg in chat.messages:
            role = 'User' if msg.get('role') == 'user' else 'Resident'
            transcript_lines.append(f'{role}: {msg.get("content", "")}')

        transcript = '\n'.join(transcript_lines)

        return f"""CONVERSATION METADATA:
{json.dumps(metadata, indent=2)}

CONVERSATION TRANSCRIPT:
{transcript}"""


def get_pagination_data(request, total_items):
    # parse query params defensively
    try:
        page = int(request.GET.get('page', 1))
    except (TypeError, ValueError):
        page = 1
    try:
        page_size = int(request.GET.get('page_size', 10))
    except (TypeError, ValueError):
        page_size = 10

    if page < 1:
        page = 1
    if page_size <= 0:
        page_size = 10

    total_pages = max(1, math.ceil(total_items / page_size)) if page_size > 0 else 1
    next_page = page + 1 if page < total_pages else None
    prev_page = page - 1 if page > 1 else None

    start_index = max(0, (page - 1) * page_size)
    end_index = min(page * page_size, total_items)

    start_item = start_index + 1 if total_items > 0 else 0
    end_item = end_index

    return {
        'page': page,
        'page_size': page_size,
        'next_page': next_page,
        'prev_page': prev_page,
        'total_pages': total_pages,
        'start_item': start_item,
        'end_item': end_item,
        'start_index': start_index,
        'end_index': end_index,
        'total_items': total_items,
    }
