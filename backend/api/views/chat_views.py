"""Chat CRUD views."""

from django.contrib.auth.models import User
from rest_framework import generics, permissions, status
from rest_framework.response import Response

from ..models import Chat
from ..serializers import ChatCreateUpdateSerializer, ChatSerializer, UserSerializer
from ..utils import get_pagination_data


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
