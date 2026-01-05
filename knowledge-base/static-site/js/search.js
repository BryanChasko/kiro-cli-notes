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
        console.log('🔍 SEARCH FUNCTION CALLED:', { query, filters });
        const tracer = window.tracer || { 
            startSpan: () => ({ 
                addEvent: () => {}, 
                setStatus: () => {}, 
                end: () => {} 
            }) 
        };
        const span = tracer.startSpan('search_execution');
        
        try {
            span.addEvent('search_input_validation', {
                query: query,
                queryLength: query?.length || 0,
                filters: JSON.stringify(filters),
                hasDb: !!this.db
            });

            // Allow filter-only searches
            const hasFilters = filters && (filters.contentType || filters.tag);
            if ((!query || query.trim().length === 0) && !hasFilters) {
                span.addEvent('search_empty_query');
                span.setStatus({ code: 2, message: 'Empty query provided' });
                return [];
            }

            if (!this.db) {
                span.addEvent('search_no_database');
                span.setStatus({ code: 2, message: 'Database not available' });
                throw new Error('Database not initialized');
            }

            span.addEvent('calling_db_search', {
                dbType: typeof this.db,
                hasSearchChunks: typeof this.db.searchChunks === 'function'
            });

            const results = await this.db.searchChunks(query, filters);
            
            span.addEvent('search_results_received', {
                resultCount: results?.length || 0,
                resultsType: typeof results,
                isArray: Array.isArray(results),
                firstResultKeys: results?.[0] ? Object.keys(results[0]) : []
            });

            this.currentResults = results;
            
            span.addEvent('search_completed_successfully', {
                finalResultCount: this.currentResults.length
            });
            
            span.setStatus({ code: 1 });
            return results;
        } catch (error) {
            span.addEvent('search_error', {
                errorMessage: error.message,
                errorStack: error.stack,
                errorType: error.constructor.name
            });
            span.setStatus({ code: 2, message: error.message });
            console.error('Search failed:', error);
            throw error;
        } finally {
            span.end();
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
        const tracer = window.tracer || { 
            startSpan: () => ({ 
                addEvent: () => {}, 
                setStatus: () => {}, 
                end: () => {} 
            }) 
        };
        const span = tracer.startSpan('format_results');
        
        try {
            span.addEvent('format_input_validation', {
                resultsType: typeof results,
                isArray: Array.isArray(results),
                resultCount: results?.length || 0,
                firstResultStructure: results?.[0] ? Object.keys(results[0]) : []
            });

            if (!Array.isArray(results)) {
                span.addEvent('format_invalid_input', {
                    actualType: typeof results,
                    actualValue: results
                });
                span.setStatus({ code: 2, message: 'Results is not an array' });
                return [];
            }

            const formatted = results.map((result, index) => {
                span.addEvent(`format_result_${index}`, {
                    hasContent: !!result.content,
                    hasSource: !!result.source,
                    hasScore: !!(result.searchScore || result.score),
                    contentLength: result.content?.length || 0,
                    resultKeys: Object.keys(result)
                });

                return {
                    ...result,
                    displayContent: this.truncateContent(result.content || '', 300),
                    displaySource: this.formatSourcePath(result.source || ''),
                    relevanceScore: result.searchScore || result.score || 0
                };
            });

            span.addEvent('format_completed', {
                formattedCount: formatted.length,
                sampleFormatted: formatted[0] ? Object.keys(formatted[0]) : []
            });

            span.setStatus({ code: 1 });
            return formatted;
        } catch (error) {
            span.addEvent('format_error', {
                errorMessage: error.message,
                errorStack: error.stack
            });
            span.setStatus({ code: 2, message: error.message });
            console.error('Format results failed:', error);
            return [];
        } finally {
            span.end();
        }
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
        if (!sourcePath) return 'Unknown source';
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
            if (chunk.metadata && chunk.metadata.tags) {
                chunk.metadata.tags.forEach(tag => {
                    if (tag.toLowerCase().startsWith(partial.toLowerCase())) {
                        suggestions.add(tag);
                    }
                });
            }
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
