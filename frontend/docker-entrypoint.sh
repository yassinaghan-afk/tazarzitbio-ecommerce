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

# Admin auth is read at runtime from process environment.
# Secrets must be EasyPanel *Environment* variables (runtime), NOT only build args.
if [ -n "${ADMIN_PASSWORD:-}" ] || [ -n "${ADMIN_PASSWORD_SHA256:-}" ]; then
  echo "[tazarzit] admin auth: configured (runtime env present)"
else
  echo "[tazarzit] admin auth: NOT configured — set ADMIN_PASSWORD (or ADMIN_PASSWORD_SHA256) in EasyPanel Environment and redeploy"
fi

echo "[tazarzit] starting Next.js on ${HOSTNAME}:${PORT}"

exec "$@"
