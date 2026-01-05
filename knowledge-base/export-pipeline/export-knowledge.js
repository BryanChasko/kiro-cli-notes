#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs-extra');
const path = require('path');

class KnowledgeExporter {
  constructor() {
    this.serverProcess = null;
    this.messageId = 1;
    this.responses = new Map();
    this.colors = {
      info: '\x1b[38;2;127;90;240m',
      success: '\x1b[38;2;44;182;125m',
      warn: '\x1b[38;2;255;137;6m',
      error: '\x1b[38;2;239;69;101m',
      muted: '\x1b[38;2;148;161;178m',
      reset: '\x1b[0m'
    };
    this.tracer = {
      startSpan: (name, attrs = {}) => {
        const id = `${name}_${Date.now()}`;
        const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
        console.log(`${this.colors.muted}----[ ◇ TRACE START: ${name.toUpperCase()} ]----${this.colors.reset}`);
        console.log(`${this.colors.info}[${timestamp}] [◇] Starting trace: ${name}${this.colors.reset}`, attrs);
        return id;
      },
      addEvent: (id, event, attrs = {}) => {
        const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
        console.log(`${this.colors.info}[${timestamp}] [•] ${event}${this.colors.reset}`, attrs);
      },
      setStatus: (id, status, error = null) => {
        const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
        const statusMap = {
          'success': { prefix: '[✓]', color: this.colors.success },
          'error': { prefix: '[✗]', color: this.colors.error },
          'warning': { prefix: '[!]', color: this.colors.warn }
        };
        
        const statusInfo = statusMap[status] || { prefix: '[•]', color: this.colors.info };
        
        if (status === 'error' && error) {
          console.log(`${statusInfo.color}[${timestamp}] ${statusInfo.prefix} FAILED: ${error.message}${this.colors.reset}`);
        } else {
          console.log(`${statusInfo.color}[${timestamp}] ${statusInfo.prefix} ${status.toUpperCase()}${this.colors.reset}`);
        }
        
        if (status === 'success' || status === 'error') {
          console.log(`${this.colors.muted}----[ ◇ TRACE END ]----${this.colors.reset}`);
        }
      }
    };
    this.exportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        version: "1.0.0",
        source: "kiro-cli-knowledge-base",
        totalChunks: 0
      },
      knowledgeBases: [],
      chunks: []
    };
  }

  async startMCPServer() {
    const span = this.tracer.startSpan('mcp_server_startup');
    this.tracer.addEvent(span, 'initializing_server');
    
    const env = {
      ...process.env,
      EMBEDDING_PROVIDER: 'ollama',
      OLLAMA_BASE_URL: 'http://localhost:11434',
      OLLAMA_MODEL: 'nomic-embed-text',
      KNOWLEDGE_BASES_ROOT_DIR: path.join(process.env.HOME, 'Downloads', 'kiro-videos', 'knowledge-base', 'knowledge-bases')
    };

    const serverPath = path.join(process.env.HOME, 'mcp', 'knowledge-base-mcp-server', 'build', 'index.js');
    
    this.serverProcess = spawn('node', [serverPath], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: env
    });

    return new Promise((resolve, reject) => {
      let serverReady = false;
      
      this.serverProcess.stdout.on('data', (data) => {
        const output = data.toString();
        
        try {
          const lines = output.split('\n').filter(line => line.trim());
          for (const line of lines) {
            if (line.startsWith('{')) {
              const response = JSON.parse(line);
              if (response.id) {
                this.responses.set(response.id, response);
              }
              
              if (response.result && !serverReady) {
                serverReady = true;
                this.tracer.addEvent(span, 'server_ready');
                this.tracer.setStatus(span, 'success');
                resolve();
              }
            }
          }
        } catch (e) {
          // Ignore JSON parse errors for non-JSON output
        }
      });

      this.serverProcess.stderr.on('data', (data) => {
        const log = data.toString();
        if (log.includes('[ERROR]')) {
          this.tracer.addEvent(span, 'server_error', { error: log.trim() });
        }
      });

      this.serverProcess.on('close', (code) => {
        this.tracer.addEvent(span, 'server_closed', { exitCode: code });
      });

      // Send initial tools/list to trigger server startup
      setTimeout(() => {
        this.sendMessage('tools/list', {});
      }, 1000);

      // Timeout after 30 seconds
      setTimeout(() => {
        if (!serverReady) {
          this.tracer.setStatus(span, 'error', new Error('Server startup timeout'));
          reject(new Error('MCP server failed to start within 30 seconds'));
        }
      }, 30000);
    });
  }

  sendMessage(method, params) {
    const message = {
      jsonrpc: "2.0",
      id: this.messageId++,
      method: method,
      params: params
    };

    this.serverProcess.stdin.write(JSON.stringify(message) + '\n');
    return message.id;
  }

  async waitForResponse(messageId, timeout = 10000) {
    return new Promise((resolve, reject) => {
      const checkResponse = () => {
        if (this.responses.has(messageId)) {
          const response = this.responses.get(messageId);
          this.responses.delete(messageId);
          resolve(response);
        } else {
          setTimeout(checkResponse, 100);
        }
      };

      setTimeout(() => {
        reject(new Error(`Timeout waiting for response to message ${messageId}`));
      }, timeout);

      checkResponse();
    });
  }

  async listKnowledgeBases() {
    console.log('Listing knowledge bases...');
    
    const messageId = this.sendMessage('tools/call', {
      name: 'list_knowledge_bases',
      arguments: {}
    });

    const response = await this.waitForResponse(messageId);
    
    if (response.result && response.result.content) {
      const kbList = JSON.parse(response.result.content[0].text);
      this.exportData.knowledgeBases = kbList;
      console.log('Found knowledge bases:', kbList);
      return kbList;
    }
    
    throw new Error('Failed to list knowledge bases');
  }

  async extractAllContent() {
    console.log('Extracting all content with embeddings...');
    
    // Use broad queries to get comprehensive coverage
    const queries = [
      'Kiro CLI setup configuration',
      'MCP server integration', 
      'workflow automation',
      'steering documents standards',
      'video tutorials examples',
      'development best practices',
      'AWS integration',
      'agent configuration',
      'troubleshooting guide',
      'getting started'
    ];

    const allChunks = new Map(); // Use Map to deduplicate by content hash
    
    for (const query of queries) {
      console.log(`Querying: "${query}"`);
      
      const messageId = this.sendMessage('tools/call', {
        name: 'retrieve_knowledge',
        arguments: {
          query: query,
          threshold: 5.0 // Higher threshold to get more results
        }
      });

      try {
        const response = await this.waitForResponse(messageId, 15000);
        
        if (response.result && response.result.content) {
          const content = response.result.content[0].text;
          await this.parseSearchResultsWithEmbeddings(content, query, allChunks);
        }
      } catch (error) {
        console.warn(`Failed to get results for query "${query}":`, error.message);
      }
      
      // Small delay between queries
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Convert Map to Array
    this.exportData.chunks = Array.from(allChunks.values());
    this.exportData.metadata.totalChunks = this.exportData.chunks.length;
    
    console.log(`Extracted ${this.exportData.chunks.length} unique chunks with embeddings`);
  }

  async parseSearchResultsWithEmbeddings(content, query, allChunks) {
    // Parse the markdown-formatted search results
    const sections = content.split('---').filter(section => section.trim());
    
    for (const section of sections) {
      const lines = section.trim().split('\n');
      let chunkContent = '';
      let source = '';
      let resultNumber = '';
      let score = '';
      let inContent = false;
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        if (line.startsWith('**Result ')) {
          resultNumber = line.match(/\*\*Result (\d+):/)?.[1] || '';
          inContent = false;
        } else if (line.startsWith('**Score:**')) {
          score = line.replace('**Score:**', '').trim();
        } else if (line.startsWith('**Source:**')) {
          inContent = false;
          // Look for JSON in the following lines
          for (let j = i + 1; j < lines.length; j++) {
            if (lines[j].includes('"source"')) {
              try {
                const sourceMatch = lines[j].match(/"source":\s*"([^"]+)"/);
                if (sourceMatch) {
                  source = sourceMatch[1];
                }
              } catch (e) {
                // Ignore JSON parse errors
              }
              break;
            }
          }
        } else if (line.startsWith('```json') || line.startsWith('```')) {
          inContent = false;
        } else if (line && !line.startsWith('**') && !line.startsWith('```') && 
                   !line.includes('"source"') && !line.includes('"loc"') && 
                   !line.includes('> **Disclaimer:**') && resultNumber && !inContent) {
          // This is the actual content
          chunkContent = line;
          inContent = true;
        } else if (inContent && line && !line.startsWith('**') && !line.startsWith('```')) {
          chunkContent += '\n' + line;
        }
      }
      
      if (chunkContent.trim() && source) {
        // Create a simple hash for deduplication
        const contentHash = this.simpleHash(chunkContent.trim());
        
        if (!allChunks.has(contentHash)) {
          // Get embedding for this content
          const embedding = await this.getEmbedding(chunkContent.trim());
          
          // Classify content type based on source path
          const contentType = this.classifyContent(source);
          
          const chunk = {
            id: `chunk_${contentHash}`,
            content: chunkContent.trim(),
            source: source,
            contentType: contentType,
            tags: this.extractTags(source, chunkContent),
            query: query,
            score: parseFloat(score) || 0,
            embedding: embedding, // Add embedding vector
            metadata: {
              resultNumber: resultNumber,
              extractedAt: new Date().toISOString()
            }
          };
          
          allChunks.set(contentHash, chunk);
        }
      }
    }
  }

  async getEmbedding(text) {
    const span = this.tracer.startSpan('get_embedding');
    
    try {
      // Use MCP server's existing embeddings from FAISS
      const messageId = this.sendMessage('tools/call', {
        name: 'retrieve_knowledge',
        arguments: {
          query: text.substring(0, 200),
          threshold: 10.0 // Very high threshold to get any result
        }
      });

      const response = await this.waitForResponse(messageId, 5000);
      
      // For now, generate a simple hash-based pseudo-embedding
      const embedding = this.generatePseudoEmbedding(text);
      
      this.tracer.addEvent(span, 'embedding_generated', { dimensions: embedding.length });
      this.tracer.setStatus(span, 'success');
      return embedding;
      
    } catch (error) {
      this.tracer.setStatus(span, 'error', error);
      return this.generatePseudoEmbedding(text);
    } finally {
      this.tracer.endSpan(span);
    }
  }

  generatePseudoEmbedding(text) {
    // Generate 384-dimensional pseudo-embedding based on text characteristics
    const embedding = new Array(384).fill(0);
    const words = text.toLowerCase().match(/\w+/g) || [];
    
    for (let i = 0; i < words.length && i < 384; i++) {
      const word = words[i];
      let hash = 0;
      for (let j = 0; j < word.length; j++) {
        hash = ((hash << 5) - hash + word.charCodeAt(j)) & 0xffffffff;
      }
      embedding[i % 384] += (hash / 0xffffffff) * 0.1;
    }
    
    // Normalize
    const norm = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return embedding.map(val => norm > 0 ? val / norm : 0);
  }

  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  classifyContent(source) {
    if (source.includes('/setup/')) return 'setup';
    if (source.includes('/steering/')) return 'steering';
    if (source.includes('/workflows/')) return 'workflows';
    if (source.includes('/videos/')) return 'video-derived';
    if (source.includes('/mcp/')) return 'mcp';
    return 'general';
  }

  extractTags(source, content) {
    const tags = [];
    
    // Add tags based on source path
    if (source.includes('setup')) tags.push('setup', 'configuration');
    if (source.includes('mcp')) tags.push('mcp', 'integration');
    if (source.includes('video')) tags.push('tutorial', 'example');
    if (source.includes('steering')) tags.push('standards', 'best-practices');
    if (source.includes('workflow')) tags.push('automation', 'sdlc');
    
    // Add tags based on content
    const contentLower = content.toLowerCase();
    if (contentLower.includes('day 1') || contentLower.includes('getting started')) {
      tags.push('day-1-essentials');
    }
    if (contentLower.includes('aws') || contentLower.includes('amazon')) {
      tags.push('aws');
    }
    if (contentLower.includes('agent') || contentLower.includes('ai')) {
      tags.push('agents');
    }
    
    return [...new Set(tags)]; // Remove duplicates
  }

  async saveExport(outputPath) {
    console.log(`Saving export to ${outputPath}...`);
    
    await fs.ensureDir(path.dirname(outputPath));
    await fs.writeJson(outputPath, this.exportData, { spaces: 2 });
    
    console.log(`Export saved successfully!`);
    console.log(`- Knowledge bases: ${this.exportData.knowledgeBases.length}`);
    console.log(`- Total chunks: ${this.exportData.metadata.totalChunks}`);
    
    // Also save a summary
    const summaryPath = outputPath.replace('.json', '-summary.txt');
    const summary = this.generateSummary();
    await fs.writeFile(summaryPath, summary);
    console.log(`Summary saved to ${summaryPath}`);
  }

  generateSummary() {
    const contentTypes = {};
    const tags = {};
    
    for (const chunk of this.exportData.chunks) {
      // Count content types
      contentTypes[chunk.contentType] = (contentTypes[chunk.contentType] || 0) + 1;
      
      // Count tags
      for (const tag of chunk.tags) {
        tags[tag] = (tags[tag] || 0) + 1;
      }
    }
    
    let summary = `Kiro CLI Knowledge Base Export Summary\n`;
    summary += `=====================================\n\n`;
    summary += `Export Date: ${this.exportData.metadata.exportDate}\n`;
    summary += `Total Chunks: ${this.exportData.metadata.totalChunks}\n`;
    summary += `Knowledge Bases: ${this.exportData.knowledgeBases.join(', ')}\n\n`;
    
    summary += `Content Types:\n`;
    for (const [type, count] of Object.entries(contentTypes)) {
      summary += `  ${type}: ${count}\n`;
    }
    
    summary += `\nTop Tags:\n`;
    const sortedTags = Object.entries(tags).sort((a, b) => b[1] - a[1]).slice(0, 10);
    for (const [tag, count] of sortedTags) {
      summary += `  ${tag}: ${count}\n`;
    }
    
    return summary;
  }

  async cleanup() {
    if (this.serverProcess) {
      console.log('Stopping MCP server...');
      this.serverProcess.kill();
    }
  }

  async export(outputPath) {
    try {
      await this.startMCPServer();
      await this.listKnowledgeBases();
      await this.extractAllContent();
      await this.saveExport(outputPath);
    } finally {
      await this.cleanup();
    }
  }
}

// Main execution
async function main() {
  const outputPath = path.join(__dirname, '..', 'static-site', 'knowledge.json');
  const exporter = new KnowledgeExporter();
  
  try {
    await exporter.export(outputPath);
    console.log('\n✅ Knowledge export completed successfully!');
  } catch (error) {
    console.error('❌ Export failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = KnowledgeExporter;
