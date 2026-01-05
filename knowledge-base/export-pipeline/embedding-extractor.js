#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

// Direct embedding extraction from Ollama
async function getEmbedding(text) {
    return new Promise((resolve, reject) => {
        const ollama = spawn('ollama', ['run', 'nomic-embed-text', '--format', 'json'], {
            stdio: ['pipe', 'pipe', 'pipe']
        });

        let output = '';
        let error = '';

        ollama.stdout.on('data', (data) => {
            output += data.toString();
        });

        ollama.stderr.on('data', (data) => {
            error += data.toString();
        });

        ollama.on('close', (code) => {
            if (code === 0) {
                try {
                    const result = JSON.parse(output);
                    resolve(result.embedding || null);
                } catch (e) {
                    resolve(null);
                }
            } else {
                resolve(null);
            }
        });

        ollama.stdin.write(JSON.stringify({ prompt: text.substring(0, 500) }));
        ollama.stdin.end();
    });
}

// Test embedding extraction
async function testEmbedding() {
    console.log('🔍 [TRACE] Started: embedding_test');
    
    const testText = "Kiro CLI setup configuration guide";
    const embedding = await getEmbedding(testText);
    
    if (embedding && Array.isArray(embedding)) {
        console.log('✅ [TRACE] embedding_test: success', { dimensions: embedding.length });
        return true;
    } else {
        console.log('❌ [TRACE] embedding_test: FAILED - No embedding returned');
        return false;
    }
}

if (require.main === module) {
    testEmbedding();
}

module.exports = { getEmbedding };
