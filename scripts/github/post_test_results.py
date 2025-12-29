#!/usr/bin/env python3
"""
Post test results to a GitHub issue.

Usage:
    python post_test_results.py <issue-number> <pass|fail> [test-output-file]

Examples:
    python post_test_results.py 123 pass test_results.txt
    python post_test_results.py 456 fail test_results.txt
"""

import sys
from datetime import datetime
from pathlib import Path


# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from scripts.utils.github_api import GitHubAPI, GitHubAPIError


def format_test_results(
    passed: bool,
    test_output: str | None = None,
) -> str:
    """Format test results as Markdown comment.

    Args:
        passed: Whether tests passed
        test_output: Optional test output text

    Returns:
        Formatted Markdown comment
    """
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    if passed:
        comment = f"""## ✅ Test Results: PASSED

**Timestamp**: {timestamp}

All tests passed successfully!

"""
        if test_output:
            comment += f"""### Test Output

```
{test_output}
```

"""
        comment += """### Next Steps
- Issue moved to Done column
- Issue closed
"""
    else:
        comment = f"""## ❌ Test Results: FAILED

**Timestamp**: {timestamp}

Tests failed. Review the output below for details.

"""
        if test_output:
            comment += f"""### Test Output

```
{test_output}
```

"""
        comment += """### Next Steps
- Issue moved to Test Failed column
- Review failures and determine fix approach
- Move back to Ready when ready to address
"""

    return comment


def post_test_results(
    issue_number: int,
    passed: bool,
    test_output_file: str | None = None,
) -> None:
    """Post test results to issue and update status.

    Args:
        issue_number: GitHub issue number
        passed: Whether tests passed
        test_output_file: Optional path to test output file
    """
    api = GitHubAPI()

    # Read test output if provided
    test_output = None
    if test_output_file:
        try:
            with open(test_output_file) as f:
                test_output = f.read()
        except FileNotFoundError:
            print(f'Warning: Test output file not found: {test_output_file}')

    # Format comment
    comment = format_test_results(passed, test_output)

    print(f'\n📝 Posting test results to issue #{issue_number}')
    print(f'   Status: {"PASSED ✅" if passed else "FAILED ❌"}')

    # Add comment
    try:
        api.add_comment(issue_number, comment)
        print('   ✓ Posted test results comment')
    except GitHubAPIError as e:
        print(f'   ✗ Error posting comment: {e}')
        raise

    # Move to appropriate column
    if passed:
        try:
            api.move_issue_to_column(issue_number, 'Done')
            print('   ✓ Moved to Done column')
        except GitHubAPIError as e:
            print(f'   ⚠ Warning: Could not move to Done: {e}')

        # Close issue
        try:
            api.close_issue(issue_number)
            print('   ✓ Closed issue')
        except GitHubAPIError as e:
            print(f'   ⚠ Warning: Could not close issue: {e}')
    else:
        try:
            api.move_issue_to_column(issue_number, 'Test Failed')
            print('   ✓ Moved to Test Failed column')
        except GitHubAPIError as e:
            print(f'   ⚠ Warning: Could not move to Test Failed: {e}')

    # Get issue URL
    issue = api.get_issue(issue_number)
    print(f'   🔗 {issue["html_url"]}')

    print('\n✅ Test results posted successfully')


def main():
    """Main entry point."""
    if len(sys.argv) < 3:
        print(
            'Usage: python post_test_results.py <issue-number> <pass|fail> [test-output-file]',
        )
        sys.exit(1)

    try:
        issue_number = int(sys.argv[1])
        status = sys.argv[2].lower()
        test_output_file = sys.argv[3] if len(sys.argv) > 3 else None

        if status not in ['pass', 'fail']:
            print("Error: Status must be 'pass' or 'fail'")
            sys.exit(1)

        passed = status == 'pass'

        post_test_results(issue_number, passed, test_output_file)

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
