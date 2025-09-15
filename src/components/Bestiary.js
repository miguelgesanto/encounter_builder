// Bestiary Component - Displays and manages monster information
export class Bestiary {
    constructor(storageManager, modalManager) {
        this.storageManager = storageManager;
        this.modalManager = modalManager;
        this.monsterDb = null;
        this.currentFilter = {
            search: '',
            type: '',
            cr: '',
            size: ''
        };
    }

    async init() {
        // Import MonsterDatabase here to avoid circular dependency
        const { MonsterDatabase } = await import('../data/MonsterDatabase.js');
        this.monsterDb = new MonsterDatabase();
        await this.monsterDb.init();
        
        this.bindEvents();
        this.displayMonsters();
        console.log('Bestiary initialized');
    }

    bindEvents() {
        // Only bind events when bestiary view is active
        document.addEventListener('click', (e) => {
            if (e.target.id === 'bestiary-tab') {
                this.onBestiaryTabClick();
            }
        });
    }

    onBestiaryTabClick() {
        // Create filter controls if they don't exist
        this.createFilterControls();
        this.displayMonsters();
    }

    createFilterControls() {
        const container = document.getElementById('bestiary-list');
        if (!container) return;

        // Check if filters already exist
        if (container.querySelector('.bestiary-filters')) return;

        const filtersDiv = document.createElement('div');
        filtersDiv.className = 'bestiary-filters';
        filtersDiv.innerHTML = `
            <div class="filter-grid">
                <input type="text" id="bestiary-search" placeholder="Search monsters..." value="${this.currentFilter.search}">
                <select id="bestiary-type-filter">
                    <option value="">All Types</option>
                    <option value="beast">Beast</option>
                    <option value="humanoid">Humanoid</option>
                    <option value="undead">Undead</option>
                    <option value="fiend">Fiend</option>
                    <option value="dragon">Dragon</option>
                    <option value="giant">Giant</option>
                    <option value="monstrosity">Monstrosity</option>
                    <option value="plant">Plant</option>
                </select>
                <select id="bestiary-cr-filter">
                    <option value="">All CR</option>
                    <option value="0">CR 0</option>
                    <option value="0.125">CR 1/8</option>
                    <option value="0.25">CR 1/4</option>
                    <option value="0.5">CR 1/2</option>
                    <option value="1">CR 1</option>
                    <option value="2">CR 2</option>
                    <option value="3">CR 3</option>
                    <option value="4">CR 4</option>
                    <option value="5">CR 5</option>
                </select>
                <select id="bestiary-size-filter">
                    <option value="">All Sizes</option>
                    <option value="tiny">Tiny</option>
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                    <option value="huge">Huge</option>
                    <option value="gargantuan">Gargantuan</option>
                </select>
            </div>
        `;

        container.insertBefore(filtersDiv, container.firstChild);

        // Bind filter events
        document.getElementById('bestiary-search').addEventListener('input', (e) => {
            this.currentFilter.search = e.target.value;
            this.displayMonsters();
        });

        document.getElementById('bestiary-type-filter').addEventListener('change', (e) => {
            this.currentFilter.type = e.target.value;
            this.displayMonsters();
        });

        document.getElementById('bestiary-cr-filter').addEventListener('change', (e) => {
            this.currentFilter.cr = e.target.value;
            this.displayMonsters();
        });

        document.getElementById('bestiary-size-filter').addEventListener('change', (e) => {
            this.currentFilter.size = e.target.value;
            this.displayMonsters();
        });
    }

    displayMonsters() {
        const container = document.getElementById('bestiary-list');
        if (!container) return;

        // Clear existing monsters (keep filters)
        const existingGrid = container.querySelector('.bestiary-grid');
        if (existingGrid) {
            existingGrid.remove();
        }

        const gridDiv = document.createElement('div');
        gridDiv.className = 'bestiary-grid monster-grid';

        const filteredMonsters = this.getFilteredMonsters();

        if (filteredMonsters.length === 0) {
            gridDiv.innerHTML = '<div class="empty-state">No monsters found matching your criteria.</div>';
            container.appendChild(gridDiv);
            return;
        }

        // Sort monsters by CR, then by name
        filteredMonsters.sort((a, b) => {
            if (a.challengeRating !== b.challengeRating) {
                return a.challengeRating - b.challengeRating;
            }
            return a.name.localeCompare(b.name);
        });

        filteredMonsters.forEach(monster => {
            const monsterCard = this.createBestiaryMonsterCard(monster);
            gridDiv.appendChild(monsterCard);
        });

        container.appendChild(gridDiv);
    }

