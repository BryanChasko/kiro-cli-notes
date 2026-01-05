/**
 * Terminal Modal Component for Live OpenTelemetry Traces
 */
class TerminalModal {
    constructor(tracer) {
        this.tracer = tracer;
        this.isOpen = false;
        this.logs = [];
        this.maxLogs = 100;
        this.init();
    }

    init() {
        this.createModal();
        this.bindEvents();
        this.interceptConsole();
    }

    createModal() {
        const modal = document.createElement('div');
        modal.className = 'terminal-modal';
        modal.innerHTML = `
            <div class="terminal-modal__overlay"></div>
            <div class="terminal-modal__container">
                <div class="terminal-modal__header">
                    <div class="terminal-modal__title">
                        <span class="terminal-modal__icon">◇</span>
                        OpenTelemetry Live Traces
                    </div>
                    <button class="terminal-modal__close" aria-label="Close terminal">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                        </svg>
                    </button>
                </div>
                <div class="terminal-modal__content">
                    <div class="terminal-modal__output" id="terminal-output"></div>
                </div>
                <div class="terminal-modal__footer">
                    <span class="terminal-modal__status">Live • Press Esc to close</span>
                    <button class="terminal-modal__clear">Clear</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.modal = modal;
        this.output = modal.querySelector('#terminal-output');
    }

    bindEvents() {
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
            if (e.ctrlKey && e.key === '`') {
                e.preventDefault();
                this.toggle();
            }
        });

        // Close button
        this.modal.querySelector('.terminal-modal__close').addEventListener('click', () => {
            this.close();
        });

        // Clear button
        this.modal.querySelector('.terminal-modal__clear').addEventListener('click', () => {
            this.clear();
        });

        // Overlay click
        this.modal.querySelector('.terminal-modal__overlay').addEventListener('click', () => {
            this.close();
        });
    }

    interceptConsole() {
        const originalLog = console.log;
        const originalError = console.error;
        
        console.log = (...args) => {
            originalLog.apply(console, args);
            this.addLog('log', args);
        };
        
        console.error = (...args) => {
            originalError.apply(console, args);
            this.addLog('error', args);
        };
    }

    addLog(type, args) {
        const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
        const message = args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' ');

        // Only capture OpenTelemetry-related logs
        if (!message.includes('[TRACE]') && !message.includes('◇') && !message.includes('[✓]') && !message.includes('[✗]') && !message.includes('[!]')) {
            return;
        }

        const logEntry = {
            timestamp,
            type,
            message,
            id: Date.now() + Math.random()
        };

        this.logs.push(logEntry);
        
        // Keep only last N logs
        if (this.logs.length > this.maxLogs) {
            this.logs = this.logs.slice(-this.maxLogs);
        }

        if (this.isOpen) {
            this.renderLog(logEntry);
        }
    }

    renderLog(logEntry) {
        const logElement = document.createElement('div');
        logElement.className = `terminal-log terminal-log--${logEntry.type}`;
        
        // Parse styled console messages
        let cleanMessage = logEntry.message;
        if (cleanMessage.includes('%c')) {
            cleanMessage = cleanMessage.replace(/%c/g, '').split(',')[0];
        }
        
        logElement.innerHTML = `
            <span class="terminal-log__timestamp">${logEntry.timestamp}</span>
            <span class="terminal-log__message">${this.escapeHtml(cleanMessage)}</span>
        `;
        
        this.output.appendChild(logElement);
        this.output.scrollTop = this.output.scrollHeight;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    open() {
        this.isOpen = true;
        this.modal.classList.add('terminal-modal--open');
        document.body.style.overflow = 'hidden';
        
        // Render existing logs
        this.output.innerHTML = '';
        this.logs.forEach(log => this.renderLog(log));
        
        // Focus management
        this.modal.querySelector('.terminal-modal__close').focus();
    }

    close() {
        this.isOpen = false;
        this.modal.classList.remove('terminal-modal--open');
        document.body.style.overflow = '';
    }

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    clear() {
        this.logs = [];
        this.output.innerHTML = '';
    }
}

// Auto-initialize when tracer is available
if (typeof KnowledgeTracer !== 'undefined') {
    window.terminalModal = new TerminalModal();
}
