#!/bin/sh
set -e

# EasyPanel may inject PORT=80. Non-root users cannot bind to ports <1024.
if [ "$(id -u)" -ne 0 ]; then
  case "${PORT:-3000}" in
    80|443) export PORT=3000 ;;
  esac
fi

export HOSTNAME="${HOSTNAME:-0.0.0.0}"

# Persisted store (orders, CMS, tracking settings) — must be writable.
mkdir -p /app/data

exec "$@"
