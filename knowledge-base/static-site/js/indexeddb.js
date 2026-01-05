/**
 * IndexedDB wrapper for Kiro CLI Knowledge Base
 * Handles storage and retrieval of knowledge base data
 */
class KnowledgeDB {
    constructor() {
        this.dbName = 'KiroKnowledgeBase';
        this.version = 1;
        this.db = null;
        this.isReady = false;
    }

    /**
     * Initialize the database
     * @returns {Promise<void>}
     */
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => {
                console.error('Failed to open IndexedDB:', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                this.isReady = true;
                console.log('IndexedDB initialized successfully');
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Create chunks store
                if (!db.objectStoreNames.contains('chunks')) {
                    const chunksStore = db.createObjectStore('chunks', { keyPath: 'id' });
                    chunksStore.createIndex('contentType', 'contentType', { unique: false });
                    chunksStore.createIndex('tags', 'tags', { unique: false, multiEntry: true });
                    chunksStore.createIndex('source', 'source', { unique: false });
                    chunksStore.createIndex('embedding', 'embedding', { unique: false });
                }

                // Create metadata store
                if (!db.objectStoreNames.contains('metadata')) {
                    db.createObjectStore('metadata', { keyPath: 'key' });
                }

                console.log('IndexedDB schema created/updated');
            };
        });
    }

    /**
     * Store knowledge base data
     * @param {Object} data - Knowledge base export data
     * @returns {Promise<void>}
     */
    async storeKnowledgeBase(data) {
        if (!this.isReady) {
            throw new Error('Database not initialized');
        }

        const transaction = this.db.transaction(['chunks', 'metadata'], 'readwrite');
        const chunksStore = transaction.objectStore('chunks');
        const metadataStore = transaction.objectStore('metadata');

        // Clear existing data
        await this.clearStore(chunksStore);
        await this.clearStore(metadataStore);

        // Store metadata
        await this.putData(metadataStore, {
            key: 'export_info',
            ...data.metadata,
            knowledgeBases: data.knowledgeBases
        });

        // Store chunks
        const storePromises = data.chunks.map(chunk => 
            this.putData(chunksStore, chunk)
        );

        await Promise.all(storePromises);
        
        console.log(`Stored ${data.chunks.length} chunks in IndexedDB`);
    }

    /**
     * Get all chunks
     * @returns {Promise<Array>}
     */
    async getAllChunks() {
        if (!this.isReady) {
            throw new Error('Database not initialized');
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['chunks'], 'readonly');
            const store = transaction.objectStore('chunks');
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Search chunks by keyword and semantic similarity
     * @param {string} query - Search query
     * @param {Object} filters - Filter options
     * @returns {Promise<Array>}
     */
    async searchChunks(query, filters = {}) {
        const chunks = await this.getAllChunks();
        let results = chunks;

        // Apply content type filter
        if (filters.contentType) {
            results = results.filter(chunk => chunk.contentType === filters.contentType);
        }

        // Apply tag filter
        if (filters.tag) {
            results = results.filter(chunk => chunk.tags.includes(filters.tag));
        }

        // Apply text search
        if (query && query.trim()) {
            const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);
            
            results = results.filter(chunk => {
                const searchText = (chunk.content + ' ' + chunk.source + ' ' + chunk.tags.join(' ')).toLowerCase();
                return searchTerms.some(term => searchText.includes(term));
            });

            // Score results based on relevance
            results = results.map(chunk => {
                let keywordScore = 0;
                const searchText = chunk.content.toLowerCase();
                const sourceText = chunk.source.toLowerCase();
                
                searchTerms.forEach(term => {
                    // Higher score for matches in content
                    const contentMatches = (searchText.match(new RegExp(term, 'g')) || []).length;
                    keywordScore += contentMatches * 2;
                    
                    // Lower score for matches in source path
                    const sourceMatches = (sourceText.match(new RegExp(term, 'g')) || []).length;
                    keywordScore += sourceMatches;
                    
                    // Bonus for exact phrase matches
                    if (searchText.includes(query.toLowerCase())) {
                        keywordScore += 5;
                    }
                });

                return { ...chunk, keywordScore, searchScore: keywordScore };
            });

            // Sort by relevance score
            results.sort((a, b) => b.searchScore - a.searchScore);
        }

        return results;
    }

    /**
     * Semantic search using cosine similarity (placeholder for future implementation)
     * @param {string} query - Search query
     * @param {Array} queryEmbedding - Query embedding vector
     * @param {Object} filters - Filter options
     * @returns {Promise<Array>}
     */
    async semanticSearch(query, queryEmbedding, filters = {}) {
        const chunks = await this.getAllChunks();
        
        // Filter chunks that have embeddings
        const chunksWithEmbeddings = chunks.filter(chunk => chunk.embedding);
        
        if (!queryEmbedding || chunksWithEmbeddings.length === 0) {
            // Fallback to keyword search
            return this.searchChunks(query, filters);
        }

        // Calculate cosine similarity for each chunk
        const results = chunksWithEmbeddings.map(chunk => {
            const similarity = this.cosineSimilarity(queryEmbedding, chunk.embedding);
            return { ...chunk, semanticScore: similarity, searchScore: similarity };
        });

        // Sort by semantic similarity
        results.sort((a, b) => b.semanticScore - a.semanticScore);

        return results;
    }

    /**
     * Calculate cosine similarity between two vectors
     * @param {Array} a - First vector
     * @param {Array} b - Second vector
     * @returns {number} Cosine similarity score
     */
    cosineSimilarity(a, b) {
        if (!a || !b || a.length !== b.length) return 0;
        
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;
        
        for (let i = 0; i < a.length; i++) {
            dotProduct += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }
        
        if (normA === 0 || normB === 0) return 0;
        
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    /**
     * Get metadata
     * @returns {Promise<Object>}
     */
    async getMetadata() {
        if (!this.isReady) {
            throw new Error('Database not initialized');
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['metadata'], 'readonly');
            const store = transaction.objectStore('metadata');
            const request = store.get('export_info');

            request.onsuccess = () => resolve(request.result || {});
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Check if knowledge base needs update
     * @param {string} remoteVersion - Remote version timestamp
     * @returns {Promise<boolean>}
     */
    async needsUpdate(remoteVersion) {
        const metadata = await this.getMetadata();
        return !metadata.exportDate || metadata.exportDate !== remoteVersion;
    }

    /**
     * Get unique content types
     * @returns {Promise<Array>}
     */
    async getContentTypes() {
        const chunks = await this.getAllChunks();
        const types = [...new Set(chunks.map(chunk => chunk.contentType))];
        return types.sort();
    }

    /**
     * Get unique tags
     * @returns {Promise<Array>}
     */
    async getTags() {
        const chunks = await this.getAllChunks();
        const allTags = chunks.flatMap(chunk => chunk.tags);
        const uniqueTags = [...new Set(allTags)];
        return uniqueTags.sort();
    }

    // Helper methods
    clearStore(store) {
        return new Promise((resolve, reject) => {
            const request = store.clear();
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    putData(store, data) {
        return new Promise((resolve, reject) => {
            const request = store.put(data);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
}

// Export for use in other scripts
window.KnowledgeDB = KnowledgeDB;
