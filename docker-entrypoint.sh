#!/bin/sh
set -e

# Construct DATABASE_URL from individual components
export DATABASE_URL="postgresql://${DATABASE_USER}:${DATABASE_PASSWORD}@${DATABASE_HOST}:${DATABASE_PORT}/${DATABASE_NAME}"

echo "Running database migrations..."
bunx prisma migrate deploy --schema=./schema.prisma

echo "Running database seed..."
bun run seed.ts

echo "Starting application..."
exec bun run dist/index.js
