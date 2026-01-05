/**
 * OpenTelemetry tracing for knowledge base operations
 * Enhanced with terminal styling and ASCII dividers
 */
class KnowledgeTracer {
    constructor() {
        this.traces = new Map();
        this.startTime = Date.now();
        this.colors = {
            info: '#7F5AF0',
            success: '#2CB67D', 
            warn: '#FF8906',
            error: '#EF4565',
            muted: '#94A1B2'
        };
    }

    _formatTimestamp() {
        return new Date().toISOString().split('T')[1].split('.')[0];
    }

    _logStyled(message, color = this.colors.info, data = null) {
        const timestamp = this._formatTimestamp();
        console.log(
            `%c[${timestamp}] ${message}`,
            `color: ${color}; font-family: 'IBM Plex Mono', monospace; font-weight: 500;`,
            data || ''
        );
    }

    _logDivider(type = 'start', operation = '') {
        const divider = type === 'start' 
            ? `----[ ◇ TRACE START${operation ? ': ' + operation.toUpperCase() : ''} ]----`
            : `----[ ◇ TRACE END${operation ? ': ' + operation.toUpperCase() : ''} ]----`;
        
        this._logStyled(divider, this.colors.muted);
    }

    startSpan(name, attributes = {}) {
        const spanId = `${name}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const span = {
            name,
            spanId,
            startTime: Date.now(),
            attributes,
            status: 'active'
        };
        
        this.traces.set(spanId, span);
        this._logDivider('start', name);
        this._logStyled(`[◇] Starting trace: ${name}`, this.colors.info, attributes);
        return spanId;
    }

    addEvent(spanId, event, attributes = {}) {
        const span = this.traces.get(spanId);
        if (span) {
            if (!span.events) span.events = [];
            span.events.push({ event, attributes, timestamp: Date.now() });
            this._logStyled(`[•] ${span.name}: ${event}`, this.colors.info, attributes);
        }
    }

    setStatus(spanId, status, error = null) {
        const span = this.traces.get(spanId);
        if (span) {
            span.status = status;
            span.error = error;
            const duration = Date.now() - span.startTime;
            
            const statusMap = {
                'success': { prefix: '[✓]', color: this.colors.success },
                'error': { prefix: '[✗]', color: this.colors.error },
                'warning': { prefix: '[!]', color: this.colors.warn }
            };
            
            const statusInfo = statusMap[status] || { prefix: '[•]', color: this.colors.info };
            
            if (status === 'error' && error) {
                this._logStyled(
                    `${statusInfo.prefix} ${span.name}: FAILED (${duration}ms)`,
                    statusInfo.color,
                    { error: error.message, spanId }
                );
            } else {
                this._logStyled(
                    `${statusInfo.prefix} ${span.name}: ${status.toUpperCase()} (${duration}ms)`,
                    statusInfo.color
                );
            }
        }
    }

    endSpan(spanId) {
        const span = this.traces.get(spanId);
        if (span) {
            span.endTime = Date.now();
            span.duration = span.endTime - span.startTime;
            this.setStatus(spanId, span.status || 'success');
            this._logDivider('end', span.name);
        }
    }

    getMetrics() {
        const spans = Array.from(this.traces.values());
        return {
            totalSpans: spans.length,
            successfulSpans: spans.filter(s => s.status === 'success').length,
            failedSpans: spans.filter(s => s.status === 'error').length,
            averageDuration: spans.reduce((acc, s) => acc + (s.duration || 0), 0) / spans.length
        };
    }
}

// Global tracer instance
window.KnowledgeTracer = KnowledgeTracer;
