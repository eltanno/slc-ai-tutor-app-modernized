#!/usr/bin/env python3
"""
create_repo_and_project.py - Create GitHub repository and project

Creates a new GitHub repository and project board with proper Kanban columns.

Usage:
    python scripts/github/create_repo_and_project.py <repo_name> [options]

Options:
    --description  Repository description
    --private      Create private repository (default: public)
    --no-init      Don't initialize local git

Example:
    python scripts/github/create_repo_and_project.py my-new-project \
        --description "My awesome project" \
        --private
"""

import argparse
import os
import subprocess
import sys
from pathlib import Path


# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from utils.github_api import GitHubAPI, GitHubAPIError


def _copy_project_from_template(
    api: GitHubAPI,
    owner_id: str,
    template_number: int,
    title: str,
) -> dict:
    """Copy project from template.

    Args:
        api: GitHubAPI instance
        owner_id: Owner node ID
        template_number: Template project number
        title: New project title

    Returns:
        Copied project data
    """
    # Get template project ID
    template_query = """
    query($owner: String!, $number: Int!) {
      user(login: $owner) {
        projectV2(number: $number) {
          id
        }
      }
    }
    """

    template_result = api._make_graphql_request(
        template_query,
        {'owner': api.owner, 'number': template_number},
    )
    template_id = template_result['user']['projectV2']['id']

    # Copy template
    copy_mutation = """
    mutation($projectId: ID!, $ownerId: ID!, $title: String!, $includeDraftIssues: Boolean!) {
      copyProjectV2(input: {
        projectId: $projectId
        ownerId: $ownerId
        title: $title
        includeDraftIssues: $includeDraftIssues
      }) {
        projectV2 {
          id
          number
          title
          url
        }
      }
    }
    """

    result = api._make_graphql_request(
        copy_mutation,
        {
            'projectId': template_id,
            'ownerId': owner_id,
            'title': title,
            'includeDraftIssues': False,
        },
    )

    return result['copyProjectV2']['projectV2']


def _create_project_from_scratch(
    api: GitHubAPI,
    owner_id: str,
    title: str,
) -> dict:
    """Create project from scratch (legacy method).

    Args:
        api: GitHubAPI instance
        owner_id: Owner node ID
        title: Project title

    Returns:
        Created project data
    """
    # Create project using GraphQL (Projects V2)
    query = """
    mutation($ownerId: ID!, $title: String!) {
      createProjectV2(input: {ownerId: $ownerId, title: $title}) {
        projectV2 {
          id
          number
          title
          url
        }
      }
    }
    """

    result = api._make_graphql_request(
        query,
        {'ownerId': owner_id, 'title': title},
    )
    project = result['createProjectV2']['projectV2']

    return project


def create_repository(
    api: GitHubAPI,
    name: str,
    description: str = '',
    private: bool = False,
) -> dict:
    """Create a GitHub repository.

    Args:
        api: GitHubAPI instance
        name: Repository name
        description: Repository description
        private: Create private repository

    Returns:
        Created repository data
    """
    print(f'\n📦 Creating GitHub repository: {name}')

    endpoint = '/user/repos'
    data = {
        'name': name,
        'description': description,
        'private': private,
        'auto_init': False,  # Don't auto-initialize
        'has_issues': True,
        'has_projects': True,
        'has_wiki': False,
    }

    repo = api._make_request('POST', endpoint, data)

    print(f'   ✅ Repository created: {repo["html_url"]}')
    return repo


