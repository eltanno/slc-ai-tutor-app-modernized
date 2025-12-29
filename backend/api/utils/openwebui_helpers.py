"""OpenWebUI helper utilities."""

from __future__ import annotations

from typing import TYPE_CHECKING

from rest_framework import status
from rest_framework.response import Response


if TYPE_CHECKING:
    from django.contrib.auth.models import User


def get_openwebui_token(user: User) -> tuple[str | None, Response | None]:
    """
    Get OpenWebUI token from user profile.

    Args:
        user: The Django User instance.

    Returns:
        Tuple of (token, error_response).
        If token found: (token, None)
        If token not found: (None, error_response)
    """
    try:
        token = user.profile.openwebui_token
    except (AttributeError, Exception):  # noqa: BLE001
        token = None

    if not token:
        return None, Response(
            {
                'status': 'fail',
                'message': 'OpenWebUI token not found. Please log in again.',
                'error_code': 'TOKEN_EXPIRED',
            },
            status=status.HTTP_401_UNAUTHORIZED,
        )

    return token, None
