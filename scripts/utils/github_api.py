"""
GitHub API Wrapper for Project Management

Provides simplified interface to GitHub API for:
- Creating issues
- Updating issues
- Managing project board (Kanban)
- Adding comments
- Linking PRs

Uses environment variables for configuration.
"""

import os
from typing import Any

import requests
from dotenv import load_dotenv


# Load environment variables
load_dotenv()


class GitHubAPIError(Exception):
    """Raised when GitHub API request fails."""


class GitHubAPI:
    """Wrapper for GitHub REST API and GraphQL API."""

    def __init__(self, require_repo_config: bool = True):
        """Initialize GitHub API client with credentials from environment.

        Args:
            require_repo_config: If True, require GITHUB_OWNER, GITHUB_REPO, and
                GITHUB_PROJECT_NUMBER in environment. If False, only GITHUB_API_KEY
                is required (useful for creating new repos).
        """
        self.token = os.getenv('GITHUB_API_KEY')
        self.owner = os.getenv('GITHUB_OWNER')
        self.repo = os.getenv('GITHUB_REPO')
        project_num = os.getenv('GITHUB_PROJECT_NUMBER')

        # Always require token
        if not self.token:
            raise GitHubAPIError('GITHUB_API_KEY not found in environment')

        # Conditionally require repo configuration
        if require_repo_config:
            if not self.owner:
                raise GitHubAPIError('GITHUB_OWNER not found in environment')
            if not self.repo:
                raise GitHubAPIError('GITHUB_REPO not found in environment')
            if not project_num:
                raise GitHubAPIError('GITHUB_PROJECT_NUMBER not found in environment')
            self.project_number = int(project_num)
        else:
            # For repo creation, these will be set later
            self.project_number = None

        self.base_url = 'https://api.github.com'
        self.graphql_url = 'https://api.github.com/graphql'

        self.headers = {
            'Authorization': f'Bearer {self.token}',
            'Accept': 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28',
        }

    def _make_request(
        self,
        method: str,
        endpoint: str,
        data: dict | None = None,
    ) -> dict[str, Any]:
        """Make REST API request to GitHub.

        Args:
            method: HTTP method (GET, POST, PATCH, DELETE)
            endpoint: API endpoint (e.g., '/repos/owner/repo/issues')
            data: Request body data

        Returns:
            Response JSON data

        Raises:
            GitHubAPIError: If request fails
        """
        url = f'{self.base_url}{endpoint}'

        try:
            response = requests.request(
                method=method,
                url=url,
                headers=self.headers,
                json=data,
            )
            response.raise_for_status()
            return response.json() if response.content else {}
        except requests.exceptions.HTTPError as e:
            raise GitHubAPIError(
                f'GitHub API request failed: {e}, Response: {response.text}',
            )
        except Exception as e:
            raise GitHubAPIError(f'Request error: {e}')

    def _make_graphql_request(
        self,
        query: str,
        variables: dict | None = None,
    ) -> dict[str, Any]:
        """Make GraphQL API request to GitHub.

        Args:
            query: GraphQL query string
            variables: Query variables

        Returns:
            Response data

        Raises:
            GitHubAPIError: If request fails
        """
        try:
            response = requests.post(
                self.graphql_url,
                headers=self.headers,
                json={'query': query, 'variables': variables or {}},
            )
            response.raise_for_status()
            result = response.json()

            if 'errors' in result:
                raise GitHubAPIError(f'GraphQL errors: {result["errors"]}')

            return result['data']
        except requests.exceptions.HTTPError as e:
            raise GitHubAPIError(f'GitHub GraphQL request failed: {e}')
        except Exception as e:
            raise GitHubAPIError(f'GraphQL request error: {e}')

    # ==================== Issue Management ====================

    def create_issue(
        self,
        title: str,
        body: str,
        labels: list[str] | None = None,
        assignees: list[str] | None = None,
        add_to_project: bool = False,
        column_name: str = 'Backlog',
    ) -> dict[str, Any]:
        """Create a new GitHub issue.

        Args:
            title: Issue title
            body: Issue description (supports Markdown)
            labels: List of label names
            assignees: List of GitHub usernames
            add_to_project: If True, automatically add issue to project board
            column_name: Column to add issue to (default: 'Backlog')

        Returns:
            Created issue data including issue number
        """
        endpoint = f'/repos/{self.owner}/{self.repo}/issues'
        data = {
            'title': title,
            'body': body,
            'labels': labels or [],
            'assignees': assignees or [],
        }

        issue = self._make_request('POST', endpoint, data)

        # Automatically add to project board if requested
        if add_to_project:
            try:
                self.add_issue_to_project(issue['node_id'])
                self.move_issue_to_column(issue['number'], column_name)
            except Exception as e:
                # Log warning but don't fail issue creation
                print(
                    f'⚠ Warning: Created issue #{issue["number"]} but failed to add to project: {e}',
                )

        return issue

    def update_issue(
        self,
        issue_number: int,
        title: str | None = None,
        body: str | None = None,
        state: str | None = None,
        labels: list[str] | None = None,
    ) -> dict[str, Any]:
        """Update an existing GitHub issue.

        Args:
            issue_number: Issue number to update
            title: New title (optional)
            body: New body (optional)
            state: New state: 'open' or 'closed' (optional)
            labels: New labels list (optional)

        Returns:
            Updated issue data
        """
        endpoint = f'/repos/{self.owner}/{self.repo}/issues/{issue_number}'
        data = {}

        if title:
            data['title'] = title
        if body:
            data['body'] = body
        if state:
            data['state'] = state
        if labels is not None:
            data['labels'] = labels

        return self._make_request('PATCH', endpoint, data)

    def close_issue(self, issue_number: int) -> dict[str, Any]:
        """Close an issue.

        Args:
            issue_number: Issue number to close

        Returns:
            Updated issue data
        """
        return self.update_issue(issue_number, state='closed')

    def add_comment(self, issue_number: int, comment: str) -> dict[str, Any]:
        """Add comment to an issue.

        Args:
            issue_number: Issue number
            comment: Comment text (supports Markdown)

        Returns:
            Created comment data
        """
        endpoint = f'/repos/{self.owner}/{self.repo}/issues/{issue_number}/comments'
        data = {'body': comment}

        return self._make_request('POST', endpoint, data)

    def get_issue(self, issue_number: int) -> dict[str, Any]:
        """Get issue details.

        Args:
            issue_number: Issue number

        Returns:
            Issue data
        """
        endpoint = f'/repos/{self.owner}/{self.repo}/issues/{issue_number}'
        return self._make_request('GET', endpoint)

    def list_issues(
        self,
        state: str = 'open',
        labels: list[str] | None = None,
    ) -> list[dict[str, Any]]:
        """List repository issues.

        Args:
            state: Issue state filter ('open', 'closed', 'all')
            labels: Filter by labels

        Returns:
            List of issues
        """
        endpoint = f'/repos/{self.owner}/{self.repo}/issues'
        params = f'?state={state}'

        if labels:
            params += f'&labels={",".join(labels)}'

        return self._make_request('GET', endpoint + params)

    # ==================== Project Management ====================

    def get_project_id(self) -> str:
        """Get project ID from project number.

        Returns:
            Project GraphQL node ID
        """
        query = """
        query($owner: String!, $number: Int!) {
            user(login: $owner) {
                projectV2(number: $number) {
                    id
                }
            }
        }
        """

        variables = {
            'owner': self.owner,
            'number': self.project_number,
        }

        result = self._make_graphql_request(query, variables)
        return result['user']['projectV2']['id']

    def get_project_fields(self) -> dict[str, Any]:
        """Get project field definitions (columns, etc).

        Returns:
            Project fields data including Status field options
        """
        query = """
        query($owner: String!, $number: Int!) {
            user(login: $owner) {
                projectV2(number: $number) {
                    id
                    fields(first: 20) {
                        nodes {
                            ... on ProjectV2Field {
                                id
                                name
                            }
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

        variables = {
            'owner': self.owner,
            'number': self.project_number,
        }

        return self._make_graphql_request(query, variables)

    def add_issue_to_project(self, issue_id: str) -> dict[str, Any]:
        """Add issue to project board.

        Args:
            issue_id: Issue GraphQL node ID

        Returns:
            Project item data
        """
        project_id = self.get_project_id()

        query = """
        mutation($projectId: ID!, $contentId: ID!) {
            addProjectV2ItemById(input: {
                projectId: $projectId
                contentId: $contentId
            }) {
                item {
                    id
                }
            }
        }
        """

        variables = {
            'projectId': project_id,
            'contentId': issue_id,
        }

        return self._make_graphql_request(query, variables)

    def move_issue_to_column(
        self,
        issue_number: int,
        column_name: str,
    ) -> dict[str, Any]:
        """Move issue to specific column in project board.

        Args:
            issue_number: Issue number
            column_name: Target column name (e.g., 'In Progress', 'Done')

        Returns:
            Updated project item data
        """
        # This is a complex operation requiring multiple GraphQL calls
        # Implementation simplified - would need full project field IDs

        # Get issue node ID
        issue = self.get_issue(issue_number)
        issue_node_id = issue['node_id']

        # Get project fields to find Status field and option IDs
        fields_data = self.get_project_fields()

        # Find Status field and target option
        status_field = None
        target_option_id = None

        for field in fields_data['user']['projectV2']['fields']['nodes']:
            if field.get('name') == 'Status':
                status_field = field
                for option in field.get('options', []):
                    if option['name'] == column_name:
                        target_option_id = option['id']
                        break
                break

        if not status_field or not target_option_id:
            raise GitHubAPIError(f"Column '{column_name}' not found in project")

        # Get project item ID for this issue
        project_id = self.get_project_id()
        query = """
        query($projectId: ID!) {
            node(id: $projectId) {
                ... on ProjectV2 {
                    items(first: 100) {
                        nodes {
                            id
                            content {
                                ... on Issue {
                                    id
                                }
                            }
                        }
                    }
                }
            }
        }
        """

        result = self._make_graphql_request(
            query,
            {
                'projectId': project_id,
            },
        )

        project_item_id = None
        for item in result['node']['items']['nodes']:
            if item['content']['id'] == issue_node_id:
                project_item_id = item['id']
                break

        if not project_item_id:
            # Issue not in project, add it first
            add_result = self.add_issue_to_project(issue_node_id)
            project_item_id = add_result['addProjectV2ItemById']['item']['id']

        if not project_item_id:
            raise GitHubAPIError(
                f'Could not find or create project item for issue #{issue_number}',
            )

        # Update the item's status field
        update_query = """
        mutation($projectId: ID!, $itemId: ID!, $fieldId: ID!, $optionId: String!) {
            updateProjectV2ItemFieldValue(input: {
                projectId: $projectId
                itemId: $itemId
                fieldId: $fieldId
                value: {singleSelectOptionId: $optionId}
            }) {
                projectV2Item {
                    id
                }
            }
        }
        """

        return self._make_graphql_request(
            update_query,
            {
                'projectId': project_id,
                'itemId': project_item_id,
                'fieldId': status_field['id'],
                'optionId': target_option_id,
            },
        )

    # ==================== Labels ====================

    def create_label(
        self,
        name: str,
        color: str,
        description: str | None = None,
    ) -> dict[str, Any]:
        """Create a new label in the repository.

        Args:
            name: Label name
            color: Hex color code (without #)
            description: Optional description

        Returns:
            Created label data
        """
        endpoint = f'/repos/{self.owner}/{self.repo}/labels'
        data = {
            'name': name,
            'color': color,
            'description': description or '',
        }

        return self._make_request('POST', endpoint, data)

    def ensure_labels_exist(self) -> None:
        """Ensure standard labels exist in repository."""
        standard_labels = [
            {'name': 'feature', 'color': '0e8a16', 'description': 'New feature'},
            {'name': 'bugfix', 'color': 'd73a4a', 'description': 'Bug fix'},
            {'name': 'testing', 'color': 'f9d0c4', 'description': 'Testing work'},
            {
                'name': 'documentation',
                'color': '0075ca',
                'description': 'Documentation',
            },
            {'name': 'refactor', 'color': 'fbca04', 'description': 'Code refactoring'},
            {
                'name': 'blocked',
                'color': 'b60205',
                'description': 'Blocked by dependencies',
            },
            {
                'name': 'priority:high',
                'color': 'd93f0b',
                'description': 'High priority',
            },
            {
                'name': 'priority:medium',
                'color': 'fbca04',
                'description': 'Medium priority',
            },
            {'name': 'priority:low', 'color': '0e8a16', 'description': 'Low priority'},
        ]

        for label_data in standard_labels:
            try:
                self.create_label(**label_data)
            except GitHubAPIError:
                # Label might already exist, that's fine
                pass
