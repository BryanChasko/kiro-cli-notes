# Kiro CLI Knowledge Base Search System

A comprehensive internal documentation search system for Kiro CLI developers, featuring semantic search, advanced filtering, and contextual discovery across all Kiro CLI setup patterns, tutorials, and best practices.

## 🚀 Features

- **Semantic Search**: AI-powered search using local Ollama embeddings
- **Advanced Filtering**: Filter by content type, tags, and source
- **Contextual Sections**: Quick access to Day 1 Essentials, MCP Setup, Workflows
- **Client-Side Storage**: Fast IndexedDB-based search with offline capability
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Updates**: Automatic knowledge base updates when content changes

## 📁 Repository Structure

```
├── knowledge-base/           # Knowledge base search system
│   ├── mcp-server/          # MCP server with Ollama embeddings
│   ├── export-pipeline/     # Content extraction and processing
│   ├── static-site/         # Web interface and search functionality
│   └── knowledge-bases/     # Organized content storage
├── video-content/           # Video transcripts and analysis
├── docs/                    # Setup documentation and guides
├── configs/                 # Configuration files
├── agents/                  # Custom agent profiles
├── hooks/                   # Automation hooks
├── steering/                # Development standards
├── workflows/               # SDLC workflows
├── tools/                   # Utility scripts
└── scripts/                 # Setup and maintenance scripts
```

## 🔧 Quick Start

### Option 1: Complete Knowledge Base Setup
```bash
# Full setup with search system
./scripts/setup-knowledge-base.sh
```

### Option 2: Basic Project Setup
```bash
# Basic Kiro CLI setup only
./scripts/setup.sh
```

### Option 3: Manual Setup
```bash
# 1. Set up knowledge base search
cd knowledge-base/mcp-server
npm install && npm run build
ollama pull nomic-embed-text

# 2. Export content
cd ../export-pipeline
npm install && node export-knowledge.js

# 3. Start search interface
cd ../static-site
./start-server.sh
```

## 📊 Knowledge Base Stats

- **48 Content Chunks** indexed with semantic embeddings
- **Content Types**: Setup (16), Video Tutorials (31), Workflows (1)
- **Top Tags**: MCP, Integration, Tutorials, Setup, AWS, Agents
- **Search Capabilities**: Keyword + semantic similarity matching

## 🎯 Use Cases

### Day 1 Developer Setup
- Quick access to essential Kiro CLI configuration
- Step-by-step setup guides with cost optimization
- MCP server integration patterns

### Advanced Development
- SDLC workflow automation
- Custom agent development
- Production deployment strategies

### Troubleshooting
- Common issues and solutions
- Best practices and standards
- Video tutorial references

## 🔍 Search Features

- **Contextual Search**: Pre-configured searches for common needs
- **Advanced Filters**: Content type, tags, source filtering
- **Relevance Scoring**: AI-powered result ranking
- **Incremental Updates**: Automatic content synchronization

## 📚 Content Sources

Based on analysis of 10 professional Kiro CLI tutorial videos:
- AWS re:Invent 2025 presentations
- Community tutorials and best practices
- Real-world implementation examples
- Production deployment patterns

## 🤝 Attribution

**Content Sources**: Professional Kiro CLI tutorial videos  
**Speakers**: Derek & Kieran (AWS), Girish (Cloud Evangelist), Jack Carrington (Blue Collar Coder)  
**Repository Maintainer**: Bryan Chasko (@bryanchasko)  
**License**: MIT License

## 🔗 Related Projects

- [Video Transcription Agent](https://github.com/BryanChasko/kiro-cli-custom-agent-screenpal-video-transcription) - Technical implementation for video processing

## 📄 License

MIT License - See LICENSE file for details.
