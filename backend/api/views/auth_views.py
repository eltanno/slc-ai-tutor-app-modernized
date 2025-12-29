"""Authentication and user management views."""

from django.contrib.auth.models import User
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import (
    TokenObtainPairView as BaseTokenObtainPairView,
)

from ..openwebui_client import OpenWebUIClient
from ..serializers import UserSerializer
from ..utils import get_pagination_data


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
        except (AttributeError, Exception):
            pass

        return Response(config_info)
