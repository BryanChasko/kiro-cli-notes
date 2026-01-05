/**
 * Main application logic for Kiro CLI Knowledge Base
 */
class KnowledgeApp {
    constructor() {
        this.db = new KnowledgeDB();
        this.search = null;
        this.isLoading = false;
        this.currentQuery = '';
        this.currentFilters = {};
        this.tracer = new KnowledgeTracer();
        
        // DOM elements
        this.elements = {
            searchInput: document.getElementById('searchInput'),
            searchButton: document.getElementById('searchButton'),
            contentTypeFilter: document.getElementById('contentTypeFilter'),
            tagFilter: document.getElementById('tagFilter'),
            searchResults: document.getElementById('searchResults'),
            loadingIndicator: document.getElementById('loadingIndicator'),
            noResults: document.getElementById('noResults'),
            statusInfo: document.getElementById('statusInfo'),
            lastUpdated: document.getElementById('lastUpdated'),
            contextButtons: document.querySelectorAll('.context-button')
        };
    }

    /**
     * Initialize the application
     */
    async init() {
        const span = this.tracer.startSpan('app_initialization');
        
        try {
            this.tracer.addEvent(span, 'initializing_database');
            
            // Initialize database
            await this.db.init();
            this.search = new KnowledgeSearch(this.db);
            
            this.tracer.addEvent(span, 'loading_knowledge_base');
            
            // Load knowledge base data
            await this.loadKnowledgeBase();
            
            this.tracer.addEvent(span, 'setting_up_ui');
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Demo ASCII components
            this.setupASCIIDemo();
            
            this.tracer.addEvent(span, 'app_ready');
            
            // Update UI
            await this.updateFilters();
            await this.updateMetadata();
            
            this.tracer.addEvent(span, 'app_ready');
            this.updateStatus('Ready to search');
            this.tracer.setStatus(span, 'success');
            
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.updateStatus('Failed to initialize - please refresh the page');
            this.tracer.addEvent(span, 'initialization_error', {
                errorMessage: error.message,
                errorType: error.constructor.name,
                stage: 'app_initialization'
            });
            this.tracer.setStatus(span, 'error', error);
        } finally {
            this.tracer.endSpan(span);
        }
    }

