#!/bin/bash

# Copy Kiro CLI configurations to ~/.kiro

echo "📋 Updating Kiro CLI configurations..."

# Ensure ~/.kiro/config exists
mkdir -p ~/.kiro/config

# Copy MCP configuration
if [ -f "configs/mcp.json" ]; then
    cp configs/mcp.json ~/.kiro/config/
    echo "✅ MCP configuration updated"
fi

# Update permanent tool access for knowledge base
cat > ~/.kiro/config/permanent-tool-access.json << 'EOF'
{
  "toolsSettings": {
    "fs_write": {
      "allowedPaths": [
        "/tmp/**",
        "~/.kiro/logs/**", 
        "/Users/*/Code/**",
        "/Users/*/Downloads/kiro-videos/**"
      ]
    },
    "execute_bash": {
      "allowedCommands": ["*"]
    }
  },
  "mcpServers": {
    "fetch": {
      "enabled": true,
      "autoActivate": true
    },
    "knowledge-base": {
      "enabled": true,
      "autoActivate": true,
      "config": {
        "workingDirectory": "$(pwd)"
      }
    }
  }
}
EOF

echo "✅ Tool access configuration updated"
echo "🔍 Knowledge base MCP server configured for Kiro CLI access"
