#!/bin/bash

# Kiro CLI Knowledge Base - Complete Setup Script

set -e

echo "🚀 Setting up Kiro CLI Knowledge Base Search System..."

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 16+ first."
    exit 1
fi

if ! command -v ollama &> /dev/null; then
    echo "❌ Ollama not found. Please install Ollama first."
    exit 1
fi

if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 not found. Please install Python 3 first."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Setup MCP server
echo "🔧 Setting up MCP server..."
cd "$PROJECT_ROOT/knowledge-base/mcp-server"
npm install
npm run build
echo "✅ MCP server ready"

# Install Ollama model
echo "🤖 Installing Ollama embedding model..."
ollama pull nomic-embed-text
echo "✅ Embedding model installed"

# Setup export pipeline
echo "📦 Setting up export pipeline..."
cd "$PROJECT_ROOT/knowledge-base/export-pipeline"
npm install
echo "✅ Export pipeline ready"

# Export knowledge base
echo "🔄 Exporting knowledge base..."
node export-knowledge.js
echo "✅ Knowledge base exported"

# Setup complete
echo ""
echo "🎉 Setup complete!"
echo ""
echo "To start the search interface:"
echo "  cd knowledge-base/static-site"
echo "  ./start-server.sh"
echo ""
echo "Then open: http://localhost:8000"
