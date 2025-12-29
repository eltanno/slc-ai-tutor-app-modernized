"""
Background task handlers for async LLM operations.
"""

import logging
import threading

from django.utils import timezone

from .models import Chat
from .openwebui_client import OpenWebUIClient
from .prompts import CHAT_GRADING_SYSTEM_PROMPT, CHAT_HELP_SYSTEM_PROMPT
from .utils import format_conversation_for_llm


logger = logging.getLogger(__name__)


def process_chat_message_async(
    chat_id: int, user_message: str, openwebui_token: str, is_action: bool = False
):
    """
    Process a chat message in the background.
    Updates chat status and saves response when complete.

    Args:
        chat_id: ID of the chat
        user_message: The message content
        openwebui_token: User's OpenWebUI token
        is_action: If True, add a scenario message before the user message
    """

    def task():
        try:
            chat = Chat.objects.get(pk=chat_id)

            # Add messages to chat
            messages = chat.messages.copy() if chat.messages else []

            # If this is an action, add scenario message for display
            # and prepare a user message for the LLM
            if is_action:
                # Add scenario message for display in UI (yellow box)
                messages.append(
                    {
                        'role': 'scenario',
                        'content': user_message,
                    }
                )

                # Prepare messages for LLM - convert scenario to user message
                messages_for_llm = []
                for msg in messages:
                    if msg.get('role') == 'scenario':
                        # Convert scenario messages to user messages for LLM
                        messages_for_llm.append(
                            {
                                'role': 'user',
                                'content': f'[Action: {msg["content"]}]',
                            }
                        )
                    else:
                        messages_for_llm.append(msg)
            else:
                # Regular user message
                messages.append(
                    {
                        'role': 'user',
                        'content': user_message,
                    }
                )
                # For regular messages, send messages as-is
                messages_for_llm = messages

            # Update status to thinking
            chat.status = Chat.STATUS_THINKING
            chat.messages = messages
            chat.save()

            # Limit conversation history to prevent token overflow
            # Qwen models can be sensitive to context length, especially through OpenRouter
            # Keep system message + last N exchanges to stay under token limits
            import os

            MAX_CONVERSATION_EXCHANGES = int(
                os.getenv('MAX_CONVERSATION_EXCHANGES', '6')
            )  # Reduced to 6 for Qwen (12 messages max)

            messages_for_llm_limited = []
            system_messages = [m for m in messages_for_llm if m.get('role') == 'system']
            non_system_messages = [
                m for m in messages_for_llm if m.get('role') != 'system'
            ]

            # Always include system message (scenario instructions)
            messages_for_llm_limited.extend(system_messages)

            # Keep only recent conversation history
            if len(non_system_messages) > (MAX_CONVERSATION_EXCHANGES * 2):
                logger.info(
                    f'Chat {chat_id}: Trimming conversation history from {len(non_system_messages)} to {MAX_CONVERSATION_EXCHANGES * 2} messages'
                )
                # Keep last N exchanges (N user + N assistant messages)
                messages_for_llm_limited.extend(
                    non_system_messages[-(MAX_CONVERSATION_EXCHANGES * 2) :]
                )
            else:
                messages_for_llm_limited.extend(non_system_messages)

            # Estimate total tokens (rough: 4 chars = 1 token for English, Qwen uses similar tokenization)
            total_chars = sum(
                len(str(m.get('content', ''))) for m in messages_for_llm_limited
            )
            estimated_tokens = total_chars // 4
            logger.info(
                f'Chat {chat_id}: Sending {len(messages_for_llm_limited)} messages (~{estimated_tokens} tokens) to LLM (Qwen model)'
            )

            # Qwen models through OpenRouter may have stricter limits
            if estimated_tokens > 4000:  # Conservative limit for stability
                logger.warning(
                    f'Chat {chat_id}: High token count ({estimated_tokens}), may fail with Qwen through OpenRouter'
                )
                # If still too large, trim more aggressively
                if estimated_tokens > 6000:
                    # Further reduce to last 4 exchanges if needed
                    logger.warning(
                        f'Chat {chat_id}: Token count very high, reducing to last 4 exchanges'
                    )
                    messages_for_llm_limited = (
                        system_messages + non_system_messages[-8:]
                    )

            # Get LLM response using the limited message history
            client = OpenWebUIClient(user_token=openwebui_token)
            response_content = client.get_conversation_response(
                model='slc-resident',
                messages=messages_for_llm_limited,
            )

            # Add assistant response to messages
            messages.append(
                {
                    'role': 'assistant',
                    'content': response_content,
                }
            )

            # Update chat
            chat.messages = messages
            chat.interaction_count = len(
                [m for m in messages if m.get('role') == 'user']
            )
            chat.status = Chat.STATUS_READY
            chat.save()

        except Exception as e:
            # Log the full error details
            logger.error(
                f'Error in process_chat_message_async for chat_id={chat_id}: {e!s}',
                exc_info=True,
            )

            # On error, update chat with error status
            try:
                chat = Chat.objects.get(pk=chat_id)
                chat.status = Chat.STATUS_READY
                # Store detailed error in messages
                messages = chat.messages.copy() if chat.messages else []
                messages.append(
                    {
                        'role': 'system',
                        'content': f'Error processing message: {e!s}',
                    }
                )
                chat.messages = messages
                chat.save()
                logger.info(f'Updated chat {chat_id} with error message')
            except Exception as save_error:
                logger.error(f'Failed to save error to chat {chat_id}: {save_error!s}')
                # Chat may have been deleted

    # Start background thread
    thread = threading.Thread(target=task)
    thread.daemon = True
    thread.start()


