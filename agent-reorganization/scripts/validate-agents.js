const fs = require('fs');
const path = require('path');

const AGENTS_DIR = path.join(process.env.HOME, '.kiro', 'agents');

function validateAgent(agentPath) {
  try {
    const config = JSON.parse(fs.readFileSync(agentPath, 'utf8'));
    const required = ['name', 'description', 'tools'];
    
    for (const field of required) {
      if (!config[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
    
    return { valid: true, name: config.name };
  } catch (error) {
    return { valid: false, error: error.message, file: path.basename(agentPath) };
  }
}

const agentFiles = fs.readdirSync(AGENTS_DIR)
  .filter(f => f.endsWith('.json') && f !== 'agent_config.json.example')
  .map(f => path.join(AGENTS_DIR, f));

console.log('🔍 Validating Kiro CLI agents...\n');

const results = agentFiles.map(validateAgent);
const valid = results.filter(r => r.valid);
const invalid = results.filter(r => !r.valid);

console.log(`✅ Valid agents: ${valid.length}`);
valid.forEach(r => console.log(`  - ${r.name}`));

if (invalid.length > 0) {
  console.log(`\n❌ Invalid agents: ${invalid.length}`);
  invalid.forEach(r => console.log(`  - ${r.file}: ${r.error}`));
  process.exit(1);
}

console.log('\n🎉 All agents validated successfully!');
