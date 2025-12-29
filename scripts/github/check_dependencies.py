#!/usr/bin/env python3
"""
Check ticket dependencies before starting work.

Usage:
    python check_dependencies.py <issue-number>

Example:
    python check_dependencies.py 123

Returns exit code 0 if dependencies are met, 1 otherwise.
"""

import re
import sys
from pathlib import Path


# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from scripts.utils.github_api import GitHubAPI, GitHubAPIError


def parse_dependencies(issue_body: str) -> list[int]:
    """Parse issue dependencies from body.

    Args:
        issue_body: Issue description text

    Returns:
        List of dependency issue numbers
    """
    dependencies = []

    # Look for Dependencies section
    deps_match = re.search(
        r'## Dependencies\n(.*?)(?=\n##|\Z)',
        issue_body,
        re.DOTALL,
    )

    if deps_match:
        deps_content = deps_match.group(1)
        # Find issue references like #123
        issue_refs = re.findall(r'#(\d+)', deps_content)
        dependencies = [int(num) for num in issue_refs]

    return dependencies


def check_dependencies(issue_number: int) -> tuple[bool, list[Dict]]:
    """Check if all dependencies are met.

    Args:
        issue_number: Issue number to check

    Returns:
        Tuple of (all_met, unmet_dependencies)
    """
    api = GitHubAPI()

    # Get issue details
    issue = api.get_issue(issue_number)

    # Parse dependencies
    dep_numbers = parse_dependencies(issue['body'])

    if not dep_numbers:
        return True, []

    # Check each dependency
    unmet = []
    for dep_num in dep_numbers:
        try:
            dep_issue = api.get_issue(dep_num)
            if dep_issue['state'] != 'closed':
                unmet.append(
                    {
                        'number': dep_num,
                        'title': dep_issue['title'],
                        'state': dep_issue['state'],
                        'url': dep_issue['html_url'],
                    },
                )
        except GitHubAPIError as e:
            print(f'Warning: Could not check dependency #{dep_num}: {e}')

    return len(unmet) == 0, unmet


def main():
    """Main entry point."""
    if len(sys.argv) < 2:
        print('Usage: python check_dependencies.py <issue-number>')
        sys.exit(1)

    try:
        issue_number = int(sys.argv[1])

        print(f'\n🔍 Checking dependencies for issue #{issue_number}')

        all_met, unmet = check_dependencies(issue_number)

        if all_met:
            print('✅ All dependencies met - ready to start!')
            sys.exit(0)
        else:
            print(f'\n⚠️  {len(unmet)} unmet dependencies:')
            for dep in unmet:
                print(f'   - #{dep["number"]}: {dep["title"]}')
                print(f'     State: {dep["state"]}')
                print(f'     {dep["url"]}')
            print('\n❌ Cannot start work until dependencies are resolved')
            sys.exit(1)

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
