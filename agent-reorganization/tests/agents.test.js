const fs = require('fs');
const path = require('path');
const { trace } = require('@opentelemetry/api');

const tracer = trace.getTracer('agent-tests');

describe('Agent Configuration Tests', () => {
  const agentsDir = path.join(__dirname, '../agents');
  const configDir = path.join(process.env.HOME, '.kiro', 'config');
  
  let agentFiles;
  
  beforeAll(() => {
    agentFiles = fs.readdirSync(agentsDir)
      .filter(file => file.endsWith('.json'))
      .map(file => path.join(agentsDir, file));
  });

  test('All agent files have valid JSON syntax', async () => {
    const span = tracer.startSpan('validate-agent-json');
    
    try {
      for (const agentFile of agentFiles) {
        const content = fs.readFileSync(agentFile, 'utf8');
        expect(() => JSON.parse(content)).not.toThrow();
      }
      span.setStatus({ code: 1 });
    } finally {
      span.end();
    }
  });

  test('All agents have required fields', async () => {
    const span = tracer.startSpan('validate-agent-fields');
    
    try {
      const requiredFields = ['name', 'description', 'model', 'tools', 'allowedTools'];
      
      for (const agentFile of agentFiles) {
        const config = JSON.parse(fs.readFileSync(agentFile, 'utf8'));
        
        for (const field of requiredFields) {
          expect(config).toHaveProperty(field);
        }
        
        expect(config.name).toBeTruthy();
        expect(config.description).toBeTruthy();
        expect(Array.isArray(config.tools)).toBe(true);
        expect(Array.isArray(config.allowedTools)).toBe(true);
      }
      span.setStatus({ code: 1 });
    } finally {
      span.end();
    }
  });

  test('All agents have essential MCP baseline', async () => {
    const span = tracer.startSpan('validate-essential-mcps');
    
    try {
      const essentialMCPs = ['@fetch/', '@filesystem/', '@github/'];
      
      for (const agentFile of agentFiles) {
        const config = JSON.parse(fs.readFileSync(agentFile, 'utf8'));
        
        for (const mcp of essentialMCPs) {
          const hasEssentialMCP = config.tools.some(tool => 
            tool.includes(mcp) || tool === 'fs_read' || tool === 'fs_write'
          );
          expect(hasEssentialMCP).toBe(true);
        }
      }
      span.setStatus({ code: 1 });
    } finally {
      span.end();
    }
  });

  test('Agent names match filename', async () => {
    const span = tracer.startSpan('validate-agent-names');
    
    try {
      for (const agentFile of agentFiles) {
        const config = JSON.parse(fs.readFileSync(agentFile, 'utf8'));
        const expectedName = path.basename(agentFile, '.json');
        
        expect(config.name).toBe(expectedName);
      }
      span.setStatus({ code: 1 });
    } finally {
      span.end();
    }
  });

  test('Knowledge base assignments are valid', async () => {
    const span = tracer.startSpan('validate-knowledge-bases');
    
    try {
      const validKnowledgeBases = ['observability', 'content', 'engineering', 'analysis'];
      
      for (const agentFile of agentFiles) {
        const config = JSON.parse(fs.readFileSync(agentFile, 'utf8'));
        
        if (config.knowledgeBase) {
          expect(validKnowledgeBases).toContain(config.knowledgeBase);
        }
      }
      span.setStatus({ code: 1 });
    } finally {
      span.end();
    }
  });
});

describe('MCP Configuration Tests', () => {
  test('MCP configuration is valid JSON', async () => {
    const span = tracer.startSpan('validate-mcp-json');
    
    try {
      const mcpConfigPath = path.join(__dirname, '../configs/enhanced-mcp.json');
      const content = fs.readFileSync(mcpConfigPath, 'utf8');
      const config = JSON.parse(content);
      
      expect(config).toHaveProperty('mcpServers');
      expect(typeof config.mcpServers).toBe('object');
      span.setStatus({ code: 1 });
    } finally {
      span.end();
    }
  });

  test('All MCP servers have required configuration', async () => {
    const span = tracer.startSpan('validate-mcp-servers');
    
    try {
      const mcpConfigPath = path.join(__dirname, '../configs/enhanced-mcp.json');
      const config = JSON.parse(fs.readFileSync(mcpConfigPath, 'utf8'));
      
      for (const [serverName, serverConfig] of Object.entries(config.mcpServers)) {
        if (serverName.startsWith('_comment')) continue;
        
        expect(serverConfig).toHaveProperty('command');
        expect(serverConfig).toHaveProperty('args');
        expect(serverConfig).toHaveProperty('disabled');
      }
      span.setStatus({ code: 1 });
    } finally {
      span.end();
    }
  });
});
