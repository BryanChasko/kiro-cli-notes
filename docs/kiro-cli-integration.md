# Kiro CLI Configuration Guide

## MCP Server Integration

The knowledge base system is configured as an MCP server that Kiro CLI can access directly.

### Configuration Files

1. **`configs/mcp.json`** - MCP server definitions
2. **`~/.kiro/config/permanent-tool-access.json`** - Tool access permissions

### Knowledge Base MCP Server

```json
{
  "knowledge-base": {
    "command": "node",
    "args": ["knowledge-base/mcp-server/build/index.js"],
    "env": {
      "EMBEDDING_PROVIDER": "ollama",
      "OLLAMA_BASE_URL": "http://localhost:11434", 
      "OLLAMA_MODEL": "nomic-embed-text",
      "KNOWLEDGE_BASES_ROOT_DIR": "knowledge-base/knowledge-bases"
    },
    "autoApprove": ["list_knowledge_bases", "retrieve_knowledge"],
    "disabled": false
  }
}
```

### Available Tools

- `list_knowledge_bases` - List available knowledge bases
- `retrieve_knowledge` - Semantic search across content

### Setup Commands

```bash
# Update Kiro CLI configurations
./scripts/update-kiro-config.sh

# Verify MCP server access
kiro-cli chat
# Use /knowledge search "your query" in chat
```

### Usage in Kiro CLI

Once configured, you can use the knowledge base directly in Kiro CLI:

```
/knowledge search "MCP setup"
/knowledge search "Day 1 essentials" 
/knowledge search "troubleshooting"
```

The system provides semantic search across:
- Setup guides and configuration
- Video tutorial transcripts
- Best practices and standards
- Workflow automation patterns