def create_project(api: GitHubAPI, repo_name: str) -> dict:
    """Create a GitHub Project with Kanban columns.

    If GITHUB_TEMPLATE_PROJECT_NUMBER is set in .env, copies that template.
    Otherwise, creates a new project from scratch.

    Args:
        api: GitHubAPI instance
        repo_name: Repository name

    Returns:
        Created project data with project number
    """
    print(f'\n📋 Creating GitHub Project: {repo_name} Kanban')

    # Get owner ID (needed for both methods)
    owner_query = """
    query($login: String!) {
      user(login: $login) {
        id
      }
    }
    """

    owner_result = api._make_graphql_request(
        owner_query,
        {'login': api.owner},
    )
    owner_id = owner_result['user']['id']

    # Check if template project is configured
    template_number = os.getenv('GITHUB_TEMPLATE_PROJECT_NUMBER')

    if template_number and template_number.strip():
        # Copy from template
        print(f'   📋 Copying from template project #{template_number}')
        project = _copy_project_from_template(
            api,
            owner_id,
            int(template_number),
            f'{repo_name} Kanban',
        )
        print(f'   ✅ Project copied from template: {project["url"]}')
        print(f'   📋 Project number: {project["number"]}')
        print('   🎉 Board view included!')
        return {
            'id': project['id'],
            'number': project['number'],
            'title': project['title'],
            'url': project['url'],
        }
    # Create from scratch (legacy method)
    print('   📝 Creating project from scratch (no template configured)')
    project = _create_project_from_scratch(api, owner_id, f'{repo_name} Kanban')
    print(f'   ✅ Project created: {project["url"]}')
    print(f'   📋 Project number: {project["number"]}')

    # Add columns
    columns = [
        'Backlog',
        'Ready',
        'In Progress',
        'In Review',
        'In Testing',
        'Test Failed',
        'Done',
    ]

    print('\n   Adding columns...')

    # Get the project's SingleSelect field for Status
    get_fields_query = """
        query($projectId: ID!) {
          node(id: $projectId) {
            ... on ProjectV2 {
              fields(first: 20) {
                nodes {
                  ... on ProjectV2SingleSelectField {
                    id
                    name
                    options {
                      id
                      name
                    }
                  }
                }
              }
            }
          }
        }
        """

    fields_result = api._make_graphql_request(
        get_fields_query,
        {'projectId': project['id']},
    )

    # Find the Status field
    status_field = None
    for field in fields_result['node']['fields']['nodes']:
        if field and field.get('name') == 'Status':
            status_field = field
            break

    if not status_field:
        print('   ⚠️  Could not find Status field, columns not added')
        print('   💡 You can add columns manually in the GitHub UI')
    else:
        # Update Status field options (columns)
        update_field_query = """
            mutation($fieldId: ID!, $options: [ProjectV2SingleSelectFieldOptionInput!]!) {
              updateProjectV2Field(input: {
                fieldId: $fieldId
                singleSelectOptions: $options
              }) {
                projectV2Field {
                  ... on ProjectV2SingleSelectField {
                    id
                    options {
                      id
                      name
                    }
                  }
                }
              }
            }
            """

        options = [{'name': col, 'color': 'GRAY', 'description': ''} for col in columns]

        api._make_graphql_request(
            update_field_query,
            {
                'fieldId': status_field['id'],
                'options': options,
            },
        )

        print(f'   ✅ Added {len(columns)} columns: {", ".join(columns)}')

    print('\n   ⚠️  Note: Board view not created (only Table view)')
    print('   💡 To add Board view:')
    print(f'      1. Go to: {project["url"]}')
    print('      2. Click "+" next to "View 1"')
    print('      3. Select "New view" → "Board"')
    print('      4. Name it "Kanban Board"')

    return {
        'id': project['id'],
        'number': project['number'],
        'title': project['title'],
        'url': project['url'],
    }


def initialize_git(
    repo_name: str,
    repo_url: str,
    remote_url: str,
) -> None:
    """Initialize git repository and push to GitHub.

    Args:
        repo_name: Repository name
        repo_url: Repository HTML URL
        remote_url: Git remote URL
    """
    print('\n🔧 Initializing git repository...')

    # Check if already a git repo
    result = subprocess.run(
        ['git', 'rev-parse', '--git-dir'],
        capture_output=True,
        text=True,
    )

    if result.returncode == 0:
        print('   ✅ Git repository already initialized')

        # Check if remote exists
        result = subprocess.run(
            ['git', 'remote', 'get-url', 'origin'],
            capture_output=True,
            text=True,
        )

        if result.returncode == 0:
            current_remote = result.stdout.strip()
            print(f'   ⚠️  Remote "origin" already exists: {current_remote}')
            response = input('   Replace with new remote? (y/N): ').strip().lower()
            if response in ['y', 'yes']:
                subprocess.run(['git', 'remote', 'remove', 'origin'], check=True)
                subprocess.run(
                    ['git', 'remote', 'add', 'origin', remote_url],
                    check=True,
                )
                print(f'   ✅ Remote updated to: {remote_url}')
            else:
                print('   ⏭️  Keeping existing remote')
                return
        else:
            subprocess.run(['git', 'remote', 'add', 'origin', remote_url], check=True)
            print(f'   ✅ Added remote: {remote_url}')

        # Check if we're on main
        result = subprocess.run(
            ['git', 'rev-parse', '--abbrev-ref', 'HEAD'],
            capture_output=True,
            text=True,
            check=True,
        )
        current_branch = result.stdout.strip()

        if current_branch != 'main':
            print(f'   📝 Current branch: {current_branch}')
            response = input('   Rename to main and push? (y/N): ').strip().lower()
            if response in ['y', 'yes']:
                subprocess.run(['git', 'branch', '-M', 'main'], check=True)
                print('   ✅ Renamed branch to main')
            else:
                print('   ⏭️  Keeping current branch')
                return

        # Push to GitHub
        print('\n   Pushing to GitHub...')
        result = subprocess.run(
            ['git', 'push', '-u', 'origin', 'main'],
            capture_output=True,
            text=True,
        )

        if result.returncode == 0:
            print('   ✅ Pushed to GitHub')
        else:
            print('   ⚠️  Push failed (this is normal for empty repos)')
            print('   💡 Make your first commit and push with: git push -u origin main')

    else:
        print('   Initializing new repository...')
        subprocess.run(['git', 'init'], check=True)
        subprocess.run(['git', 'branch', '-M', 'main'], check=True)
        subprocess.run(['git', 'remote', 'add', 'origin', remote_url], check=True)
        print('   ✅ Git initialized')
        print(f'   ✅ Remote added: {remote_url}')
        print('\n   💡 Next steps:')
        print('      git add .')
        print('      git commit -m "Initial commit"')
        print('      git push -u origin main')


