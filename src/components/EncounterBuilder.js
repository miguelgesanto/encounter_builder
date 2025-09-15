// EncounterBuilder Component
import { EncounterCalculator } from '../utils/EncounterCalculator.js';
import { MonsterDatabase } from '../data/MonsterDatabase.js';

export class EncounterBuilder {
    constructor(storageManager, modalManager) {
        this.storageManager = storageManager;
        this.modalManager = modalManager;
        this.calculator = new EncounterCalculator();
        this.monsterDb = new MonsterDatabase();
        this.currentEncounter = {
            monsters: [],
            partySize: 4,
            partyLevel: 3,
            difficulty: 'medium'
        };
        this.filteredMonsters = [];
    }

    async init() {
        await this.monsterDb.init();
        this.bindEvents();
        this.updateEncounterBudget();
        this.displayMonsters();
        console.log('EncounterBuilder initialized');
    }

    bindEvents() {
        // Party setup controls
        document.getElementById('party-size').addEventListener('input', (e) => {
            this.currentEncounter.partySize = parseInt(e.target.value);
            this.updateEncounterBudget();
        });

        document.getElementById('party-level').addEventListener('input', (e) => {
            this.currentEncounter.partyLevel = parseInt(e.target.value);
            this.updateEncounterBudget();
        });

        document.getElementById('difficulty-select').addEventListener('change', (e) => {
            this.currentEncounter.difficulty = e.target.value;
            this.updateEncounterBudget();
        });

        // Search and filters
        document.getElementById('monster-search').addEventListener('input', (e) => {
            this.filterMonsters();
        });

        document.getElementById('cr-filter').addEventListener('change', (e) => {
            this.filterMonsters();
        });

        document.getElementById('type-filter').addEventListener('change', (e) => {
            this.filterMonsters();
        });

        // Encounter actions
        document.getElementById('save-encounter').addEventListener('click', () => {
            this.saveEncounter();
        });

        document.getElementById('clear-encounter').addEventListener('click', () => {
            this.clearEncounter();
        });

        document.getElementById('export-encounter').addEventListener('click', () => {
            this.exportEncounter();
        });
    }

    updateEncounterBudget() {
        const budget = this.calculator.calculateXPBudget(
            this.currentEncounter.partySize,
            this.currentEncounter.partyLevel,
            this.currentEncounter.difficulty
        );

        const usedXP = this.calculator.calculateEncounterXP(this.currentEncounter.monsters);
        const remaining = Math.max(0, budget - usedXP);

        document.getElementById('xp-budget').textContent = budget;
        document.getElementById('used-xp').textContent = usedXP;
        document.getElementById('remaining-xp').textContent = remaining;

        // Update color based on budget usage
        const remainingElement = document.getElementById('remaining-xp');
        if (remaining === 0) {
            remainingElement.style.color = 'var(--warning-color)';
        } else if (usedXP > budget) {
            remainingElement.style.color = 'var(--error-color)';
        } else {
            remainingElement.style.color = 'var(--success-color)';
        }
    }

    filterMonsters() {
        const searchTerm = document.getElementById('monster-search').value.toLowerCase();
        const crFilter = document.getElementById('cr-filter').value;
        const typeFilter = document.getElementById('type-filter').value;

        this.filteredMonsters = this.monsterDb.getMonsters().filter(monster => {
            const matchesSearch = monster.name.toLowerCase().includes(searchTerm);
            const matchesCR = !crFilter || monster.challengeRating.toString() === crFilter;
            const matchesType = !typeFilter || monster.type.toLowerCase() === typeFilter.toLowerCase();
            
            return matchesSearch && matchesCR && matchesType;
        });

        this.displayMonsters();
    }

    displayMonsters() {
        const container = document.getElementById('monster-results');
        const monsters = this.filteredMonsters.length > 0 ? this.filteredMonsters : this.monsterDb.getMonsters();
        
        container.innerHTML = '';

        if (monsters.length === 0) {
            container.innerHTML = '<div class="empty-state">No monsters found matching your criteria.</div>';
            return;
        }

        monsters.slice(0, 20).forEach(monster => { // Limit to 20 for performance
            const monsterCard = this.createMonsterCard(monster);
            container.appendChild(monsterCard);
        });
    }

    createMonsterCard(monster) {
        const card = document.createElement('div');
        card.className = 'monster-card';
        
        const crDisplay = this.formatChallengeRating(monster.challengeRating);
        const xpValue = this.calculator.getXPForCR(monster.challengeRating);

        card.innerHTML = `
            <h4>${monster.name}</h4>
            <div class="monster-stats">
                <span>CR ${crDisplay}</span>
                <span>${xpValue} XP</span>
                <span>AC ${monster.armorClass}</span>
                <span>${monster.hitPoints} HP</span>
            </div>
            <div class="monster-type">${monster.size} ${monster.type}</div>
            <button class="add-monster-btn" title="Add to encounter">+</button>
        `;

        // Add click handlers
        card.addEventListener('click', (e) => {
            if (!e.target.classList.contains('add-monster-btn')) {
                this.modalManager.showMonsterDetails(monster);
            }
        });

        card.querySelector('.add-monster-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.addMonsterToEncounter(monster);
        });