    getFilteredMonsters() {
        if (!this.monsterDb) return [];

        return this.monsterDb.getFilteredMonsters({
            search: this.currentFilter.search,
            type: this.currentFilter.type,
            minCR: this.currentFilter.cr ? parseFloat(this.currentFilter.cr) : undefined,
            maxCR: this.currentFilter.cr ? parseFloat(this.currentFilter.cr) : undefined,
            size: this.currentFilter.size
        });
    }

    createBestiaryMonsterCard(monster) {
        const card = document.createElement('div');
        card.className = 'monster-card bestiary-card';
        
        const crDisplay = this.formatChallengeRating(monster.challengeRating);
        const xpValue = this.getXPForCR(monster.challengeRating);

        card.innerHTML = `
            <h4>${monster.name}</h4>
            <div class="monster-stats">
                <span class="cr-display">CR ${crDisplay}</span>
                <span class="xp-display">${xpValue} XP</span>
            </div>
            <div class="monster-basics">
                <div><strong>AC:</strong> ${monster.armorClass}</div>
                <div><strong>HP:</strong> ${monster.hitPoints}</div>
                <div><strong>Speed:</strong> ${monster.speed}</div>
            </div>
            <div class="monster-type">${monster.size} ${monster.type}</div>
            ${monster.description ? `<div class="monster-description">${monster.description.substring(0, 100)}...</div>` : ''}
            <div class="monster-actions">
                <button class="btn-secondary view-details-btn">View Details</button>
            </div>
        `;

        // Add click handler for details
        card.querySelector('.view-details-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.modalManager.showMonsterDetails(monster);
        });

        // Add click handler for card
        card.addEventListener('click', () => {
            this.modalManager.showMonsterDetails(monster);
        });

        return card;
    }

    formatChallengeRating(cr) {
        if (cr < 1) {
            return cr === 0.125 ? '1/8' : cr === 0.25 ? '1/4' : '1/2';
        }
        return cr.toString();
    }

    getXPForCR(challengeRating) {
        const xpValues = {
            0: 10, 0.125: 25, 0.25: 50, 0.5: 100, 1: 200, 2: 450, 3: 700, 4: 1100, 5: 1800
        };
        return xpValues[challengeRating] || 0;
    }

    // Search functionality
    searchMonsters(query) {
        this.currentFilter.search = query;
        this.displayMonsters();
    }

    // Filter by type
    filterByType(type) {
        this.currentFilter.type = type;
        this.displayMonsters();
    }

    // Filter by CR
    filterByCR(cr) {
        this.currentFilter.cr = cr;
        this.displayMonsters();
    }

    // Clear all filters
    clearFilters() {
        this.currentFilter = {
            search: '',
            type: '',
            cr: '',
            size: ''
        };

        // Update filter controls
        const searchInput = document.getElementById('bestiary-search');
        const typeFilter = document.getElementById('bestiary-type-filter');
        const crFilter = document.getElementById('bestiary-cr-filter');
        const sizeFilter = document.getElementById('bestiary-size-filter');

        if (searchInput) searchInput.value = '';
        if (typeFilter) typeFilter.value = '';
        if (crFilter) crFilter.value = '';
        if (sizeFilter) sizeFilter.value = '';

        this.displayMonsters();
    }

    // Get bestiary statistics
    getStats() {
        if (!this.monsterDb) return null;

        return this.monsterDb.getStats();
    }

    // Export bestiary data
    exportBestiary() {
        if (!this.monsterDb) return;

        const monsters = this.monsterDb.getMonsters();
        const exportData = {
            monsters: monsters,
            exportedAt: new Date().toISOString(),
            totalCount: monsters.length
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `dnd_bestiary_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}