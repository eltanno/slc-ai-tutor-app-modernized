#!/usr/bin/env python3
"""
Update ticket status in GitHub Project board.

Usage:
    python update_ticket.py <issue-number> <column-name> [comment]

Examples:
    python update_ticket.py 123 "In Progress" "Starting work on this"
    python update_ticket.py 456 "Done" "All tests passing"
"""

import sys
from pathlib import Path


# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from scripts.utils.github_api import GitHubAPI, GitHubAPIError


def update_ticket_status(
    issue_number: int,
    column_name: str,
    comment: str | None = None,
) -> None:
    """Update ticket status and optionally add comment.

    Args:
        issue_number: GitHub issue number
        column_name: Target column name
        comment: Optional comment to add
    """
    api = GitHubAPI()

    print(f'\n🔄 Updating issue #{issue_number}')
    print(f'   Moving to: {column_name}')

    # Add comment if provided
    if comment:
        try:
            api.add_comment(issue_number, comment)
            print('   ✓ Added comment')
        except GitHubAPIError as e:
            print(f'   ⚠ Warning: Could not add comment: {e}')

    # Move to column
    try:
        api.move_issue_to_column(issue_number, column_name)
        print(f'   ✓ Moved to {column_name} column')
    except GitHubAPIError as e:
        print(f'   ✗ Error moving to column: {e}')
        raise

    # Get issue URL
    issue = api.get_issue(issue_number)
    print(f'   🔗 {issue["html_url"]}')

    print('\n✅ Ticket updated successfully')


def main():
    """Main entry point."""
    if len(sys.argv) < 3:
        print('Usage: python update_ticket.py <issue-number> <column-name> [comment]')
        print('\nValid column names:')
        print('  - Backlog')
        print('  - Ready')
        print('  - In progress')
        print('  - In review')
        print('  - In Testing')
        print('  - Test Failed')
        print('  - Done')
        sys.exit(1)

    try:
        issue_number = int(sys.argv[1])
        column_name = sys.argv[2]
        comment = sys.argv[3] if len(sys.argv) > 3 else None

        update_ticket_status(issue_number, column_name, comment)

    except ValueError:
        print('Error: Issue number must be an integer')
        sys.exit(1)
    except GitHubAPIError as e:
        print(f'GitHub API Error: {e}')
        sys.exit(1)
    except Exception as e:
        print(f'Unexpected error: {e}')
        import traceback

        traceback.print_exc()
        sys.exit(1)


if __name__ == '__main__':
    main()
