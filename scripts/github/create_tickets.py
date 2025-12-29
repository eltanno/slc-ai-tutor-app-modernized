#!/usr/bin/env python3
"""
Create GitHub tickets from an approved planning document.

Usage:
    python create_tickets.py <path-to-planning-doc>

Example:
    python create_tickets.py docs/planning/features/FEAT-001-user-auth.md
"""

import os
import re
import sys
from pathlib import Path


# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from scripts.utils.github_api import GitHubAPI, GitHubAPIError


def parse_planning_document(file_path: str) -> dict:
    """Parse planning document to extract metadata and tasks.

    Args:
        file_path: Path to planning document

    Returns:
        Dictionary with document metadata and tasks
    """
    with open(file_path) as f:
        content = f.read()

    # Extract YAML frontmatter
    frontmatter_match = re.search(r'^---\n(.*?)\n---', content, re.DOTALL)
    metadata = {}

    if frontmatter_match:
        frontmatter = frontmatter_match.group(1)
        for line in frontmatter.split('\n'):
            if ':' in line:
                key, value = line.split(':', 1)
                metadata[key.strip()] = value.strip()

    # Check if approved
    status = metadata.get('status', 'draft')
    if status != 'approved':
        raise ValueError(f"Planning document status is '{status}', must be 'approved'")

    # Extract implementation tasks section
    tasks_match = re.search(
        r'## Implementation Tasks\n\n(.*?)(?=\n##|\Z)',
        content,
        re.DOTALL,
    )

    tasks = []
    if tasks_match:
        tasks_content = tasks_match.group(1)
        # Parse numbered task list
        task_pattern = r'\d+\.\s+\*\*(.+?)\*\*:\s+(.+?)(?=\n\d+\.|\Z)'
        for match in re.finditer(task_pattern, tasks_content, re.DOTALL):
            title = match.group(1).strip()
            description = match.group(2).strip()

            # Extract subtasks
            subtasks = re.findall(r'- (.+)', description)

            tasks.append(
                {
                    'title': title,
                    'description': description,
                    'subtasks': subtasks,
                },
            )

    return {
        'metadata': metadata,
        'tasks': tasks,
        'file_path': file_path,
    }


def create_ticket_from_task(
    api: GitHubAPI,
    task: dict,
    plan_metadata: dict,
    plan_file_path: str,
    task_number: int,
    total_tasks: int,
) -> dict:
    """Create a GitHub issue from a task.

    Args:
        api: GitHubAPI instance
        task: Task dictionary
        plan_metadata: Planning document metadata
        plan_file_path: Path to planning document
        task_number: Current task number
        total_tasks: Total number of tasks

    Returns:
        Created issue data
    """
    # Build issue title
    feature_id = plan_metadata.get('id', 'FEAT-XXX')
    title = f'[Feature] {task["title"]}'

    # Build issue body
    subtasks_md = '\n'.join([f'- [ ] {st}' for st in task['subtasks']])

    body = f"""## Description
{task['description']}

## Acceptance Criteria
{subtasks_md}

## Planning Document
Defined in: `{plan_file_path}`
Feature ID: {feature_id}

## Task Progress
This is task {task_number} of {total_tasks} for this feature.

## Implementation Notes
- Follow TDD: Write tests first
- Ensure all tests pass before committing
- Update documentation if needed
- Check for reusable code

## Dependencies
Check planning document for dependencies on other tasks.
"""

    # Determine labels
    priority = plan_metadata.get('priority', 'medium')
    labels = ['feature', f'priority:{priority}']

    # Create issue
    issue = api.create_issue(
        title=title,
        body=body,
        labels=labels,
    )

    print(f'✓ Created issue #{issue["number"]}: {title}')

    # Add to project board (Backlog column)
    try:
        api.add_issue_to_project(issue['node_id'])
        api.move_issue_to_column(issue['number'], 'Backlog')
        print('  Added to Backlog column')
    except GitHubAPIError as e:
        print(f'  Warning: Could not add to project board: {e}')

    return issue


def main():
    """Main entry point."""
    if len(sys.argv) < 2:
        print('Usage: python create_tickets.py <path-to-planning-doc>')
        sys.exit(1)

    planning_doc_path = sys.argv[1]

    if not os.path.exists(planning_doc_path):
        print(f'Error: Planning document not found: {planning_doc_path}')
        sys.exit(1)

    print(f'\n📋 Creating tickets from: {planning_doc_path}\n')

    try:
        # Parse planning document
        plan_data = parse_planning_document(planning_doc_path)

        print(f'Feature: {plan_data["metadata"].get("title", "Unknown")}')
        print(f'Status: {plan_data["metadata"].get("status")}')
        print(f'Tasks to create: {len(plan_data["tasks"])}\n')

        # Initialize GitHub API
        api = GitHubAPI()

        # Ensure standard labels exist
        print('Ensuring standard labels exist...')
        api.ensure_labels_exist()
        print('✓ Labels ready\n')

        # Create tickets
        created_issues = []
        total_tasks = len(plan_data['tasks'])

        for idx, task in enumerate(plan_data['tasks'], 1):
            issue = create_ticket_from_task(
                api=api,
                task=task,
                plan_metadata=plan_data['metadata'],
                plan_file_path=planning_doc_path,
                task_number=idx,
                total_tasks=total_tasks,
            )
            created_issues.append(issue)

        # Add summary comment to planning document issue (if exists)
        print(f'\n✅ Successfully created {len(created_issues)} tickets')
        print('\nCreated issues:')
        for issue in created_issues:
            print(f'  - #{issue["number"]}: {issue["title"]}')
            print(f'    {issue["html_url"]}')

        print('\n📝 Next steps:')
        print('1. Review tickets in Backlog column')
        print('2. Move tickets to Ready column when ready to start work')
        print('3. Agent will pick up work from Ready column')

    except ValueError as e:
        print(f'Error: {e}')
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
