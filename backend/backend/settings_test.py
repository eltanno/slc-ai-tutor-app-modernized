"""Test settings for pytest.

Uses SQLite instead of PostgreSQL to avoid external dependencies.
"""

from .settings import *  # noqa: F403


# Use SQLite for tests - no external database required
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': ':memory:',
    },
}

# Faster password hashing for tests
PASSWORD_HASHERS = [
    'django.contrib.auth.hashers.MD5PasswordHasher',
]

# Disable logging during tests
LOGGING = {}

# Speed up tests
DEBUG = False
