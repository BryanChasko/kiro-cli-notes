// Jest setup for agent testing
const fs = require('fs');
const path = require('path');

// Mock Kiro CLI environment
global.KIRO_HOME = process.env.HOME + '/.kiro';
global.AGENTS_DIR = path.join(global.KIRO_HOME, 'agents');
global.CONFIG_DIR = path.join(global.KIRO_HOME, 'config');

// Ensure test directories exist
beforeAll(() => {
  if (!fs.existsSync(global.KIRO_HOME)) {
    fs.mkdirSync(global.KIRO_HOME, { recursive: true });
  }
  if (!fs.existsSync(global.AGENTS_DIR)) {
    fs.mkdirSync(global.AGENTS_DIR, { recursive: true });
  }
  if (!fs.existsSync(global.CONFIG_DIR)) {
    fs.mkdirSync(global.CONFIG_DIR, { recursive: true });
  }
});
