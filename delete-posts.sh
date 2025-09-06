#!/bin/bash

API_VERSION="v2025-04-14"

echo "🔍 Fetching all post document IDs..."

sanity documents query '*[_type == "post"]._id' \
  --api-version=$API_VERSION \
  --output=ndjson | \
  grep -o '"[^"]\+"' | \
  tr -d '"' | \
  while read -r clean_id; do
    if [[ "$clean_id" =~ ^[a-zA-Z0-9._-]+$ ]]; then
      echo "🗑 Deleting: $clean_id"
      sanity documents delete "$clean_id"
    else
      echo "⚠️ Skipping invalid ID: $clean_id"
    fi
done

echo "✅ Done cleaning up post documents."
