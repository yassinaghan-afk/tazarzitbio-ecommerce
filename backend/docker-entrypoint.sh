#!/bin/sh
set -e

if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
  echo "Running Alembic migrations..."
  alembic upgrade head || echo "Alembic upgrade skipped or failed (no revisions yet)."
fi

exec "$@"
