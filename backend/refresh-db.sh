#!/bin/bash

# Exit on error
set -e

echo "🔄 Refreshing database and seeding..."

# Use npx prisma migrate reset to drop/recreate DB and run seed
npx prisma migrate reset --force

echo "✅ Database refresh complete!"
