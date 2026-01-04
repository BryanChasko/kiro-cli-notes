#!/bin/bash
# Professional Kiro CLI Setup Script
# 
# Attribution:
# Based on guidance from 10 Kiro CLI tutorial videos
# Original Creators: AWS Kiro CLI Team, Cloud With Girish (Girish - AWS Community Builder)
# Repository Maintainer: Bryan Chasko (@bryanchasko)
# License: MIT

echo "🚀 Setting up Professional Kiro CLI Environment..."

# Create ~/.kiro directory structure
mkdir -p ~/.kiro/{settings,agents,hooks,steering,workflows}

# Copy configuration files
echo "📁 Installing configurations..."
cp configs/cli.json ~/.kiro/settings/
cp configs/mcp.json ~/.kiro/settings/
cp agents/*.json ~/.kiro/agents/
cp hooks/*.json ~/.kiro/hooks/
cp steering/*.md ~/.kiro/steering/
cp workflows/*.json ~/.kiro/workflows/

# Set permissions
chmod +x ~/.kiro/hooks/*.sh 2>/dev/null || true

echo "✅ Setup complete!"
echo "🎯 Run 'kiro-cli agent professional-dev' to start"
echo "📚 Check docs/ for detailed guides"
