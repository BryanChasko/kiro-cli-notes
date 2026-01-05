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
