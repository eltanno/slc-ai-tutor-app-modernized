"""Chat LLM operation views (send message, get help, grade)."""

from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from ..background_tasks import (
    process_chat_message_async,
    process_grading_async,
    process_help_request_async,
)
from ..models import Chat
from ..serializers import ChatSerializer
from ..utils import (
    check_chat_not_completed,
    check_max_turns_not_exceeded,
    get_openwebui_token,
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
        error = check_chat_not_completed(chat, 'send messages to')
        if error:
            return error

        # Check if max turns reached
        error = check_max_turns_not_exceeded(chat)
        if error:
            return error

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
        openwebui_token, token_error = get_openwebui_token(request.user)
        if token_error:
            return token_error

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
        error = check_chat_not_completed(chat, 'request help for')
        if error:
            return error

        # Check if max turns reached
        error = check_max_turns_not_exceeded(chat)
        if error:
            return error

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
        openwebui_token, token_error = get_openwebui_token(request.user)
        if token_error:
            return token_error

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
        openwebui_token, token_error = get_openwebui_token(request.user)
        if token_error:
            return token_error

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
