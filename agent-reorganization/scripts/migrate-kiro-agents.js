#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const KIRO_AGENTS_DIR = path.join(process.env.HOME, '.kiro', 'agents');

// Migration mapping
const MIGRATIONS = {
  'frontend-spacing': 'design-system',
  'kb-creator': 'kiro-cli-expert',
  'screenpal-video-transcriber': 'video-analyst'
};

function migrateAgent(oldName, newName) {
  const oldPath = path.join(KIRO_AGENTS_DIR, `${oldName}.json`);
  const newPath = path.join(KIRO_AGENTS_DIR, `${newName}.json`);
  
  if (!fs.existsSync(oldPath)) {
    console.log(`⚠️  ${oldName}.json not found, skipping`);
    return;
  }
  
  const config = JSON.parse(fs.readFileSync(oldPath, 'utf8'));
  config.name = newName;
  
  fs.writeFileSync(newPath, JSON.stringify(config, null, 2));
  fs.unlinkSync(oldPath);
  
  console.log(`✅ Migrated ${oldName} → ${newName}`);
}

// Migrate existing agents
for (const [oldName, newName] of Object.entries(MIGRATIONS)) {
  migrateAgent(oldName, newName);
}

console.log('✅ Migration complete');
