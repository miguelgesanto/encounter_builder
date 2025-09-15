// SavedEncounters Component - Manages saved encounter display and operations
export class SavedEncounters {
    constructor(storageManager, modalManager) {
        this.storageManager = storageManager;
        this.modalManager = modalManager;
        this.encounters = [];
        this.currentSort = 'newest';
        this.currentFilter = '';
    }

    async init() {
        this.loadEncounters();
        this.bindEvents();
        console.log('SavedEncounters initialized');
    }

    bindEvents() {
        // Listen for tab clicks
        document.addEventListener('click', (e) => {
            if (e.target.id === 'saved-tab') {
                this.onSavedTabClick();
            }
        });

        // Listen for storage updates from other components
        window.addEventListener('storage', () => {
            this.loadEncounters();
            this.displayEncounters();
        });
    }

    onSavedTabClick() {
        this.loadEncounters();
        this.createControls();
        this.displayEncounters();
    }

    loadEncounters() {
        this.encounters = this.storageManager.getEncounters();
    }

    createControls() {
        const container = document.getElementById('saved-list');
        if (!container) return;

        // Check if controls already exist
        if (container.querySelector('.saved-controls')) return;

        const controlsDiv = document.createElement('div');
        controlsDiv.className = 'saved-controls';
        controlsDiv.innerHTML = `
            <div class="saved-controls-row">
                <div class="search-group">
                    <input type="text" id="saved-search" placeholder="Search saved encounters..." value="${this.currentFilter}">
                    <button id="clear-search" class="btn-secondary">Clear</button>
                </div>
                <div class="sort-group">
                    <label for="sort-select">Sort by:</label>
                    <select id="sort-select">
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="name">Name A-Z</option>
                        <option value="name-desc">Name Z-A</option>
                        <option value="difficulty">Difficulty</option>
                        <option value="party-level">Party Level</option>
                    </select>
                </div>
                <div class="action-group">
                    <button id="export-all" class="btn-secondary">Export All</button>
                    <button id="import-encounters" class="btn-secondary">Import</button>
                    <input type="file" id="import-file" accept=".json" style="display: none;">
                </div>
            </div>
            <div class="encounter-stats">
                <span id="encounter-count">0 encounters saved</span>
                <span id="storage-info"></span>
            </div>
        `;

        container.insertBefore(controlsDiv, container.firstChild);
        this.bindControlEvents();
        this.updateStats();
    }

    bindControlEvents() {
        // Search
        document.getElementById('saved-search').addEventListener('input', (e) => {
            this.currentFilter = e.target.value;
            this.displayEncounters();
        });

        document.getElementById('clear-search').addEventListener('click', () => {
            document.getElementById('saved-search').value = '';
            this.currentFilter = '';
            this.displayEncounters();
        });

        // Sort
        document.getElementById('sort-select').addEventListener('change', (e) => {
            this.currentSort = e.target.value;
            this.displayEncounters();
        });

        // Export/Import
        document.getElementById('export-all').addEventListener('click', () => {
            this.exportAllEncounters();
        });

        document.getElementById('import-encounters').addEventListener('click', () => {
            document.getElementById('import-file').click();
        });

        document.getElementById('import-file').addEventListener('change', (e) => {
            if (e.target.files[0]) {
                this.importEncounters(e.target.files[0]);
            }
        });
    }

    displayEncounters() {
        const container = document.getElementById('saved-list');
        if (!container) return;

        // Clear existing encounters (keep controls)
        const existingGrid = container.querySelector('.saved-encounters-container');
        if (existingGrid) {
            existingGrid.remove();
        }

        const gridDiv = document.createElement('div');
        gridDiv.className = 'saved-encounters-container saved-encounters-grid';

        const filteredEncounters = this.getFilteredAndSortedEncounters();

        if (filteredEncounters.length === 0) {
            const emptyMessage = this.currentFilter ? 
                'No encounters found matching your search.' : 
                'No saved encounters yet. Create some encounters to see them here!';
            gridDiv.innerHTML = `<div class="empty-state">${emptyMessage}</div>`;
            container.appendChild(gridDiv);
            return;
        }

        filteredEncounters.forEach(encounter => {
            const encounterCard = this.createEncounterCard(encounter);
            gridDiv.appendChild(encounterCard);
        });

        container.appendChild(gridDiv);
        this.updateStats();
    }

