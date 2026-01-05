#!/bin/bash

# GitHub Pages Deployment Script with OpenTelemetry-style tracing

set -e

# Initialize tracing
TRACE_ID="deploy_$(date +%s)"
echo "🔍 [TRACE] Started: github_pages_deployment (trace_id: $TRACE_ID)"

# Task 6: GitHub Pages Deployment
echo "📦 [EVENT] github_pages_deployment: configuring_pages"

# Create GitHub Pages configuration
cat > .github/workflows/deploy.yml << 'EOF'
name: Deploy Knowledge Base to GitHub Pages

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
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
        curl -fsSL https://ollama.ai/install.sh | sh
        ollama serve &
        sleep 5
        ollama pull nomic-embed-text
        
    - name: Install MCP Server
      run: |
        cd knowledge-base/mcp-server
        npm install
        npm run build
        
    - name: Install Export Pipeline
      run: |
        cd knowledge-base/export-pipeline  
        npm install
        
    - name: Export Knowledge Base
      run: |
        cd knowledge-base/export-pipeline
        node export-knowledge.js
        
    - name: Setup Pages
      uses: actions/configure-pages@v4
      
    - name: Upload artifact
      uses: actions/upload-pages-artifact@v3
      with:
        path: './knowledge-base/static-site'

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
    - name: Deploy to GitHub Pages
      id: deployment
      uses: actions/deploy-pages@v4
EOF

echo "✅ [EVENT] github_pages_deployment: workflow_created"

# Create build script for local testing
cat > knowledge-base/static-site/build.sh << 'EOF'
#!/bin/bash

echo "🔍 [TRACE] Started: local_build"

# Build knowledge base
cd ../export-pipeline
echo "📊 [EVENT] local_build: exporting_knowledge"
node export-knowledge.js

cd ../static-site
echo "📊 [EVENT] local_build: validating_output"

# Validate knowledge.json exists and has content
if [ -f "knowledge.json" ]; then
    CHUNK_COUNT=$(jq '.metadata.totalChunks' knowledge.json)
    echo "✅ [EVENT] local_build: validation_success (chunks: $CHUNK_COUNT)"
else
    echo "❌ [EVENT] local_build: validation_failed (missing knowledge.json)"
    exit 1
fi

echo "✅ [TRACE] local_build: success"
EOF

chmod +x knowledge-base/static-site/build.sh

echo "✅ [EVENT] github_pages_deployment: build_script_created"

# Create deployment documentation
cat > docs/github-pages-deployment.md << 'EOF'
# GitHub Pages Deployment

## Overview
The knowledge base is automatically deployed to GitHub Pages on every push to main branch.

## Deployment Process
1. **Build Phase**: Sets up Ollama, installs dependencies, exports knowledge base
2. **Deploy Phase**: Uploads static site to GitHub Pages

## Local Testing
```bash
cd knowledge-base/static-site
./build.sh
./start-server.sh
```

## Live Site
- URL: `https://{username}.github.io/{repo-name}/`
- Updates automatically on push to main
- Build status visible in Actions tab

## Monitoring
- Check GitHub Actions for build logs
- Monitor deployment status in repository settings
- Validate knowledge base export in build artifacts
EOF

echo "✅ [EVENT] github_pages_deployment: documentation_created"

# Test local build
echo "📊 [EVENT] github_pages_deployment: testing_local_build"
cd knowledge-base/static-site
if ./build.sh; then
    echo "✅ [EVENT] github_pages_deployment: local_build_success"
else
    echo "❌ [EVENT] github_pages_deployment: local_build_failed"
    exit 1
fi

echo "✅ [TRACE] github_pages_deployment: success (trace_id: $TRACE_ID)"
echo ""
echo "🚀 GitHub Pages deployment configured!"
echo "📋 Next steps:"
echo "  1. Commit and push to trigger deployment"
echo "  2. Enable GitHub Pages in repository settings"
echo "  3. Monitor deployment in Actions tab"
