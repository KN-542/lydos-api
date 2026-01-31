#!/bin/sh
set -e

echo "Running database migrations..."
bunx prisma migrate deploy --schema=./schema.prisma

echo "Running database seed..."
bun run seed.ts

echo "Starting application..."
exec bun run dist/index.js
