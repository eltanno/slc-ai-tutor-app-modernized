#!/usr/bin/env python3
"""
update_template_columns.py - Update template project with our standard columns

This script updates your template project to have the correct Kanban columns.
"""

import os
import sys
from pathlib import Path


# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from utils.github_api import GitHubAPI, GitHubAPIError


def main():
    """Update template project columns."""
    import argparse

    parser = argparse.ArgumentParser(description='Update template project columns')
    parser.add_argument('-y', '--yes', action='store_true', help='Skip confirmation')
    args = parser.parse_args()

    print('🔧 Updating Template Project Columns')
    print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    print()

    try:
        api = GitHubAPI(require_repo_config=False)
    except GitHubAPIError as e:
        print(f'❌ Error: {e}')
        return 1

    # Get template number from env
    template_number = os.getenv('GITHUB_TEMPLATE_PROJECT_NUMBER')
    if not template_number or not template_number.strip():
        print('❌ GITHUB_TEMPLATE_PROJECT_NUMBER not set in .env')
        print('   Run setup_project_template.py first')
        return 1

    template_number = int(template_number)

    print(f'📋 Template project: #{template_number}')
    print(f'👤 Owner: {api.owner}')
    print()

    # Get template project
    query = """
    query($owner: String!, $number: Int!) {
      user(login: $owner) {
        projectV2(number: $number) {
          id
          title
          url
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

    result = api._make_graphql_request(
        query,
        {'owner': api.owner, 'number': template_number},
    )

    project = result['user']['projectV2']
    print(f'✅ Found project: {project["title"]}')
    print(f'   URL: {project["url"]}')

    # Find Status field
    status_field = None
    for field in project['fields']['nodes']:
        if field and field.get('name') == 'Status':
            status_field = field
            break

    if not status_field:
        print('\n❌ Status field not found!')
        print('   Make sure the project has a Status field')
        return 1

    print('\n📊 Current columns:')
    for opt in status_field.get('options', []):
        print(f'   - {opt["name"]}')

    # Our standard columns
    new_columns = [
        'Backlog',
        'Ready',
        'In Progress',
        'In Review',
        'In Testing',
        'Test Failed',
        'Done',
    ]

    print('\n🔄 Updating to standard columns:')
    for col in new_columns:
        print(f'   - {col}')

    if not args.yes:
        response = input('\nProceed with update? (y/N): ').strip().lower()
        if response not in ['y', 'yes']:
            print('❌ Cancelled')
            return 0
    else:
        print('\n✅ Proceeding with update...')

    # Update Status field
    update_mutation = """
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

    options = [{'name': col, 'color': 'GRAY', 'description': ''} for col in new_columns]

    api._make_graphql_request(
        update_mutation,
        {
            'fieldId': status_field['id'],
            'options': options,
        },
    )

    print('\n✅ Template updated!')
    print(f'\n📋 View updated template: {project["url"]}')
    print('\n🎉 Template is now ready! Future projects will have all 7 columns.')

    return 0


if __name__ == '__main__':
    sys.exit(main())
