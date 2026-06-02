#!/bin/sh
set -e

# EasyPanel and similar platforms often inject PORT=80. Non-root users cannot
# bind to privileged ports (<1024) on Linux, which causes a restart loop.
if [ "$(id -u)" -ne 0 ]; then
  case "${PORT:-3000}" in
    80|443) export PORT=3000 ;;
  esac
fi

export HOSTNAME="${HOSTNAME:-0.0.0.0}"

# Persisted store (orders, CMS, tracking settings) — must be writable.
mkdir -p /app/data

exec node server.js
