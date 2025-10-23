#!/bin/bash

# Script to apply Next.js 15 dynamic route params fix to the accept route handler

FILE="src/app/api/tutor/plan/toc/[planId]/accept/route.ts"

# Check if file exists
if [ ! -f "$FILE" ]; then
  echo "Error: File not found: $FILE"
  exit 1
fi

# Backup the original file
cp "$FILE" "${FILE}.backup"

# Apply the type change: update params type to Promise
sed -i 's/{ params: { planId: string } }/{ params: Promise<{ planId: string }> }/' "$FILE"

# Apply the await change: update destructuring to await params
sed -i 's/const { planId } = params;/const { planId } = await params;/' "$FILE"

echo "Fix applied to $FILE. Original backed up as ${FILE}.backup"
echo "Run 'npm run build' to verify."