        return card;
    }

    addMonsterToEncounter(monster) {
        const existingMonster = this.currentEncounter.monsters.find(m => m.monster.name === monster.name);
        
        if (existingMonster) {
            existingMonster.quantity += 1;
        } else {
            this.currentEncounter.monsters.push({
                monster: monster,
                quantity: 1
            });
        }

        this.updateEncounterDisplay();
        this.updateEncounterBudget();
    }

    removeMonsterFromEncounter(monsterName) {
        this.currentEncounter.monsters = this.currentEncounter.monsters.filter(
            m => m.monster.name !== monsterName
        );
        this.updateEncounterDisplay();
        this.updateEncounterBudget();
    }

    updateMonsterQuantity(monsterName, change) {
        const monsterEntry = this.currentEncounter.monsters.find(m => m.monster.name === monsterName);
        if (monsterEntry) {
            monsterEntry.quantity += change;
            if (monsterEntry.quantity <= 0) {
                this.removeMonsterFromEncounter(monsterName);
            } else {
                this.updateEncounterDisplay();
                this.updateEncounterBudget();
            }
        }
    }

    updateEncounterDisplay() {
        const container = document.getElementById('encounter-monsters');
        container.innerHTML = '';

        if (this.currentEncounter.monsters.length === 0) {
            container.innerHTML = '<div class="empty-state">No monsters in encounter. Add some from the search results!</div>';
            return;
        }

        this.currentEncounter.monsters.forEach(entry => {
            const monsterElement = this.createEncounterMonsterElement(entry);
            container.appendChild(monsterElement);
        });
    }

    createEncounterMonsterElement(entry) {
        const element = document.createElement('div');
        element.className = 'encounter-monster';
        
        const crDisplay = this.formatChallengeRating(entry.monster.challengeRating);
        const xpValue = this.calculator.getXPForCR(entry.monster.challengeRating);
        const totalXP = xpValue * entry.quantity;

        element.innerHTML = `
            <div class="monster-info">
                <h5>${entry.monster.name}</h5>
                <div class="monster-stats">
                    <span>CR ${crDisplay}</span>
                    <span>${xpValue} XP each (${totalXP} total)</span>
                </div>
            </div>
            <div class="monster-controls">
                <div class="quantity-control">
                    <button class="quantity-btn" data-action="decrease">-</button>
                    <span class="quantity-display">${entry.quantity}</span>
                    <button class="quantity-btn" data-action="increase">+</button>
                </div>
                <button class="remove-monster-btn" data-action="remove">×</button>
            </div>
        `;

        // Bind events
        element.querySelector('[data-action="decrease"]').addEventListener('click', () => {
            this.updateMonsterQuantity(entry.monster.name, -1);
        });

        element.querySelector('[data-action="increase"]').addEventListener('click', () => {
            this.updateMonsterQuantity(entry.monster.name, 1);
        });

        element.querySelector('[data-action="remove"]').addEventListener('click', () => {
            this.removeMonsterFromEncounter(entry.monster.name);
        });

        return element;
    }

    formatChallengeRating(cr) {
        if (cr < 1) {
            return cr === 0.125 ? '1/8' : cr === 0.25 ? '1/4' : '1/2';
        }
        return cr.toString();
    }

    saveEncounter() {
        if (this.currentEncounter.monsters.length === 0) {
            alert('No monsters in encounter to save!');
            return;
        }

        const name = prompt('Enter a name for this encounter:');
        if (!name) return;

        const encounterData = {
            name: name.trim(),
            ...this.currentEncounter,
            createdAt: new Date().toISOString()
        };

        this.storageManager.saveEncounter(encounterData);
        alert('Encounter saved successfully!');
    }

    clearEncounter() {
        if (this.currentEncounter.monsters.length === 0) return;
        
        if (confirm('Are you sure you want to clear the current encounter?')) {
            this.currentEncounter.monsters = [];
            this.updateEncounterDisplay();
            this.updateEncounterBudget();
        }
    }

    exportEncounter() {
        if (this.currentEncounter.monsters.length === 0) {
            alert('No monsters in encounter to export!');
            return;
        }

        const encounterText = this.generateEncounterText();
        const blob = new Blob([encounterText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'encounter.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    generateEncounterText() {
        const budget = this.calculator.calculateXPBudget(
            this.currentEncounter.partySize,
            this.currentEncounter.partyLevel,
            this.currentEncounter.difficulty
        );
        const usedXP = this.calculator.calculateEncounterXP(this.currentEncounter.monsters);

        let text = `D&D Encounter\n`;
        text += `=============\n\n`;
        text += `Party: ${this.currentEncounter.partySize} level ${this.currentEncounter.partyLevel} characters\n`;
        text += `Difficulty: ${this.currentEncounter.difficulty.charAt(0).toUpperCase() + this.currentEncounter.difficulty.slice(1)}\n`;
        text += `XP Budget: ${budget} | Used: ${usedXP}\n\n`;
        text += `Monsters:\n`;
        text += `---------\n`;

        this.currentEncounter.monsters.forEach(entry => {
            const xpValue = this.calculator.getXPForCR(entry.monster.challengeRating);
            const crDisplay = this.formatChallengeRating(entry.monster.challengeRating);
            text += `${entry.quantity}x ${entry.monster.name} (CR ${crDisplay}, ${xpValue} XP each)\n`;
        });

        return text;
    }

    // Public method to load an encounter (used by SavedEncounters component)
    loadEncounter(encounterData) {
        this.currentEncounter = { ...encounterData };
        
        // Update UI controls
        document.getElementById('party-size').value = this.currentEncounter.partySize;
        document.getElementById('party-level').value = this.currentEncounter.partyLevel;
        document.getElementById('difficulty-select').value = this.currentEncounter.difficulty;
        
        this.updateEncounterDisplay();
        this.updateEncounterBudget();
        
        // Switch to encounter builder view
        document.querySelector('[data-view="encounter-builder"]')?.click();
    }
}