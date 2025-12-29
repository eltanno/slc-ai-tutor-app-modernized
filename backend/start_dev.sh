#!/bin/bash

set -a && source .env && set +a

#. .venv/bin/activate

pg_isready -d $DB_NAME -h $DB_HOST -p $DB_PORT -U $DB_USER
code=$?

if [ $code -ne 0 ]; then
    echo "PostgreSQL is not ready. Exiting..."
    echo "run docker-compose up -d db"
    exit 1
else
    echo "PostgreSQL is ready. Starting..."
    python manage.py makemigrations
    python manage.py migrate
    python manage.py runserver $DJANGO_APP_PORT
fi
