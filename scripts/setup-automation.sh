#!/bin/bash

# Task 7: GitHub Actions Automation with OpenTelemetry tracing

set -e

TRACE_ID="automation_$(date +%s)"
echo "🔍 [TRACE] Started: github_actions_automation (trace_id: $TRACE_ID)"

# Error handler function
handle_error() {
    local exit_code=$?
    local line_number=$1
    echo "❌ [TRACE] github_actions_automation: FAILED"
    echo "Error context:"
    echo "  - Exit code: $exit_code"
    echo "  - Line: $line_number"
    echo "  - Trace ID: $TRACE_ID"
    echo "  - Operation: GitHub Actions automation setup"
    exit $exit_code
}

trap 'handle_error $LINENO' ERR

# Create automated knowledge base update workflow
echo "📦 [EVENT] github_actions_automation: creating_update_workflow"

cat > .github/workflows/update-knowledge-base.yml << 'EOF'
name: Update Knowledge Base

on:
  push:
    paths:
      - 'docs/**'
      - 'video-content/**'
      - 'steering/**'
      - 'workflows/**'
  schedule:
    - cron: '0 6 * * *'  # Daily at 6 AM UTC
  workflow_dispatch:

jobs:
  update-knowledge-base:
    runs-on: ubuntu-latest
    steps:
    - name: Checkout
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        
    - name: Setup Ollama
      run: |
        echo "🔍 [TRACE] Started: ollama_setup"
        curl -fsSL https://ollama.ai/install.sh | sh
        ollama serve &
        sleep 10
        echo "📊 [EVENT] ollama_setup: pulling_model"
        ollama pull nomic-embed-text
        echo "✅ [TRACE] ollama_setup: success"
        
    - name: Install Dependencies
      run: |
        echo "🔍 [TRACE] Started: dependency_installation"
        cd knowledge-base/mcp-server
        npm install
        npm run build
        echo "📊 [EVENT] dependency_installation: mcp_server_built"
        
        cd ../export-pipeline
        npm install
        echo "✅ [TRACE] dependency_installation: success"
        
    - name: Update Knowledge Base
      run: |
        echo "🔍 [TRACE] Started: knowledge_base_update"
        cd knowledge-base/export-pipeline
        
        # Export with error handling
        if node export-knowledge.js; then
          echo "✅ [EVENT] knowledge_base_update: export_success"
          
          # Validate export
          CHUNK_COUNT=$(jq '.metadata.totalChunks' ../static-site/knowledge.json)
          echo "📊 [EVENT] knowledge_base_update: validation_success (chunks: $CHUNK_COUNT)"
          
          if [ "$CHUNK_COUNT" -lt 10 ]; then
            echo "❌ [EVENT] knowledge_base_update: validation_failed (insufficient_chunks: $CHUNK_COUNT)"
            exit 1
          fi
        else
          echo "❌ [TRACE] knowledge_base_update: export_failed"
          exit 1
        fi
        
    - name: Commit Changes
      run: |
        echo "🔍 [TRACE] Started: commit_changes"
        git config --local user.email "action@github.com"
        git config --local user.name "GitHub Action"
        
        if git diff --quiet knowledge-base/static-site/knowledge.json; then
          echo "📊 [EVENT] commit_changes: no_changes_detected"
        else
          git add knowledge-base/static-site/knowledge.json
          git add knowledge-base/static-site/knowledge-summary.txt
          git commit -m "🤖 Auto-update knowledge base - $(date -u +%Y-%m-%d)"
          git push
          echo "✅ [EVENT] commit_changes: changes_committed"
        fi
        echo "✅ [TRACE] commit_changes: success"
        
    - name: Deploy to Pages
      uses: actions/deploy-pages@v4
      with:
        artifact_name: github-pages
        
  notify-on-failure:
    runs-on: ubuntu-latest
    needs: update-knowledge-base
    if: failure()
    steps:
    - name: Create Issue on Failure
      uses: actions/github-script@v7
      with:
        script: |
          console.log('❌ [TRACE] knowledge_base_automation: failed');
          github.rest.issues.create({
            owner: context.repo.owner,
            repo: context.repo.repo,
            title: '🚨 Knowledge Base Update Failed',
            body: `
            ## Automation Failure Report
            
            **Workflow**: Update Knowledge Base
            **Run ID**: ${{ github.run_id }}
            **Commit**: ${{ github.sha }}
            **Timestamp**: ${new Date().toISOString()}
            
            ### Trace Information
            - Trace ID: automation_${Date.now()}
            - Status: FAILED
            - Check the [workflow run](${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}) for details.
            
            ### Next Steps
            1. Check Ollama service status
            2. Verify MCP server build
            3. Validate knowledge base content
            4. Review export pipeline logs
            `,
            labels: ['automation', 'bug', 'knowledge-base']
          });
