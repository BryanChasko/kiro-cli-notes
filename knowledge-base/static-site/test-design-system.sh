#!/bin/bash

# Test script for the design system implementation
echo "🎨 Testing Design System Implementation..."

# Check if all files exist
files=(
    "css/design-tokens.css"
    "css/styles.css"
    "js/tracer.js"
    "js/terminal-modal.js"
    "js/theme-toggle.js"
    "js/ascii-components.js"
    "index.html"
)

echo "📁 Checking files..."
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ $file missing"
    fi
done

# Start the server
echo ""
echo "🚀 Starting development server..."
echo "Press Ctrl+C to stop"
echo ""
echo "Features to test:"
echo "• Light/Dark theme toggle (top-right corner)"
echo "• Terminal modal (Ctrl+` or Cmd+`)"
echo "• ASCII components in the UI"
echo "• Enhanced OpenTelemetry console output"
echo ""

./start-server.sh
