#!/bin/bash
set -e

echo "Starting URL Shortener application..."

# Wait for database to be ready
echo "Waiting for database to be ready..."
until pg_isready -h "${DATABASE_HOST:-localhost}" -p "${DATABASE_PORT:-5432}" -U "${DATABASE_USER:-postgres}"; do
    echo "Database is unavailable - sleeping"
    sleep 2
done

echo "Database is ready!"

# Run database migrations
echo "Running database migrations..."
flask db upgrade

# Run the app
gunicorn --bind 0.0.0.0:5000 --workers 2 --timeout 120 run:app