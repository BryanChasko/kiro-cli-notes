/**
 * Hybrid ASCII Components - Semantic HTML styled as ASCII art
 */
class ASCIIComponents {
    static createDivider(text = '', type = 'default') {
        const divider = document.createElement('div');
        divider.className = `ascii-divider ascii-divider--${type}`;
        divider.setAttribute('role', 'separator');
        divider.setAttribute('aria-label', text || 'Section divider');
        
        const templates = {
            default: `----[ ◇ ${text.toUpperCase()} ]----`,
            system: `<==[ ${text.toUpperCase()} ONLINE ]==>`,
            trace: `----[ ◇ TRACE: ${text.toUpperCase()} ]----`,
            status: `----[ ${this.getStatusIcon(text)} ${text.toUpperCase()} ]----`
        };
        
        divider.textContent = templates[type] || templates.default;
        return divider;
    }

    static getStatusIcon(status) {
        const icons = {
            success: '✓',
            error: '✗',
            warning: '!',
            info: '◇',
            loading: '◦'
        };
        return icons[status.toLowerCase()] || '◇';
    }

    static createStatusBadge(status, text) {
        const badge = document.createElement('span');
        badge.className = `ascii-badge ascii-badge--${status}`;
        badge.setAttribute('role', 'status');
        badge.setAttribute('aria-label', `${status}: ${text}`);
        
        const icon = this.getStatusIcon(status);
        badge.innerHTML = `<span class="ascii-badge__icon">[${icon}]</span> <span class="ascii-badge__text">${text}</span>`;
        
        return badge;
    }

    static createProgressBar(progress, total, label = '') {
        const container = document.createElement('div');
        container.className = 'ascii-progress';
        container.setAttribute('role', 'progressbar');
        container.setAttribute('aria-valuenow', progress);
        container.setAttribute('aria-valuemax', total);
        container.setAttribute('aria-label', label || 'Progress');
        
        const percentage = Math.round((progress / total) * 100);
        const barWidth = 20;
        const filled = Math.round((progress / total) * barWidth);
        const empty = barWidth - filled;
        
        const bar = '█'.repeat(filled) + '░'.repeat(empty);
        
        container.innerHTML = `
            <div class="ascii-progress__label">${label}</div>
            <div class="ascii-progress__bar">[${bar}] ${percentage}%</div>
            <div class="ascii-progress__stats">${progress}/${total}</div>
        `;
        
        return container;
    }

    static createInfoBox(title, content, type = 'info') {
        const box = document.createElement('div');
        box.className = `ascii-box ascii-box--${type}`;
        box.setAttribute('role', 'region');
        box.setAttribute('aria-labelledby', `box-title-${Date.now()}`);
        
        const titleId = `box-title-${Date.now()}`;
        const icon = this.getStatusIcon(type);
        
        box.innerHTML = `
            <div class="ascii-box__header">
                <h3 id="${titleId}" class="ascii-box__title">[${icon}] ${title}</h3>
            </div>
            <div class="ascii-box__content">
                ${Array.isArray(content) ? content.map(line => `<div>${line}</div>`).join('') : content}
            </div>
        `;
        
        return box;
    }

    static createMetricsDisplay(metrics) {
        const container = document.createElement('div');
        container.className = 'ascii-metrics';
        container.setAttribute('role', 'region');
        container.setAttribute('aria-label', 'System metrics');
        
        const metricElements = Object.entries(metrics).map(([key, value]) => {
            const metric = document.createElement('div');
            metric.className = 'ascii-metrics__item';
            
            const formattedKey = key.replace(/([A-Z])/g, ' $1').toUpperCase();
            const formattedValue = typeof value === 'number' ? 
                (value % 1 === 0 ? value.toString() : value.toFixed(2)) : 
                String(value);
            
            metric.innerHTML = `
                <span class="ascii-metrics__label">${formattedKey}:</span>
                <span class="ascii-metrics__value">${formattedValue}</span>
            `;
            
            return metric;
        });
        
        container.append(...metricElements);
        return container;
    }

    static updateDynamicContent(element, newText) {
        if (element.classList.contains('ascii-divider')) {
            const type = Array.from(element.classList)
                .find(cls => cls.startsWith('ascii-divider--'))
                ?.replace('ascii-divider--', '') || 'default';
            
            const newDivider = this.createDivider(newText, type);
            element.replaceWith(newDivider);
            return newDivider;
        }
        
        if (element.classList.contains('ascii-badge')) {
            const status = Array.from(element.classList)
                .find(cls => cls.startsWith('ascii-badge--'))
                ?.replace('ascii-badge--', '') || 'info';
            
            const newBadge = this.createStatusBadge(status, newText);
            element.replaceWith(newBadge);
            return newBadge;
        }
        
        return element;
    }
}

// Global utility
window.ASCII = ASCIIComponents;
