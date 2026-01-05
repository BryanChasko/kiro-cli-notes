# Project Structure

## Root Directory Organization

```
kiro-videos/
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

## Knowledge Base Components

### MCP Server (`knowledge-base/mcp-server/`)
- **Purpose**: Semantic indexing and search API
- **Technology**: Node.js, Ollama, FAISS
- **Key Files**:
  - `build/index.js` - Main server executable
  - `package.json` - Dependencies and scripts

### Export Pipeline (`knowledge-base/export-pipeline/`)
- **Purpose**: Extract and structure content for client-side search
- **Technology**: Node.js
- **Key Files**:
  - `export-knowledge.js` - Main export script
  - `package.json` - Dependencies

### Static Site (`knowledge-base/static-site/`)
- **Purpose**: Web interface for search and browsing
- **Technology**: Vanilla HTML/CSS/JS, IndexedDB
- **Key Files**:
  - `index.html` - Main interface
  - `js/app.js` - Application logic
  - `js/search.js` - Search functionality
  - `js/indexeddb.js` - Client-side storage
  - `knowledge.json` - Exported knowledge base data

### Knowledge Bases (`knowledge-base/knowledge-bases/`)
- **Purpose**: Organized content storage for indexing
- **Structure**:
  - `kiro-cli/setup/` - Configuration guides
  - `kiro-cli/videos/` - Video transcripts
  - `kiro-cli/steering/` - Standards documents
  - `kiro-cli/workflows/` - Automation patterns

## Content Organization

### Video Content (`video-content/`)
- Raw video files and transcripts
- Organized by video ID and processing stage
- Includes accessibility-formatted transcripts

### Documentation (`docs/`)
- Setup guides and tutorials
- API documentation
- Best practices and standards

### Configuration (`configs/`, `agents/`, `hooks/`, `workflows/`)
- Kiro CLI configuration files
- Custom agent definitions
- Automation hooks and workflows
- SDLC integration patterns

## Scripts and Tools

### Scripts (`scripts/`)
- `setup-knowledge-base.sh` - Complete system setup
- `setup.sh` - Original project setup
- `add-attribution-headers.sh` - Content attribution

### Tools (`tools/`)
- Utility scripts for development
- Testing and debugging tools
- Content processing helpers
