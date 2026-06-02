#!/bin/sh
set -e

# EasyPanel often injects PORT=80 for the public proxy, but this container runs as
# a non-root user and cannot bind to ports <1024. EasyPanel's reverse proxy must
# forward to container port 3000 (set in EasyPanel → Domains → destination port).
#
# Force a stable internal listen port to prevent 502 Bad Gateway / restart loops.
export PORT=3000
export HOSTNAME=0.0.0.0

mkdir -p /app/data

echo "[tazarzit] starting Next.js on ${HOSTNAME}:${PORT}"

exec "$@"
