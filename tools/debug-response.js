#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

// Set environment variables
process.env.EMBEDDING_PROVIDER = 'ollama';
process.env.OLLAMA_BASE_URL = 'http://localhost:11434';
process.env.OLLAMA_MODEL = 'nomic-embed-text';
process.env.KNOWLEDGE_BASES_ROOT_DIR = path.join(process.env.HOME, 'mcp', 'knowledge-bases');

console.log('Testing retrieve_knowledge response format...');

// Start the MCP server
const serverPath = path.join(__dirname, 'knowledge-base-mcp-server', 'build', 'index.js');
const server = spawn('node', [serverPath], {
  stdio: ['pipe', 'pipe', 'pipe'],
  env: process.env
});

let messageId = 1;
const responses = new Map();

server.stdout.on('data', (data) => {
  const output = data.toString();
  console.log('=== RAW OUTPUT ===');
  console.log(output);
  console.log('=== END RAW OUTPUT ===');
  
  try {
    const lines = output.split('\n').filter(line => line.trim());
    for (const line of lines) {
      if (line.startsWith('{')) {
        const response = JSON.parse(line);
        if (response.id) {
          responses.set(response.id, response);
          console.log(`Stored response for ID ${response.id}`);
        }
      }
    }
  } catch (e) {
    console.log('JSON parse error:', e.message);
  }
});

server.stderr.on('data', (data) => {
  console.log('Server log:', data.toString().trim());
});

server.on('close', (code) => {
  console.log(`Server exited with code ${code}`);
});

// Wait for server to be ready, then test
setTimeout(() => {
  console.log('Sending retrieve_knowledge request...');
  
  const message = {
    jsonrpc: "2.0",
    id: messageId++,
    method: "tools/call",
    params: {
      name: "retrieve_knowledge",
      arguments: {
        query: "Kiro CLI setup"
      }
    }
  };
  
  server.stdin.write(JSON.stringify(message) + '\n');
  
  // Check for response after delay
  setTimeout(() => {
    console.log('\n=== CHECKING RESPONSES ===');
    for (const [id, response] of responses.entries()) {
      console.log(`Response ${id}:`, JSON.stringify(response, null, 2));
    }
    
    server.kill();
  }, 5000);
}, 3000);
