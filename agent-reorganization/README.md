# Agent Reorganization Project

Complete Kiro CLI agent profile reorganization with OpenTelemetry monitoring and Jest testing.

## Structure
- `scripts/` - Migration and validation scripts
- `docs/` - Implementation documentation  
- `configs/` - MCP configuration templates
- `tests/` - Jest test suite
- `otel/` - OpenTelemetry configuration
- `setup-agent-reorganization.sh` - Main setup script

## Usage
```bash
cd agent-reorganization
./setup-agent-reorganization.sh
```

## Results
- 11 specialized Kiro CLI agents deployed to `~/.kiro/agents/`
- Enhanced MCP configuration in `~/.kiro/config/`
- Full validation and monitoring setup
