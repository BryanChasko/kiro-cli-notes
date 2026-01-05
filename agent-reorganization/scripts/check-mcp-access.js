#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const AGENTS_DIR = path.join(process.env.HOME, '.kiro', 'agents');
const MCP_CONFIG = path.join(process.env.HOME, '.kiro', 'config', 'mcp.json');

// Load MCP servers
const mcpConfig = JSON.parse(fs.readFileSync(MCP_CONFIG, 'utf8'));
const availableServers = Object.keys(mcpConfig.mcpServers);

console.log('🔍 Validating agent MCP access...\n');

// Check each agent
const agentFiles = fs.readdirSync(AGENTS_DIR)
  .filter(f => f.endsWith('.json') && f !== 'agent_config.json.example');

for (const agentFile of agentFiles) {
  const agentPath = path.join(AGENTS_DIR, agentFile);
  const agent = JSON.parse(fs.readFileSync(agentPath, 'utf8'));
  
  console.log(`📋 ${agent.name}:`);
  
  // Check if agent has includeMcpJson
  if (agent.includeMcpJson) {
    console.log('  ✅ Has MCP access (includeMcpJson: true)');
  } else {
    console.log('  ⚠️  No MCP access configured');
  }
  
  // Check tools that suggest MCP usage
  const mcpTools = agent.tools?.filter(tool => 
    tool.includes('@') || 
    tool.includes('browser_') || 
    tool.includes('navigate_') ||
    tool.includes('take_snapshot')
  ) || [];
  
  if (mcpTools.length > 0) {
    console.log(`  🔧 MCP tools: ${mcpTools.join(', ')}`);
  }
  
  console.log('');
}

console.log(`📊 Available MCP servers: ${availableServers.length}`);
console.log(`   ${availableServers.join(', ')}`);
console.log('\n✅ MCP configuration review complete!');