def process_help_request_async(chat_id, user_token):
    """
    Process help request in a background thread.
    """

    def task():
        try:
            chat = Chat.objects.get(pk=chat_id)

            # Set chat status to getting_help
            chat.status = Chat.STATUS_GETTING_HELP

            # Calculate which turn this is
            current_turn = len([m for m in chat.messages if m.get('role') == 'user'])

            # Add processing placeholder to help_responses
            help_responses = chat.help_responses or []
            help_responses.append(
                {
                    'turn': current_turn,
                    'timestamp': timezone.now().isoformat(),
                    'help_text': '',
                    'status': 'processing',
                }
            )
            chat.help_responses = help_responses
            chat.save()

            # Format conversation for help request
            conversation_text = format_conversation_for_llm(chat)

            # Prepare messages for help
            messages = [
                {'role': 'system', 'content': CHAT_HELP_SYSTEM_PROMPT},
                {'role': 'user', 'content': conversation_text},
            ]

            # Get help response
            client = OpenWebUIClient(user_token=user_token)
            help_text = client.get_help_response(messages)

            # Update help_responses with result
            chat = Chat.objects.get(pk=chat_id)
            help_responses = chat.help_responses or []
            # Remove the processing placeholder
            help_responses = [
                h
                for h in help_responses
                if h.get('status') != 'processing' or h.get('turn') != current_turn
            ]

            help_entry = {
                'turn': current_turn,
                'timestamp': timezone.now().isoformat(),
                'help_text': help_text,
                'status': 'completed',
            }
            help_responses.append(help_entry)
            chat.help_responses = help_responses

            # Reset chat status to ready
            chat.status = Chat.STATUS_READY
            chat.save()

        except Exception as e:
            # Log the full error details
            logger.error(
                f'Error in process_help_request_async for chat_id={chat_id}: {e!s}',
                exc_info=True,
            )

            # On error, mark help request as failed and reset status
            try:
                chat = Chat.objects.get(pk=chat_id)
                help_responses = chat.help_responses or []
                current_turn = len(
                    [m for m in chat.messages if m.get('role') == 'user']
                )

                # Remove processing placeholder
                help_responses = [
                    h
                    for h in help_responses
                    if h.get('status') != 'processing' or h.get('turn') != current_turn
                ]

                help_entry = {
                    'turn': current_turn,
                    'timestamp': timezone.now().isoformat(),
                    'help_text': f'Error getting help: {e!s}',
                    'status': 'error',
                }
                help_responses.append(help_entry)
                chat.help_responses = help_responses

                # Reset chat status to ready even on error
                chat.status = Chat.STATUS_READY
                chat.save()
            except Exception:  # nosec B110
                pass  # Chat may have been deleted - nothing we can do

    # Start background thread
    thread = threading.Thread(target=task)
    thread.daemon = True
    thread.start()


def process_grading_async(chat_id: int, openwebui_token: str):
    """
    Process chat grading in the background.
    Updates chat with grading data when complete.
    """

    def task():
        try:
            chat = Chat.objects.get(pk=chat_id)

            # Format conversation for grading request
            conversation_text = format_conversation_for_llm(chat)

            # Prepare messages for grading
            messages = [
                {'role': 'system', 'content': CHAT_GRADING_SYSTEM_PROMPT},
                {'role': 'user', 'content': conversation_text},
            ]

            # Get grading response
            client = OpenWebUIClient(user_token=openwebui_token)
            grading_data = client.get_grading_response(messages)

            # Update chat with results
            chat.grading_data = grading_data
            chat.score = grading_data.get('score', {}).get('percentage', 0)
            chat.completed = True
            chat.status = Chat.STATUS_COMPLETE
            chat.save()

        except Exception as e:
            # Log the full error details
            logger.error(
                f'Error in process_grading_async for chat_id={chat_id}: {e!s}',
                exc_info=True,
            )

            # On error, reset status
            try:
                chat = Chat.objects.get(pk=chat_id)
                chat.status = Chat.STATUS_READY_FOR_GRADING
                # Store detailed error in grading_data
                chat.grading_data = {
                    'error': str(e),
                    'status': 'failed',
                    'error_type': type(e).__name__,
                }
                chat.save()
                logger.info(f'Updated chat {chat_id} with grading error')
            except Exception as save_error:
                logger.error(
                    f'Failed to save grading error to chat {chat_id}: {save_error!s}'
                )

    # Start background thread
    thread = threading.Thread(target=task)
    thread.daemon = True
    thread.start()
