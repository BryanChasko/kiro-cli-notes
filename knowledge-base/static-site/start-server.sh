#!/bin/bash

echo "🚀 Starting Kiro CLI Knowledge Base local server..."

# Check if knowledge.json exists
if [ ! -f "knowledge.json" ]; then
    echo "❌ knowledge.json not found. Please run the export pipeline first."
    exit 1
fi

echo "✅ Knowledge base file found ($(wc -l < knowledge.json) lines)"

# Start the server
echo "🌐 Starting server on http://localhost:8080"
python3 -m http.server 8080

echo "🛑 Server stopped"
