#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

// Set environment variables
process.env.EMBEDDING_PROVIDER = 'ollama';
process.env.OLLAMA_BASE_URL = 'http://localhost:11434';
process.env.OLLAMA_MODEL = 'nomic-embed-text';
process.env.KNOWLEDGE_BASES_ROOT_DIR = path.join(process.env.HOME, 'mcp', 'knowledge-bases');

console.log('Testing knowledge base indexing...');

// Start the MCP server
const serverPath = path.join(__dirname, 'knowledge-base-mcp-server', 'build', 'index.js');
const server = spawn('node', [serverPath], {
  stdio: ['pipe', 'pipe', 'pipe'],
  env: process.env
});

let serverReady = false;

server.stdout.on('data', (data) => {
  const output = data.toString();
  console.log('Server output:', output);
  
  if (output.includes('"result"') && !serverReady) {
    serverReady = true;
    
    // Test list_knowledge_bases
    setTimeout(() => {
      const listMessage = {
        jsonrpc: "2.0",
        id: 2,
        method: "tools/call",
        params: {
          name: "list_knowledge_bases",
          arguments: {}
        }
      };
      
      console.log('Sending list_knowledge_bases request...');
      server.stdin.write(JSON.stringify(listMessage) + '\n');
    }, 1000);
    
    // Test retrieve_knowledge
    setTimeout(() => {
      const retrieveMessage = {
        jsonrpc: "2.0",
        id: 3,
        method: "tools/call",
        params: {
          name: "retrieve_knowledge",
          arguments: {
            query: "Kiro CLI setup"
          }
        }
      };
      
      console.log('Sending retrieve_knowledge request...');
      server.stdin.write(JSON.stringify(retrieveMessage) + '\n');
    }, 3000);
    
    // Close after testing
    setTimeout(() => {
      server.kill();
    }, 8000);
  }
});

server.stderr.on('data', (data) => {
  console.log('Server log:', data.toString());
});

server.on('close', (code) => {
  console.log(`Server exited with code ${code}`);
});

// Send initial tools/list message
const testMessage = {
  jsonrpc: "2.0",
  id: 1,
  method: "tools/list",
  params: {}
};

setTimeout(() => {
  server.stdin.write(JSON.stringify(testMessage) + '\n');
}, 500);
