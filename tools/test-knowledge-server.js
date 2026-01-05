#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

// Set environment variables
process.env.EMBEDDING_PROVIDER = 'ollama';
process.env.OLLAMA_BASE_URL = 'http://localhost:11434';
process.env.OLLAMA_MODEL = 'nomic-embed-text';
process.env.KNOWLEDGE_BASES_ROOT_DIR = path.join(process.env.HOME, 'mcp', 'knowledge-bases');

console.log('Testing knowledge-base MCP server...');
console.log('Environment:');
console.log('- EMBEDDING_PROVIDER:', process.env.EMBEDDING_PROVIDER);
console.log('- OLLAMA_BASE_URL:', process.env.OLLAMA_BASE_URL);
console.log('- OLLAMA_MODEL:', process.env.OLLAMA_MODEL);
console.log('- KNOWLEDGE_BASES_ROOT_DIR:', process.env.KNOWLEDGE_BASES_ROOT_DIR);

// Start the MCP server
const serverPath = path.join(__dirname, 'knowledge-base-mcp-server', 'build', 'index.js');
const server = spawn('node', [serverPath], {
  stdio: ['pipe', 'pipe', 'pipe'],
  env: process.env
});

// Send a simple test message
const testMessage = {
  jsonrpc: "2.0",
  id: 1,
  method: "tools/list",
  params: {}
};

server.stdout.on('data', (data) => {
  console.log('Server output:', data.toString());
});

server.stderr.on('data', (data) => {
  console.log('Server error:', data.toString());
});

server.on('close', (code) => {
  console.log(`Server exited with code ${code}`);
});

// Send test message after a short delay
setTimeout(() => {
  server.stdin.write(JSON.stringify(testMessage) + '\n');
  
  // Close after another delay
  setTimeout(() => {
    server.kill();
  }, 2000);
}, 1000);
