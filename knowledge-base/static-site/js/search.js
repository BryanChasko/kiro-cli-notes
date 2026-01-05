/**
 * Search functionality for Kiro CLI Knowledge Base
 */
class KnowledgeSearch {
    constructor(db) {
        this.db = db;
        this.currentResults = [];
    }

    /**
     * Perform search with filters
     * @param {string} query - Search query
     * @param {Object} filters - Filter options
     * @returns {Promise<Array>}
     */
    async search(query, filters = {}) {
        try {
            const results = await this.db.searchChunks(query, filters);
            this.currentResults = results;
            return results;
        } catch (error) {
            console.error('Search failed:', error);
            throw error;
        }
    }

    /**
     * Get contextual search results for predefined categories
     * @param {string} context - Context category
     * @returns {Promise<Array>}
     */
    async getContextualResults(context) {
        const contextQueries = {
            'day-1-essentials': {
                query: 'getting started setup configuration day 1',
                filters: { tag: 'day-1-essentials' }
            },
            'mcp-setup': {
                query: 'MCP server integration setup',
                filters: { contentType: 'setup' }
            },
            'workflows': {
                query: 'workflow automation SDLC',
                filters: { contentType: 'workflows' }
            },
            'troubleshooting': {
                query: 'troubleshooting debugging error',
                filters: {}
            }
        };

        const config = contextQueries[context];
        if (!config) {
            throw new Error(`Unknown context: ${context}`);
        }

        return this.search(config.query, config.filters);
    }

    /**
     * Format search results for display
     * @param {Array} results - Search results
     * @returns {Array}
     */
    formatResults(results) {
        return results.map(result => ({
            ...result,
            displayContent: this.truncateContent(result.content, 300),
            displaySource: this.formatSourcePath(result.source),
            relevanceScore: result.searchScore || result.score || 0
        }));
    }

    /**
     * Truncate content for display
     * @param {string} content - Content to truncate
     * @param {number} maxLength - Maximum length
     * @returns {string}
     */
    truncateContent(content, maxLength = 300) {
        if (content.length <= maxLength) {
            return content;
        }

        const truncated = content.substring(0, maxLength);
        const lastSpace = truncated.lastIndexOf(' ');
        
        if (lastSpace > maxLength * 0.8) {
            return truncated.substring(0, lastSpace) + '...';
        }
        
        return truncated + '...';
    }

    /**
     * Format source path for display
     * @param {string} sourcePath - Full source path
     * @returns {string}
     */
    formatSourcePath(sourcePath) {
        // Extract filename and parent directory
        const parts = sourcePath.split('/');
        const filename = parts[parts.length - 1];
        const parentDir = parts[parts.length - 2];
        
        return `${parentDir}/${filename}`;
    }

    /**
     * Highlight search terms in content
     * @param {string} content - Content to highlight
     * @param {string} query - Search query
     * @returns {string}
     */
    highlightSearchTerms(content, query) {
        if (!query || !query.trim()) {
            return content;
        }

        const terms = query.toLowerCase().split(' ').filter(term => term.length > 1);
        let highlightedContent = content;

        terms.forEach(term => {
            const regex = new RegExp(`(${this.escapeRegex(term)})`, 'gi');
            highlightedContent = highlightedContent.replace(regex, '<mark>$1</mark>');
        });

        return highlightedContent;
    }

    /**
     * Escape regex special characters
     * @param {string} string - String to escape
     * @returns {string}
     */
    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    /**
     * Get search suggestions based on content
     * @param {string} partial - Partial query
     * @returns {Promise<Array>}
     */
    async getSuggestions(partial) {
        if (!partial || partial.length < 2) {
            return [];
        }

        const chunks = await this.db.getAllChunks();
        const suggestions = new Set();

        // Extract common terms from content
        chunks.forEach(chunk => {
            const words = chunk.content.toLowerCase().match(/\b\w{3,}\b/g) || [];
            words.forEach(word => {
                if (word.startsWith(partial.toLowerCase()) && word.length > partial.length) {
                    suggestions.add(word);
                }
            });
            
            // Add tag suggestions
            chunk.tags.forEach(tag => {
                if (tag.toLowerCase().startsWith(partial.toLowerCase())) {
                    suggestions.add(tag);
                }
            });
        });

        return Array.from(suggestions).slice(0, 8);
    }

    /**
     * Get contextual suggestions based on content type
     * @returns {Array}
     */
    getContextualSuggestions() {
        return [
            'Day 1 setup',
            'MCP server integration', 
            'workflow automation',
            'troubleshooting guide',
            'AWS configuration',
            'agent setup',
            'best practices',
            'video tutorials'
        ];
    }
}

// Export for use in other scripts
window.KnowledgeSearch = KnowledgeSearch;
