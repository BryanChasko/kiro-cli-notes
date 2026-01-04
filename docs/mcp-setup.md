# MCP Server Setup Guide

<!--
Attribution:
Source: Kiro CLI Videos 04 & 07 - MCP Server Integration
Creators: AWS Kiro CLI Team
Repository Maintainer: Bryan Chasko (@bryanchasko)
Guidance: Professional MCP server configuration from official tutorials
-->

## Essential MCP Servers (Videos 04, 07)

### 1. AWS Integration (Video 04)
```bash
# AWS API Server - Direct AWS resource management
# AWS Knowledge Server - Documentation integration
```

### 2. Core Servers
- **fetch**: External API calls
- **filesystem**: File operations
- **aws-docs**: AWS documentation

### 3. Custom Servers (Video 07)
- **Neon**: Database integration
- **NPM**: Package management
- **Rust Crate**: Rust ecosystem

## Configuration

MCP servers are configured in `configs/mcp.json`. Key settings:
- `autoApprove`: Trusted operations
- `disabled`: Enable/disable servers
- `env`: Environment variables

## Testing
```bash
kiro-cli mcp list
kiro-cli mcp health
```

## Troubleshooting
- Check Docker is running for containerized servers
- Verify environment variables are set
- Test individual server connections
