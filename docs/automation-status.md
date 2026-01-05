# Knowledge Base Automation Status

## Workflows

### 🔄 Update Knowledge Base
- **Trigger**: Content changes, daily schedule, manual
- **Purpose**: Automatically rebuild knowledge base when content changes
- **Monitoring**: Creates GitHub issues on failure

### 🏥 Health Check
- **Trigger**: Every 6 hours
- **Purpose**: Validate knowledge base integrity and static site health
- **Alerts**: Warns on low chunk count or missing files

## Observability

### Trace Events
- `🔍 [TRACE] Started: {operation}` - Operation begins
- `📊 [EVENT] {operation}: {event}` - Operation milestone
- `✅ [TRACE] {operation}: success` - Operation completes successfully
- `❌ [TRACE] {operation}: failed` - Operation fails

### Key Metrics
- **Chunk Count**: Target >40 chunks for healthy knowledge base
- **Export Frequency**: Daily automatic updates
- **Build Time**: Typical 2-3 minutes for full rebuild
- **Success Rate**: Monitor via GitHub Actions dashboard

## Manual Operations

### Force Update
```bash
# Trigger manual knowledge base update
gh workflow run update-knowledge-base.yml
```

### Health Check
```bash
# Run health validation
gh workflow run monitor-knowledge-base.yml
```

### Local Testing
```bash
# Test automation locally
cd knowledge-base/static-site
./build.sh
```