EOF

echo "✅ [EVENT] github_actions_automation: update_workflow_created"

# Create monitoring workflow
echo "📊 [EVENT] github_actions_automation: creating_monitoring_workflow"

cat > .github/workflows/monitor-knowledge-base.yml << 'EOF'
name: Monitor Knowledge Base Health

on:
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours
  workflow_dispatch:

jobs:
  health-check:
    runs-on: ubuntu-latest
    steps:
    - name: Checkout
      uses: actions/checkout@v4
      
    - name: Validate Knowledge Base
      run: |
        echo "🔍 [TRACE] Started: health_check"
        
        # Check if knowledge.json exists
        if [ ! -f "knowledge-base/static-site/knowledge.json" ]; then
          echo "❌ [EVENT] health_check: missing_knowledge_file"
          exit 1
        fi
        
        # Validate JSON structure
        if ! jq empty knowledge-base/static-site/knowledge.json; then
          echo "❌ [EVENT] health_check: invalid_json"
          exit 1
        fi
        
        # Check chunk count
        CHUNK_COUNT=$(jq '.metadata.totalChunks' knowledge-base/static-site/knowledge.json)
        echo "📊 [EVENT] health_check: chunk_count_validated (chunks: $CHUNK_COUNT)"
        
        if [ "$CHUNK_COUNT" -lt 40 ]; then
          echo "⚠️ [EVENT] health_check: low_chunk_count (chunks: $CHUNK_COUNT)"
        fi
        
        # Check last update time
        EXPORT_DATE=$(jq -r '.metadata.exportDate' knowledge-base/static-site/knowledge.json)
        echo "📊 [EVENT] health_check: last_export_date ($EXPORT_DATE)"
        
        echo "✅ [TRACE] health_check: success"
        
    - name: Test Static Site
      run: |
        echo "🔍 [TRACE] Started: static_site_test"
        cd knowledge-base/static-site
        
        # Check required files
        for file in index.html js/app.js js/search.js js/indexeddb.js css/styles.css; do
          if [ ! -f "$file" ]; then
            echo "❌ [EVENT] static_site_test: missing_file ($file)"
            exit 1
          fi
        done
        
        echo "✅ [TRACE] static_site_test: success"
EOF

echo "✅ [EVENT] github_actions_automation: monitoring_workflow_created"

# Create status dashboard
echo "📊 [EVENT] github_actions_automation: creating_status_dashboard"

cat > docs/automation-status.md << 'EOF'
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
EOF

echo "✅ [EVENT] github_actions_automation: status_dashboard_created"

# Test workflow syntax
echo "📊 [EVENT] github_actions_automation: validating_workflows"

if command -v yamllint >/dev/null 2>&1; then
    yamllint .github/workflows/*.yml && echo "✅ [EVENT] github_actions_automation: yaml_validation_success"
else
    echo "⚠️ [EVENT] github_actions_automation: yaml_validation_skipped (yamllint not available)"
fi

echo "✅ [TRACE] github_actions_automation: success (trace_id: $TRACE_ID)"
echo ""
echo "🤖 GitHub Actions automation configured!"
echo "📊 Observability features:"
echo "  - OpenTelemetry-style tracing in all workflows"
echo "  - Automated failure notifications via GitHub issues"
echo "  - Health monitoring every 6 hours"
echo "  - Status dashboard for operations team"
