# Kiro CLI Agent Profile Reorganization - Implementation Plan

## Current State Analysis
- **Existing Agents**: 3 agents with generic names
- **MCP Servers**: 5 configured (fetch, filesystem, knowledge-base, aws-docs, github)
- **Configuration**: `~/.kiro/config/mcp.json` and `~/.kiro/agents/*.json`

## Implementation Tasks

### Task 1: OpenTelemetry Agent Performance Monitoring
```bash
# Install OpenTelemetry dependencies
npm init -y
npm install @opentelemetry/api @opentelemetry/sdk-node @opentelemetry/auto-instrumentations-node
```

### Task 2: Jest Test Suite Setup
```bash
# Install Jest and testing dependencies
npm install --save-dev jest @types/jest
```

### Task 3: Agent Renaming with Migration
- `frontend-spacing` → `design-system`
- `kb-creator` → `kiro-cli-expert`
- `screenpal-video-transcriber` → `video-analyst`

### Task 4: New Specialized Agents (8+ agents)

#### Observability Family
1. **observability-otel** - OpenTelemetry tracing, metrics, logging
2. **observability-aws** - CloudWatch, X-Ray, AWS monitoring
3. **observability-performance** - Browser performance, Core Web Vitals

#### Content & Communication
4. **copywriting-editor** - Content creation, editing, style guides
5. **user-story-analyst** - Requirements gathering, user research
6. **technical-writer** - Documentation, API docs, tutorials

#### Engineering
7. **refactor-engineer** - Code refactoring, architecture improvements
8. **frontend-architect** - UI/UX architecture, component design
9. **backend-systems** - API design, database architecture

#### Media & Analysis
10. **data-analyst** - Data processing, visualization, insights
11. **security-auditor** - Security analysis, vulnerability assessment

### Task 5: MCP Distribution Strategy
- **Essential Baseline**: filesystem, fetch, github, knowledge-base for all agents
- **Specialized MCPs**: Domain-specific servers per agent family
- **Performance Monitoring**: OpenTelemetry integration for all MCP operations

## File Structure
```
~/.kiro/
├── agents/
│   ├── design-system.json
│   ├── kiro-cli-expert.json
│   ├── video-analyst.json
│   ├── observability-otel.json
│   ├── observability-aws.json
│   ├── observability-performance.json
│   ├── copywriting-editor.json
│   ├── user-story-analyst.json
│   ├── technical-writer.json
│   ├── refactor-engineer.json
│   ├── frontend-architect.json
│   ├── backend-systems.json
│   ├── data-analyst.json
│   └── security-auditor.json
├── config/
│   ├── mcp.json (enhanced)
│   └── otel-config.json (new)
└── knowledge-bases/
    ├── observability/
    ├── content/
    ├── engineering/
    └── analysis/
```

## Next Steps
1. Set up monitoring and testing infrastructure
2. Create migration scripts for existing agents
3. Generate new agent configurations
4. Implement knowledge base distribution
5. Add performance monitoring and automated testing