def update_env_file(
    repo_name: str,
    project_number: int,
    owner: str,
) -> None:
    """Update .env file with new repository details.

    Args:
        repo_name: Repository name
        project_number: Project number
        owner: GitHub username/org
    """
    env_file = Path('.env')

    print('\n📝 Updating .env file...')

    if not env_file.exists():
        print('   ⚠️  .env file not found')
        print('   💡 Create .env from .env.example and add:')
        print(f'      GITHUB_OWNER={owner}')
        print(f'      GITHUB_REPO={repo_name}')
        print(f'      GITHUB_PROJECT_NUMBER={project_number}')
        return

    # Read current .env
    with open(env_file) as f:
        lines = f.readlines()

    # Update or add values
    updated = {
        'GITHUB_OWNER': False,
        'GITHUB_REPO': False,
        'GITHUB_PROJECT_NUMBER': False,
    }

    new_lines = []
    for line in lines:
        if line.startswith('GITHUB_OWNER='):
            new_lines.append(f'GITHUB_OWNER={owner}\n')
            updated['GITHUB_OWNER'] = True
        elif line.startswith('GITHUB_REPO='):
            new_lines.append(f'GITHUB_REPO={repo_name}\n')
            updated['GITHUB_REPO'] = True
        elif line.startswith('GITHUB_PROJECT_NUMBER='):
            new_lines.append(f'GITHUB_PROJECT_NUMBER={project_number}\n')
            updated['GITHUB_PROJECT_NUMBER'] = True
        else:
            new_lines.append(line)

    # Add any missing values
    if not updated['GITHUB_OWNER']:
        new_lines.append(f'\nGITHUB_OWNER={owner}\n')
    if not updated['GITHUB_REPO']:
        new_lines.append(f'GITHUB_REPO={repo_name}\n')
    if not updated['GITHUB_PROJECT_NUMBER']:
        new_lines.append(f'GITHUB_PROJECT_NUMBER={project_number}\n')

    # Write back
    with open(env_file, 'w') as f:
        f.writelines(new_lines)

    print('   ✅ .env file updated')
    print(f'      GITHUB_OWNER={owner}')
    print(f'      GITHUB_REPO={repo_name}')
    print(f'      GITHUB_PROJECT_NUMBER={project_number}')


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description='Create GitHub repository and project',
    )
    parser.add_argument(
        'repo_name',
        help='Repository name',
    )
    parser.add_argument(
        '--description',
        default='',
        help='Repository description',
    )
    parser.add_argument(
        '--private',
        action='store_true',
        help='Create private repository',
    )
    parser.add_argument(
        '--no-init',
        action='store_true',
        help="Don't initialize local git",
    )

    args = parser.parse_args()

    print('🚀 GitHub Repository and Project Setup')
    print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    try:
        # Initialize API (without requiring repo config, since we're creating it)
        api = GitHubAPI(require_repo_config=False)

        # Get owner from environment or GitHub API
        if not api.owner:
            # Fetch authenticated user info to get owner
            user_response = api._make_request('GET', '/user')
            api.owner = user_response['login']

        # Create repository
        repo = create_repository(
            api,
            args.repo_name,
            args.description,
            args.private,
        )

        # Create project
        project = create_project(api, args.repo_name)

        # Initialize git (unless --no-init)
        if not args.no_init:
            initialize_git(
                args.repo_name,
                repo['html_url'],
                repo['clone_url'],
            )

        # Update .env file
        update_env_file(args.repo_name, project['number'], api.owner)

        # Summary
        print('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        print('🎉 Setup complete!')
        print()
        print(f'📦 Repository: {repo["html_url"]}')
        print(f'📋 Project:    {project["url"]}')
        print()
        print('📝 Next steps:')
        if args.no_init:
            print('   1. Initialize git: git init')
            print(f'   2. Add remote: git remote add origin {repo["clone_url"]}')
            print('   3. Make your first commit')
            print('   4. Push: git push -u origin main')
        else:
            print(
                '   1. Make your first commit: git add . && git commit -m "Initial commit"',
            )
            print('   2. Push to GitHub: git push -u origin main')
        print('   3. Start creating tickets and move to Ready column')
        print('   4. Follow the planning-first workflow!')
        print()

        return 0

    except GitHubAPIError as e:
        print(f'\n❌ GitHub API Error: {e}')
        return 1
    except Exception as e:
        print(f'\n❌ Error: {e}')
        import traceback

        traceback.print_exc()
        return 1


if __name__ == '__main__':
    sys.exit(main())
