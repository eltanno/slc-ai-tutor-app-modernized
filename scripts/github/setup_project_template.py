#!/usr/bin/env python3
"""
setup_project_template.py - One-time setup to create a GitHub Project template

This script helps you create a template project that can be copied for all future repos.
It will guide you through the process and update your .env file.
"""

import os
import sys
from pathlib import Path


# Add parent directory to path to import github_api
sys.path.insert(0, str(Path(__file__).parent.parent))

from utils.github_api import GitHubAPI, GitHubAPIError


def main():
    """Guide user through template setup."""
    print('🎯 GitHub Project Template Setup')
    print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    print()
    print('This script will help you set up a project template that includes')
    print('a pre-configured Kanban board view.')
    print()
    print('📋 Steps:')
    print("  1. You'll create a template project manually (GitHub UI)")
    print('  2. This script will find it and add it to your .env')
    print('  3. Future projects will copy this template automatically!')
    print()

    try:
        api = GitHubAPI(require_repo_config=False)
    except GitHubAPIError as e:
        print(f'❌ Error: {e}')
        print('\n💡 Make sure GITHUB_API_KEY is set in .env')
        return 1

    print(f'✅ Authenticated as: {api.owner}')
    print()

    # Check if template already configured
    current_template = os.getenv('GITHUB_TEMPLATE_PROJECT_NUMBER')
    if current_template and current_template.strip():
        print(f'⚠️  Template project already configured: #{current_template}')
        response = input('Do you want to change it? (y/N): ').strip().lower()
        if response not in ['y', 'yes']:
            print('\n✅ Keeping existing template')
            return 0

    print('📝 Step 1: Create Template Project')
    print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    print()
    print('Open this URL in your browser:')
    print(f'  https://github.com/{api.owner}?tab=projects')
    print()
    print('Then:')
    print('  1. Click "New project"')
    print('  2. Select the "Kanban" template (has Board view icon)')
    print('  3. Name it: cursor-scaffold-kanban-template')
    print('  4. Click "Create"')
    print()

    input("Press Enter when you've created the project...")

    print('\n📋 Step 2: Finding Your Project')
    print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    # List user's projects
    query = """
    query($login: String!) {
      user(login: $login) {
        projectsV2(first: 20, orderBy: {field: CREATED_AT, direction: DESC}) {
          nodes {
            number
            title
            url
          }
        }
      }
    }
    """

    result = api._make_graphql_request(query, {'login': api.owner})
    projects = result['user']['projectsV2']['nodes']

    if not projects:
        print('❌ No projects found!')
        print('   Make sure you created the project')
        return 1

    print(f'\nFound {len(projects)} project(s):')
    for project in projects:
        print(f'  #{project["number"]}: {project["title"]}')
        print(f'    {project["url"]}')

    # Try to find template by name
    template_project = None
    for project in projects:
        if (
            'template' in project['title'].lower()
            or 'kanban' in project['title'].lower()
        ):
            template_project = project
            break

    if template_project:
        print(
            f'\n✅ Found likely template: #{template_project["number"]} - {template_project["title"]}'
        )
        response = input('Use this as your template? (Y/n): ').strip().lower()
        if response not in ['n', 'no']:
            project_number = template_project['number']
        else:
            project_number = None
    else:
        project_number = None

    if not project_number:
        print('\nWhich project should be the template?')
        while True:
            try:
                project_number = int(input('Enter project number: ').strip())
                if any(p['number'] == project_number for p in projects):
                    break
                print('❌ Project not found, try again')
            except ValueError:
                print('❌ Please enter a valid number')

    print(f'\n✅ Using project #{project_number} as template')

    # Update .env
    print('\n📝 Step 3: Updating .env')
    print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    env_path = Path('.env')
    if not env_path.exists():
        print('❌ .env file not found!')
        print('   Create it from .env.example first')
        return 1

    env_content = env_path.read_text()

    # Update or add template number
    if 'GITHUB_TEMPLATE_PROJECT_NUMBER=' in env_content:
        import re

        env_content = re.sub(
            r'GITHUB_TEMPLATE_PROJECT_NUMBER=.*',
            f'GITHUB_TEMPLATE_PROJECT_NUMBER={project_number}',
            env_content,
        )
    else:
        # Add before the auto-populated section
        if '# AUTO-POPULATED' in env_content:
            env_content = env_content.replace(
                '# AUTO-POPULATED',
                f'GITHUB_TEMPLATE_PROJECT_NUMBER={project_number}\n\n# AUTO-POPULATED',
            )
        else:
            env_content += f'\nGITHUB_TEMPLATE_PROJECT_NUMBER={project_number}\n'

    env_path.write_text(env_content)
    print(f'✅ Updated .env with GITHUB_TEMPLATE_PROJECT_NUMBER={project_number}')

    print('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    print('🎉 Setup complete!')
    print()
    print('✅ Template project configured')
    print('✅ .env file updated')
    print()
    print('🚀 Next time you create a repository with create_repo_and_project.py,')
    print('   it will automatically copy this template (including Board view!)')
    print()

    return 0


if __name__ == '__main__':
    sys.exit(main())
