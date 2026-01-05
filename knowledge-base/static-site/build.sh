#!/bin/bash

echo "🔍 [TRACE] Started: local_build"

# Build knowledge base
cd ../export-pipeline
echo "📊 [EVENT] local_build: exporting_knowledge"
node export-knowledge.js

cd ../static-site
echo "📊 [EVENT] local_build: validating_output"

# Validate knowledge.json exists and has content
if [ -f "knowledge.json" ]; then
    CHUNK_COUNT=$(jq '.metadata.totalChunks' knowledge.json)
    echo "✅ [EVENT] local_build: validation_success (chunks: $CHUNK_COUNT)"
else
    echo "❌ [EVENT] local_build: validation_failed (missing knowledge.json)"
    exit 1
fi

echo "✅ [TRACE] local_build: success"