    getFilteredAndSortedEncounters() {
        let filtered = [...this.encounters];

        // Apply search filter
        if (this.currentFilter) {
            const searchTerm = this.currentFilter.toLowerCase();
            filtered = filtered.filter(encounter => 
                encounter.name.toLowerCase().includes(searchTerm) ||
                encounter.monsters.some(entry => 
                    entry.monster.name.toLowerCase().includes(searchTerm)
                )
            );
        }

        // Apply sorting
        filtered.sort((a, b) => {
            switch (this.currentSort) {
                case 'newest':
                    return new Date(b.savedAt || b.createdAt) - new Date(a.savedAt || a.createdAt);
                case 'oldest':
                    return new Date(a.savedAt || a.createdAt) - new Date(b.savedAt || b.createdAt);
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'name-desc':
                    return b.name.localeCompare(a.name);
                case 'difficulty':
                    const diffOrder = { easy: 1, medium: 2, hard: 3, deadly: 4 };
                    return (diffOrder[a.difficulty] || 0) - (diffOrder[b.difficulty] || 0);
                case 'party-level':
                    return a.partyLevel - b.partyLevel;
                default:
                    return 0;
            }
        });

        return filtered;
    }

    createEncounterCard(encounter) {
        const card = document.createElement('div');
        card.className = 'saved-encounter-card';
        
        const totalMonsters = encounter.monsters.reduce((sum, entry) => sum + entry.quantity, 0);
        const monsterSummary = encounter.monsters.length > 0 ? 
            encounter.monsters.map(entry => `${entry.quantity}x ${entry.monster.name}`).join(', ') :
            'No monsters';

        const createdDate = new Date(encounter.savedAt || encounter.createdAt).toLocaleDateString();
        const difficultyClass = `difficulty-${encounter.difficulty}`;

        card.innerHTML = `
            <div class="encounter-header">
                <h4 class="encounter-name">${encounter.name}</h4>
                <div class="encounter-difficulty ${difficultyClass}">${encounter.difficulty}</div>
            </div>
            <div class="encounter-summary">
                <div class="party-info">
                    <span><strong>Party:</strong> ${encounter.partySize} level ${encounter.partyLevel}</span>
                </div>
                <div class="monster-info">
                    <span><strong>Monsters:</strong> ${totalMonsters} total</span>
                </div>
                <div class="monster-list">${monsterSummary}</div>
            </div>
            <div class="encounter-meta">
                <span class="save-date">Saved: ${createdDate}</span>
                <div class="encounter-actions">
                    <button class="action-btn load-btn" title="Load Encounter">⚔️</button>
                    <button class="action-btn view-btn" title="View Details">👁️</button>
                    <button class="action-btn duplicate-btn" title="Duplicate">📋</button>
                    <button class="action-btn export-btn" title="Export">📤</button>
                    <button class="action-btn delete-btn" title="Delete">🗑️</button>
                </div>
            </div>
        `;

        this.bindCardEvents(card, encounter);
        return card;
    }

    bindCardEvents(card, encounter) {
        // Load encounter
        card.querySelector('.load-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.loadEncounter(encounter);
        });

