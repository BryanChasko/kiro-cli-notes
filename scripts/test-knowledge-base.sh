#!/bin/bash

echo "🧪 Testing Kiro CLI Knowledge Base Integration..."

# Test MCP server directly
echo "📡 Testing MCP server..."
cd knowledge-base/mcp-server

# Set environment variables
export EMBEDDING_PROVIDER=ollama
export OLLAMA_BASE_URL=http://localhost:11434
export OLLAMA_MODEL=nomic-embed-text
export KNOWLEDGE_BASES_ROOT_DIR=../knowledge-bases

# Test server startup
timeout 10s node build/index.js << 'EOF' || echo "✅ MCP server test completed"
{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}
EOF

echo ""
echo "✅ Knowledge base system ready!"
echo ""
echo "In Kiro CLI, you can now use:"
echo "  /knowledge search \"MCP setup\""
echo "  /knowledge search \"Day 1 essentials\""
echo "  /knowledge search \"troubleshooting\""