    /**
     * Load knowledge base data from JSON file
     */
    async loadKnowledgeBase() {
        try {
            this.updateStatus('Loading knowledge base...');
            
            const response = await fetch('knowledge.json');
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // Check if we need to update
            const needsUpdate = await this.db.needsUpdate(data.metadata.exportDate);
            
            if (needsUpdate) {
                this.updateStatus('Updating knowledge base...');
                await this.db.storeKnowledgeBase(data);
                console.log('Knowledge base updated');
            } else {
                console.log('Knowledge base is up to date');
            }
            
        } catch (error) {
            console.error('Failed to load knowledge base:', error);
            this.updateStatus('Failed to load knowledge base');
            throw error;
        }
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Search input with autocomplete
        this.elements.searchInput.addEventListener('input', this.debounce(async () => {
            const query = this.elements.searchInput.value.trim();
            if (query.length > 1) {
                const suggestions = await this.search.getSuggestions(query);
                this.showSuggestions(suggestions);
            } else {
                this.hideSuggestions();
            }
            this.performSearch();
        }, 300));

        this.elements.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.performSearch();
            }
        });

        // Search button
        this.elements.searchButton.addEventListener('click', () => {
            this.performSearch();
        });

        // Filters
        this.elements.contentTypeFilter.addEventListener('change', () => {
            this.performSearch();
        });

        this.elements.tagFilter.addEventListener('change', () => {
            this.performSearch();
        });

        // Context buttons
        this.elements.contextButtons.forEach(button => {
            button.addEventListener('click', () => {
                const query = button.dataset.query;
                this.elements.searchInput.value = query;
                this.performSearch();
            });
        });
    }

    /**
     * Perform search with current query and filters
     */
    async performSearch() {
        if (this.isLoading) return;

        const span = this.tracer.startSpan('search_operation');
        const query = this.elements.searchInput.value.trim();
        const filters = {
            contentType: this.elements.contentTypeFilter.value,
            tag: this.elements.tagFilter.value
        };

        this.currentQuery = query;
        this.currentFilters = filters;

        this.tracer.addEvent(span, 'search_started', { 
            query: query.substring(0, 50), 
            filters: Object.keys(filters).filter(k => filters[k]).length 
        });

        try {
            this.showLoading(true);
            
            const results = await this.search.search(query, filters);
            const formattedResults = this.search.formatResults(results);
            
            this.tracer.addEvent(span, 'search_completed', { 
                resultCount: results.length,
                formattedCount: formattedResults.length 
            });
            
            this.displayResults(formattedResults);
            this.tracer.setStatus(span, 'success');
            
        } catch (error) {
            console.error('Search failed:', error);
            this.showError('Search failed. Please try again.');
            this.tracer.addEvent(span, 'search_error', { 
                errorMessage: error.message,
                errorType: error.constructor.name,
                query: query.substring(0, 50)
            });
            this.tracer.setStatus(span, 'error', error);
        } finally {
            this.showLoading(false);
            this.tracer.endSpan(span);
        }
    }

    /**
     * Display search results
     * @param {Array} results - Formatted search results
     */
    displayResults(results) {
        const container = this.elements.searchResults;
        
        if (results.length === 0) {
            container.innerHTML = '';
            this.elements.noResults.classList.remove('hidden');
            return;
        }

        this.elements.noResults.classList.add('hidden');
        
        container.innerHTML = results.map(result => this.createResultHTML(result)).join('');
    }

    /**
     * Create HTML for a single result
     * @param {Object} result - Search result
     * @returns {string}
     */
    createResultHTML(result) {
        const highlightedContent = this.search.highlightSearchTerms(result.displayContent, this.currentQuery);
        
        const tagsHTML = result.tags.map(tag => 
            `<span class="tag ${this.currentFilters.tag === tag ? 'primary' : ''}">${tag}</span>`
        ).join('');

        const scoreHTML = result.relevanceScore > 0 ? 
            `<span class="result-score">Score: ${result.relevanceScore.toFixed(1)}</span>` : '';

        return `
            <div class="result-item">
                <div class="result-header">
                    <div class="result-meta">
                        <span class="result-source">${result.displaySource}</span>
                        <span class="content-type">${result.contentType}</span>
                        ${scoreHTML}
                    </div>
                </div>
                <div class="result-content">${highlightedContent}</div>
                <div class="result-tags">${tagsHTML}</div>
            </div>
        `;
    }

    /**
     * Update filter options based on available data
     */
    async updateFilters() {
        try {
            // Update content type filter
            const contentTypes = await this.db.getContentTypes();
            this.updateSelectOptions(this.elements.contentTypeFilter, contentTypes, {
                'setup': 'Setup & Configuration',
                'video-derived': 'Video Tutorials',
                'steering': 'Standards & Best Practices',
                'workflows': 'Workflows & Automation',
                'mcp': 'MCP Integration'
            });

            // Update tag filter
            const tags = await this.db.getTags();
            this.updateSelectOptions(this.elements.tagFilter, tags);
            
        } catch (error) {
            console.error('Failed to update filters:', error);
        }
    }

    /**
     * Update select element options
     * @param {HTMLSelectElement} select - Select element
     * @param {Array} values - Option values
     * @param {Object} labels - Optional custom labels
     */
    updateSelectOptions(select, values, labels = {}) {
        // Keep the first option (All Types/All Tags)
        const firstOption = select.children[0];
        select.innerHTML = '';
        select.appendChild(firstOption);

        values.forEach(value => {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = labels[value] || value;
            select.appendChild(option);
        });
    }

    /**
     * Update metadata display
     */
    async updateMetadata() {
        try {
            const metadata = await this.db.getMetadata();
            
            if (metadata.exportDate) {
                const date = new Date(metadata.exportDate);
                this.elements.lastUpdated.textContent = `Last updated: ${date.toLocaleDateString()}`;
            }
            
        } catch (error) {
            console.error('Failed to update metadata:', error);
        }
    }

    /**
     * Show/hide loading indicator
     * @param {boolean} show - Whether to show loading
     */
    showLoading(show) {
        this.isLoading = show;
        
        if (show) {
            this.elements.loadingIndicator.classList.remove('hidden');
            this.elements.searchResults.innerHTML = '';
            this.elements.noResults.classList.add('hidden');
        } else {
            this.elements.loadingIndicator.classList.add('hidden');
        }
    }

    /**
     * Show error message
     * @param {string} message - Error message
     */
    showError(message) {
        this.elements.searchResults.innerHTML = `
            <div class="error-message">
                <h3>Error</h3>
                <p>${message}</p>
            </div>
        `;
    }

    /**
     * Update status message
     * @param {string} message - Status message
     */
    updateStatus(message) {
        this.elements.statusInfo.textContent = message;
    }

    /**
     * Show search suggestions
     * @param {Array} suggestions - Array of suggestion strings
     */
    showSuggestions(suggestions) {
        // Simple implementation - could be enhanced with dropdown UI
        if (suggestions.length > 0) {
            console.log('Suggestions:', suggestions.slice(0, 3).join(', '));
        }
    }

    /**
     * Hide search suggestions
     */
    hideSuggestions() {
        // Hide suggestions UI
    }

    /**
     * Setup ASCII component demonstrations
     */
    setupASCIIDemo() {
        // Add system status divider
        const systemDivider = ASCII.createDivider('SYSTEM ONLINE', 'system');
        const main = document.querySelector('.main');
        main.insertBefore(systemDivider, main.firstChild);

        // Add metrics display if we have tracer data
        setTimeout(() => {
            const metrics = this.tracer.getMetrics();
            if (metrics.totalSpans > 0) {
                const metricsDisplay = ASCII.createMetricsDisplay({
                    totalTraces: metrics.totalSpans,
                    successRate: `${Math.round((metrics.successfulSpans / metrics.totalSpans) * 100)}%`,
                    avgDuration: `${metrics.averageDuration.toFixed(1)}ms`
                });
                
                const statusInfo = document.querySelector('.status-info');
                if (statusInfo) {
                    statusInfo.appendChild(metricsDisplay);
                }
            }
        }, 2000);

        // Add terminal modal hotkey hint
        const infoBox = ASCII.createInfoBox(
            'Terminal Access',
            'Press Ctrl+` to open live OpenTelemetry traces',
            'info'
        );
        
        const footer = document.querySelector('.footer');
        if (footer) {
            footer.insertBefore(infoBox, footer.firstChild);
        }
    }

    /**
     * Debounce function to limit API calls
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @returns {Function}
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new KnowledgeApp();
    app.init().catch(error => {
        console.error('Failed to start application:', error);
    });
});
