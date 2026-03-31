```
  +-[ kiro-cli-notes ]--------------------------------------+
  |  knowledge base search system for kiro cli developers  |
  |  semantic search . mcp . ollama . indexdb              |
  +---------------------------------------------------------+
```

internal documentation search system for kiro cli developers. semantic search
across all kiro cli setup patterns, tutorials, and best practices. runs local
via ollama -- no external api keys required.

---

## features

- semantic search via local ollama embeddings (nomic-embed-text)
- filtering by content type, tags, and source
- indexdb-based client-side storage -- offline capable
- real-time updates when content changes

---

## repository structure

```
knowledge-base/
  mcp-server/          -- mcp server with ollama embeddings
  export-pipeline/     -- content extraction and processing
  static-site/         -- web interface and search
  knowledge-bases/     -- organized content storage
video-content/         -- video transcripts and analysis
docs/                  -- setup documentation
configs/               -- configuration files
agents/                -- custom agent profiles
hooks/                 -- automation hooks
steering/              -- development standards
workflows/             -- sdlc workflows
tools/                 -- utility scripts
scripts/               -- setup and maintenance
```

---

## quick start

complete setup:
```bash
./scripts/setup-knowledge-base.sh
```

basic kiro cli only:
```bash
./scripts/setup.sh
```

manual setup:
```bash
cd knowledge-base/mcp-server
npm install && npm run build
ollama pull nomic-embed-text

cd ../export-pipeline
npm install && node export-knowledge.js

cd ../static-site
./start-server.sh
```

---

## knowledge base stats

- 48 content chunks indexed with semantic embeddings
- content types: setup (16), video tutorials (31), workflows (1)
- top tags: mcp, integration, tutorials, setup, aws, agents

---

## content sources

based on 10 professional kiro cli tutorial videos:
- aws re:invent 2025 presentations
- community tutorials and best practices
- production deployment patterns

speakers: derek and kieran (aws), girish (cloud evangelist), jack carrington (blue collar coder)

---

## related

[video transcription agent](https://github.com/BryanChasko/kiro-cli-custom-agent-screenpal-video-transcription) -- technical implementation for video processing

style guide: https://github.com/BryanChasko/heraldstack-mcp/blob/main/STYLE_GUIDE.md
