/**
 * OpenTelemetry tracing for knowledge base operations
 */
class KnowledgeTracer {
    constructor() {
        this.traces = new Map();
        this.startTime = Date.now();
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
        console.log(`🔍 [TRACE] Started: ${name}`, attributes);
        return spanId;
    }

    addEvent(spanId, event, attributes = {}) {
        const span = this.traces.get(spanId);
        if (span) {
            if (!span.events) span.events = [];
            span.events.push({ event, attributes, timestamp: Date.now() });
            console.log(`📊 [EVENT] ${span.name}: ${event}`, attributes);
        }
    }

    setStatus(spanId, status, error = null) {
        const span = this.traces.get(spanId);
        if (span) {
            span.status = status;
            span.error = error;
            const duration = Date.now() - span.startTime;
            
            if (status === 'error' && error) {
                console.error(`❌ [TRACE] ${span.name}: FAILED (${duration}ms)`, {
                    error: error.message,
                    stack: error.stack,
                    spanId: spanId,
                    attributes: span.attributes
                });
            } else {
                console.log(`${status === 'success' ? '✅' : '⚠️'} [TRACE] ${span.name}: ${status} (${duration}ms)`);
            }
        }
    }

    endSpan(spanId) {
        const span = this.traces.get(spanId);
        if (span) {
            span.endTime = Date.now();
            span.duration = span.endTime - span.startTime;
            this.setStatus(spanId, span.status || 'success');
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
