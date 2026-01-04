# Day 1 Setup Guide

<!--
Attribution:
Source: Kiro CLI Videos 01 & 05 - Foundation Setup and Cost Optimization
Creators: AWS Kiro CLI Team
Repository Maintainer: Bryan Chasko (@bryanchasko)
Guidance: Essential first-day setup from professional tutorials
-->

## Quick Start (5 minutes)

### 1. Basic Setup
```bash
# Create project directory (Video 01)
mkdir my-project && cd my-project

# Launch Kiro CLI
kiro-cli
```

### 2. Enable Auto Mode (Video 05)
- **Critical**: Use Auto Mode for cost optimization
- Default setting that saves credits vs Claude Sonnet
- Best for beginners unless specific use case requires different model

### 3. Authentication
- Login via GitHub
- Approve basic tool permissions when prompted

### 4. Test Setup
```bash
# Test with simple prompt
"create a hello world function"
```

## Essential First Settings

Based on Video 05 guidance:
- ✅ Auto Mode enabled (cost optimization)
- ✅ Knowledge indexing enabled
- ✅ Basic tool trust configured

## Next Steps
- Week 1: Add MCP servers (see [mcp-setup.md](mcp-setup.md))
- Production: Configure hooks and workflows
