#!/bin/sh

. .venv/bin/activate
python manage.py makemigrations
python manage.py migrate --noinput
python manage.py createsuperuser --noinput
python manage.py runserver 0.0.0.0:$DJANGO_APP_PORT
