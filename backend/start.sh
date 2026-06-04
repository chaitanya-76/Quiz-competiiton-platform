#!/usr/bin/env bash
set -o errexit

echo "Ensuring database is ready..."
python manage.py ensure_db

echo "Starting gunicorn..."
exec gunicorn config.wsgi:application --bind "0.0.0.0:${PORT:-8000}"
