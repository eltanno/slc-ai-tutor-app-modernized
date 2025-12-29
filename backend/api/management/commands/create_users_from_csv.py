"""
Django management command to create users from a CSV file.
Usage: python manage.py create_users_from_csv <csv_file_path>

CSV format should be:
email,password
user1@example.com,password123
user2@example.com,password456
"""

import csv

import requests
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError


User = get_user_model()


class Command(BaseCommand):
    help = 'Create users in Django and Open WebUI from a CSV file'

    def add_arguments(self, parser):
        parser.add_argument(
            'csv_file', type=str, help='Path to CSV file with email,password'
        )
        parser.add_argument(
            '--skip-openwebui',
            action='store_true',
            help='Skip creating users in Open WebUI',
        )
        parser.add_argument(
            '--openwebui-url',
            type=str,
            default='http://localhost:8080',
            help='Open WebUI URL (default: http://localhost:8080)',
        )
        parser.add_argument(
            '--admin-email',
            type=str,
            default='jim@eltanno.com',
            help='Open WebUI admin email (default: jim@eltanno.com)',
        )
        parser.add_argument(
            '--admin-password',
            type=str,
            default='1t5a5ecret',
            help='Open WebUI admin password',
        )

    def get_openwebui_token(self, openwebui_url, admin_email, admin_password):
        """Authenticate with Open WebUI and get admin token"""
        try:
            response = requests.post(
                f'{openwebui_url}/api/v1/auths/signin',
                json={
                    'email': admin_email,
                    'password': admin_password,
                },
                timeout=10,
            )

            if response.status_code == 200:
                token = response.json().get('token')
                if token:
                    self.stdout.write(
                        self.style.SUCCESS(
                            f'✓ Authenticated with Open WebUI as {admin_email}'
                        )
                    )
                    return token
                self.stdout.write(
                    self.style.ERROR('✗ No token returned from Open WebUI')
                )
                return None
            self.stdout.write(
                self.style.ERROR(
                    f'✗ Failed to authenticate with Open WebUI: {response.status_code} - {response.text}'
                )
            )
            return None

        except requests.exceptions.RequestException as e:
            self.stdout.write(
                self.style.ERROR(f'✗ Failed to connect to Open WebUI: {e!s}')
            )
            return None

    def handle(self, *args, **options):
        csv_file = options['csv_file']
        skip_openwebui = options['skip_openwebui']
        openwebui_url = options['openwebui_url']
        admin_email = options['admin_email']
        admin_password = options['admin_password']

        # Get Open WebUI admin token
        openwebui_token = None
        if not skip_openwebui:
            openwebui_token = self.get_openwebui_token(
                openwebui_url, admin_email, admin_password
            )
            if not openwebui_token:
                raise CommandError(
                    'Failed to authenticate with Open WebUI. Use --skip-openwebui to skip Open WebUI user creation.'
                )

        try:
            with open(csv_file) as file:
                reader = csv.DictReader(file)

                # Validate CSV headers
                if (
                    'email' not in reader.fieldnames
                    or 'password' not in reader.fieldnames
                ):
                    raise CommandError('CSV must have "email" and "password" columns')

                created_count = 0
                skipped_count = 0
                error_count = 0

                for row in reader:
                    email = row['email'].strip()
                    password = row['password'].strip()

                    if not email or not password:
                        self.stdout.write(self.style.WARNING('Skipping empty row'))
                        skipped_count += 1
                        continue

                    # Create Django user
                    try:
                        user, created = User.objects.get_or_create(
                            email=email,
                            defaults={'username': email},
                        )

                        if created:
                            user.set_password(password)
                            user.save()
                            self.stdout.write(
                                self.style.SUCCESS(f'✓ Created Django user: {email}')
                            )
                            created_count += 1
                        else:
                            self.stdout.write(
                                self.style.WARNING(
                                    f'⊘ Django user already exists: {email}'
                                )
                            )
                            skipped_count += 1

                    except Exception as e:
                        self.stdout.write(
                            self.style.ERROR(
                                f'✗ Failed to create Django user {email}: {e!s}'
                            )
                        )
                        error_count += 1
                        continue

                    # Create Open WebUI user
                    if not skip_openwebui and openwebui_token:
                        try:
                            response = requests.post(
                                f'{openwebui_url}/api/v1/auths/add',
                                headers={
                                    'Authorization': f'Bearer {openwebui_token}',
                                    'Content-Type': 'application/json',
                                },
                                json={
                                    'name': email,
                                    'email': email,
                                    'password': password,
                                    'role': 'user',
                                },
                                timeout=10,
                            )

                            if response.status_code in [200, 201]:
                                self.stdout.write(
                                    self.style.SUCCESS(
                                        f'  ✓ Created Open WebUI user: {email}'
                                    )
                                )
                            elif response.status_code == 400 and (
                                'already exists' in response.text.lower()
                                or 'duplicate' in response.text.lower()
                            ):
                                self.stdout.write(
                                    self.style.WARNING(
                                        f'  ⊘ Open WebUI user already exists: {email}'
                                    )
                                )
                            else:
                                self.stdout.write(
                                    self.style.ERROR(
                                        f'  ✗ Failed to create Open WebUI user {email}: {response.status_code} - {response.text}'
                                    )
                                )
                                error_count += 1

                        except requests.exceptions.RequestException as e:
                            self.stdout.write(
                                self.style.ERROR(
                                    f'  ✗ Failed to connect to Open WebUI for {email}: {e!s}'
                                )
                            )
                            error_count += 1

                # Summary
                self.stdout.write(self.style.SUCCESS('\n=== Summary ==='))
                self.stdout.write(f'Created: {created_count}')
                self.stdout.write(f'Skipped: {skipped_count}')
                self.stdout.write(f'Errors: {error_count}')

        except FileNotFoundError:
            raise CommandError(f'CSV file not found: {csv_file}')
        except Exception as e:
            raise CommandError(f'Error processing CSV: {e!s}')
