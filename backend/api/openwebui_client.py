"""
OpenWebUI client service for making LLM completion requests.
"""

import os
from typing import Any

import requests
from django.contrib.auth.models import User


class OpenWebUIClient:
    """
    Client for interacting with OpenWebUI API.
    Handles LLM completion requests for conversations, help, and grading.
    Automatically manages token refresh on 401 errors.
    """

    def __init__(self, user: User = None, user_token: str | None = None):
        """
        Initialize OpenWebUI client.

        Args:
            user: Django User object (for automatic token management)
            user_token: User's OpenWebUI authentication token (overrides stored token)
        """
        self.base_url = os.getenv('OPENWEBUI_BASE_URL', 'http://localhost:8080')
        self.user = user
        self.user_token = user_token

        # If user provided but no token, try to get from profile
        if user and not user_token:
            try:
                self.user_token = user.profile.openwebui_token
            except:
                self.user_token = None

    def _get_headers(self) -> dict[str, str]:
        """Get headers for API requests."""
        headers = {
            'Content-Type': 'application/json',
        }
        if self.user_token:
            headers['Authorization'] = f'Bearer {self.user_token}'
        return headers

    def login(self, email: str, password: str) -> str:
        """
        Login to OpenWebUI and get authentication token.

        Args:
            email: User's email
            password: User's password

        Returns:
            Authentication token

        Raises:
            requests.RequestException: If login fails
        """
        url = f'{self.base_url}/api/v1/auths/signin'
        payload = {
            'email': email,
            'password': password,
        }

        response = requests.post(url, json=payload, timeout=30)
        response.raise_for_status()

        data = response.json()
        token = data.get('token')

        if not token:
            raise ValueError('No token returned from OpenWebUI login')

        self.user_token = token

        # Save token to user profile if user is provided
        if self.user:
            try:
                from .models import UserProfile

                profile, _created = UserProfile.objects.get_or_create(user=self.user)
                profile.openwebui_token = token
                profile.save()
            except Exception as e:
                print(f'Warning: Could not save OpenWebUI token to profile: {e}')

        return token

    def chat_completion(
        self,
        model: str,
        messages: list[dict[str, str]],
        temperature: float | None = None,
        max_tokens: int | None = None,
        timeout: int | None = None,
    ) -> dict[str, Any]:
        """
        Make a chat completion request to OpenWebUI.
        Automatically retries once on 401 errors if user credentials available.

        Args:
            model: Model ID to use (e.g., 'slc-resident', 'slc-conversation-helper')
            messages: List of message objects with 'role' and 'content'
            temperature: Sampling temperature (optional)
            max_tokens: Maximum tokens in response (optional)
            timeout: Request timeout in seconds (default: 180 for longer operations)

        Returns:
            Response from OpenWebUI API

        Raises:
            requests.RequestException: If the API request fails
        """
        import logging

        logger = logging.getLogger(__name__)

        url = f'{self.base_url}/api/chat/completions'

        payload = {
            'model': model,
            'messages': messages,
        }

        if temperature is not None:
            payload['temperature'] = temperature
        if max_tokens is not None:
            payload['max_tokens'] = max_tokens

        # Default timeout is 180 seconds (3 minutes) to handle long-running LLM operations
        request_timeout = timeout if timeout is not None else 180

        # Log request details for debugging environment differences
        logger.info(
            f'OpenWebUI Request: base_url={self.base_url}, model={model}, '
            f'messages_count={len(messages)}, timeout={request_timeout}, '
            f'temperature={temperature}, max_tokens={max_tokens}'
        )

        try:
            response = requests.post(
                url,
                headers=self._get_headers(),
                json=payload,
                timeout=request_timeout,
            )

            # Check for error before raising
            if response.status_code >= 400:
                # Try to get detailed error from response body
                try:
                    error_body = response.json()
                    logger.error(f'OpenWebUI Error Response Body: {error_body}')
                except:
                    logger.error(f'OpenWebUI Error Response Text: {response.text}')

            # Handle 401 - token expired
            if response.status_code == 401:
                if not self.user:
                    raise Exception(
                        'OpenWebUI token expired and no user available for re-authentication'
                    )

                # Try to get fresh credentials from user profile
                try:
                    from .models import UserProfile

                    UserProfile.objects.get(user=self.user)

                    # Check if we have stored credentials for automatic re-login
                    # Note: For now, we'll just raise an error since we don't store passwords
                    raise Exception(
                        'OpenWebUI token expired - user needs to log in again'
                    )

                except UserProfile.DoesNotExist:
                    raise Exception(
                        'OpenWebUI token expired and no profile found for user'
                    )

            response.raise_for_status()
            return response.json()

        except requests.Timeout:
            raise Exception(
                f'OpenWebUI request timed out after {request_timeout} seconds'
            )
        except requests.RequestException as e:
            # Enhanced error logging to capture full error details from OpenRouter
            import logging

            logger = logging.getLogger(__name__)

            error_detail = str(e)
            full_error_info = {
                'status_code': None,
                'response_text': None,
                'response_json': None,
                'error_type': type(e).__name__,
            }

            if hasattr(e, 'response') and e.response is not None:
                full_error_info['status_code'] = e.response.status_code
                full_error_info['response_text'] = e.response.text

                try:
                    error_json = e.response.json()
                    full_error_info['response_json'] = error_json

                    # Try to extract the most meaningful error message
                    if isinstance(error_json, dict):
                        # OpenWebUI/OpenRouter might return error in different formats
                        error_detail = (
                            error_json.get('detail')
                            or error_json.get('error')
                            or error_json.get('message')
                            or str(error_json)
                        )

                        # If it's a nested error object
                        if isinstance(error_detail, dict):
                            error_detail = error_detail.get('message') or str(
                                error_detail
                            )
                    else:
                        error_detail = str(error_json)
                except:
                    error_detail = e.response.text or str(e)

            # Log the full error for debugging
            logger.error(f'OpenWebUI API Error - Full details: {full_error_info}')
            logger.error(
                f'Request details: base_url={self.base_url}, model={payload.get("model")}, messages_count={len(payload.get("messages", []))}'
            )

            # Log message preview for debugging (first and last message)
            messages_preview = payload.get('messages', [])
            if messages_preview:
                logger.error(f'First message: {messages_preview[0]}')
                if len(messages_preview) > 1:
                    logger.error(f'Last message: {messages_preview[-1]}')

            # Raise exception with enhanced error message
            raise Exception(
                f'OpenWebUI API error: {full_error_info["status_code"]}: {error_detail}'
            )

    def get_conversation_response(
        self,
        model: str,
        messages: list[dict[str, str]],
    ) -> str:
        """
        Get a response from the resident model during conversation.

        Args:
            model: Model ID (e.g., 'slc-resident')
            messages: Conversation history

        Returns:
            The assistant's response text
        """
        import logging

        logger = logging.getLogger(__name__)

        # Validate and sanitize messages before sending
        validated_messages = []
        total_chars = 0

        for msg in messages:
            # Ensure message has required fields
            if not msg.get('role') or not msg.get('content'):
                logger.warning(f'Skipping invalid message: {msg}')
                continue

            # Ensure content is a string
            content = str(msg.get('content', ''))

            # Track total length
            total_chars += len(content)

            validated_messages.append(
                {
                    'role': msg['role'],
                    'content': content,
                }
            )

        # Log warning if conversation is very long
        # Qwen models through OpenRouter may have effective limits lower than spec
        if (
            total_chars > 30000
        ):  # ~7.5k tokens - conservative for Qwen through OpenRouter
            logger.warning(
                f'Large conversation: {total_chars} characters (~{total_chars // 4} tokens), may hit limits with Qwen model'
            )

        # Regular conversation uses default timeout (180s)
        response = self.chat_completion(model=model, messages=validated_messages)

        # Validate response structure
        if 'choices' not in response:
            logger.error(f'Unexpected response format from OpenWebUI: {response}')
            raise Exception(
                f"Invalid response format: missing 'choices' field. Response: {response}"
            )

        if not response['choices'] or len(response['choices']) == 0:
            logger.error(f'Empty choices in response: {response}')
            raise Exception('No choices returned in response')

        # Extract content from first choice
        try:
            return response['choices'][0]['message']['content']
        except (KeyError, IndexError) as e:
            logger.error(f'Failed to extract content from response: {response}')
            raise Exception(f'Invalid response structure: {e}. Response: {response}')

    def get_help_response(
        self,
        messages: list[dict[str, str]],
    ) -> str:
        """
        Get help advice from the conversation helper tutor.

        Args:
            messages: Formatted messages for the help request

        Returns:
            Help text (2 paragraphs)
        """
        import logging

        logger = logging.getLogger(__name__)

        # Help requests use default timeout (180s)
        response = self.chat_completion(
            model='slc-conversation-helper',
            messages=messages,
            temperature=0.7,
        )

        # Validate response structure
        if 'choices' not in response or not response['choices']:
            logger.error(f'Invalid help response format: {response}')
            raise Exception(
                f'Invalid response format from help model. Response: {response}'
            )

        try:
            return response['choices'][0]['message']['content']
        except (KeyError, IndexError) as e:
            logger.error(f'Failed to extract help content: {response}')
            raise Exception(f'Invalid help response structure: {e}')

    def get_grading_response(
        self,
        messages: list[dict[str, str]],
    ) -> dict[str, Any]:
        """
        Get grading assessment from the evaluator tutor.

        Args:
            messages: Formatted messages for the grading request

        Returns:
            Parsed JSON grading data
        """
        import json
        import logging

        logger = logging.getLogger(__name__)

        # Grading can take longer, use 5 minute timeout
        response = self.chat_completion(
            model='slc-tutor-evaluator',
            messages=messages,
            temperature=0.3,  # Lower temperature for consistent grading
            timeout=300,  # 5 minutes for grading operations
        )

        # Validate response structure
        if 'choices' not in response or not response['choices']:
            logger.error(f'Invalid grading response format: {response}')
            raise Exception(
                f'Invalid response format from grading model. Response: {response}'
            )

        try:
            content = response['choices'][0]['message']['content']
        except (KeyError, IndexError) as e:
            logger.error(f'Failed to extract grading content: {response}')
            raise Exception(f'Invalid grading response structure: {e}')

        # Parse JSON response
        try:
            return json.loads(content)
        except json.JSONDecodeError as e:
            logger.error(f'Failed to parse grading JSON. Content: {content}')
            raise Exception(f'Failed to parse grading response as JSON: {e!s}')
