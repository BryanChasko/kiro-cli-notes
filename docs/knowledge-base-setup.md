# Knowledge Base Setup Guide

## Overview

The Kiro CLI Knowledge Base Search System provides semantic search across all documentation, tutorials, and best practices. This guide covers setup and usage.

## Architecture

### Components

1. **MCP Server** (`knowledge-base/mcp-server/`)
   - Handles semantic indexing with Ollama embeddings
   - Provides search API via Model Context Protocol
   - Uses FAISS for vector similarity search

2. **Export Pipeline** (`knowledge-base/export-pipeline/`)
   - Extracts content from MCP server
   - Generates structured JSON for client-side search
   - Handles deduplication and content classification

3. **Static Site** (`knowledge-base/static-site/`)
   - Web interface for search and browsing
   - IndexedDB for offline search capability
   - Responsive design with advanced filtering

## Quick Setup

### Prerequisites
- Node.js 16+
- Ollama installed locally
- Python 3 (for local server)

### Installation

```bash
# 1. Set up MCP server
cd knowledge-base/mcp-server
npm install && npm run build

# 2. Install Ollama model
ollama pull nomic-embed-text

# 3. Set up export pipeline
cd ../export-pipeline
npm install

# 4. Export knowledge base
node export-knowledge.js

# 5. Start web interface
cd ../static-site
./start-server.sh
```

## Usage

### Search Interface
- Access at `http://localhost:8000`
- Use keyword search or contextual buttons
- Filter by content type and tags
- Results show relevance scores

### Content Types
- **Setup**: Configuration and getting started guides
- **Video-derived**: Tutorial transcripts and examples
- **Steering**: Standards and best practices
- **Workflows**: Automation and SDLC patterns
- **MCP**: Server integration guides

### Updating Content
1. Add new markdown files to `knowledge-base/knowledge-bases/kiro-cli/`
2. Run export pipeline: `node export-knowledge.js`
3. Refresh web interface to see updates

## Troubleshooting

### Common Issues
- **Ollama not found**: Ensure Ollama is installed and running
- **No search results**: Check if knowledge.json exists in static-site/
- **Server won't start**: Verify port 8000 is available

### Debug Mode
```bash
# Check MCP server logs
cd knowledge-base/mcp-server
LOG_LEVEL=debug node build/index.js

# Test export pipeline
cd ../export-pipeline
node export-knowledge.js
```