        // View details
        card.querySelector('.view-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.viewEncounterDetails(encounter);
        });

        // Duplicate
        card.querySelector('.duplicate-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.duplicateEncounter(encounter);
        });

        // Export
        card.querySelector('.export-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.exportEncounter(encounter);
        });

        // Delete
        card.querySelector('.delete-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.deleteEncounter(encounter);
        });

        // Card click for quick load
        card.addEventListener('click', () => {
            this.loadEncounter(encounter);
        });
    }

    loadEncounter(encounter) {
        try {
            // Get the encounter builder component
            if (window.DnDApp && window.DnDApp.encounterBuilder) {
                window.DnDApp.encounterBuilder.loadEncounter(encounter);
            } else {
                // Fallback: trigger a custom event
                document.dispatchEvent(new CustomEvent('loadEncounter', { 
                    detail: encounter 
                }));
            }

            // Switch to encounter builder tab
            document.getElementById('encounter-tab').click();
            
            // Show success message
            this.showMessage(`Loaded encounter: ${encounter.name}`, 'success');
        } catch (error) {
            console.error('Error loading encounter:', error);
            this.showMessage('Failed to load encounter', 'error');
        }
    }

    viewEncounterDetails(encounter) {
        this.modalManager.showEncounterDetails(encounter);
    }

    duplicateEncounter(encounter) {
        try {
            const duplicate = this.storageManager.duplicateEncounter(encounter.id);
            this.loadEncounters();
            this.displayEncounters();
            this.showMessage(`Duplicated encounter: ${duplicate.name}`, 'success');
        } catch (error) {
            console.error('Error duplicating encounter:', error);
            this.showMessage('Failed to duplicate encounter', 'error');
        }
    }

    exportEncounter(encounter) {
        try {
            const dataStr = JSON.stringify([encounter], null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = `${encounter.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            this.showMessage(`Exported encounter: ${encounter.name}`, 'success');
        } catch (error) {
            console.error('Error exporting encounter:', error);
            this.showMessage('Failed to export encounter', 'error');
        }
    }

    deleteEncounter(encounter) {
        if (confirm(`Are you sure you want to delete "${encounter.name}"? This cannot be undone.`)) {
            try {
                this.storageManager.deleteEncounter(encounter.id);
                this.loadEncounters();
                this.displayEncounters();
                this.showMessage(`Deleted encounter: ${encounter.name}`, 'success');
            } catch (error) {
                console.error('Error deleting encounter:', error);
                this.showMessage('Failed to delete encounter', 'error');
            }
        }
    }

    exportAllEncounters() {
        try {
            this.storageManager.exportData();
            this.showMessage('All encounters exported successfully', 'success');
        } catch (error) {
            console.error('Error exporting all encounters:', error);
            this.showMessage('Failed to export encounters', 'error');
        }
    }

    async importEncounters(file) {
        try {
            const result = await this.storageManager.importData(file);
            this.loadEncounters();
            this.displayEncounters();
            
            const message = `Import complete: ${result.imported} new encounters imported`;
            if (result.skipped > 0) {
                message += `, ${result.skipped} duplicates skipped`;
            }
            
            this.showMessage(message, 'success');
        } catch (error) {
            console.error('Error importing encounters:', error);
            this.showMessage(`Import failed: ${error.message}`, 'error');
        }
    }

    updateStats() {
        const countElement = document.getElementById('encounter-count');
        const storageElement = document.getElementById('storage-info');
        
        if (countElement) {
            const count = this.encounters.length;
            countElement.textContent = `${count} encounter${count !== 1 ? 's' : ''} saved`;
        }

        if (storageElement) {
            const stats = this.storageManager.getStorageStats();
            storageElement.textContent = `Storage: ${stats.formattedSize} used`;
        }
    }

    showMessage(message, type = 'info') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message message-${type}`;
        messageDiv.textContent = message;
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem;
            border-radius: var(--radius);
            color: var(--text-color);
            background: ${type === 'success' ? 'var(--success-color)' : 
                         type === 'error' ? 'var(--error-color)' : 'var(--primary-color)'};
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => {
                    if (messageDiv.parentNode) {
                        messageDiv.parentNode.removeChild(messageDiv);
                    }
                }, 300);
            }
        }, 3000);
    }

    // Search encounters
    searchEncounters(query) {
        this.currentFilter = query;
        this.displayEncounters();
    }

    // Clear all encounters (with confirmation)
    clearAllEncounters() {
        if (confirm('Are you sure you want to delete ALL saved encounters? This cannot be undone!')) {
            try {
                // Clear encounters while keeping settings
                this.encounters.forEach(encounter => {
                    this.storageManager.deleteEncounter(encounter.id);
                });
                this.loadEncounters();
                this.displayEncounters();
                this.showMessage('All encounters deleted', 'success');
            } catch (error) {
                console.error('Error clearing all encounters:', error);
                this.showMessage('Failed to clear encounters', 'error');
            }
        }
    }
}