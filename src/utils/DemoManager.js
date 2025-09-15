// Demo and Tutorial utilities for the D&D Encounter Builder
export class DemoManager {
    constructor(app) {
        this.app = app;
        this.demoData = {
            encounters: [
                {
                    name: "Goblin Ambush",
                    partySize: 4,
                    partyLevel: 2,
                    difficulty: "medium",
                    monsters: [
                        { monster: "Goblin", quantity: 3 },
                        { monster: "Hobgoblin", quantity: 1 }
                    ],
                    description: "A classic low-level encounter with goblins and their leader."
                },
                {
                    name: "Giant's Lair",
                    partySize: 4,
                    partyLevel: 8,
                    difficulty: "hard",
                    monsters: [
                        { monster: "Stone Giant", quantity: 1 },
                        { monster: "Dire Wolf", quantity: 2 }
                    ],
                    description: "A challenging encounter with a stone giant and his wolf companions."
                },
                {
                    name: "Dragon's Hoard",
                    partySize: 4,
                    partyLevel: 10,
                    difficulty: "deadly",
                    monsters: [
                        { monster: "Young Red Dragon", quantity: 1 }
                    ],
                    description: "Face off against a young red dragon in its treasure-filled lair."
                }
            ],
            tips: [
                "Use the party configuration to set your group's size and level",
                "Search for monsters by name or filter by Challenge Rating",
                "The XP budget automatically updates as you add monsters",
                "Save encounters for easy reuse in future sessions",
                "Export encounters to share with other DMs"
            ]
        };
    }

    async loadDemoEncounters() {
        try {
            for (const encounterData of this.demoData.encounters) {
                // Convert monster names to actual monster objects
                const resolvedMonsters = await this.resolveMonsterNames(encounterData.monsters);
                
                const encounter = {
                    ...encounterData,
                    monsters: resolvedMonsters,
                    id: `demo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    createdAt: new Date().toISOString(),
                    savedAt: new Date().toISOString(),
                    isDemo: true
                };

                this.app.storageManager.saveEncounter(encounter);
            }
            
            console.log('Demo encounters loaded successfully');
            return true;
        } catch (error) {
            console.error('Error loading demo encounters:', error);
            return false;
        }
    }

    async resolveMonsterNames(monsterEntries) {
        const monsterDb = this.app.encounterBuilder.monsterDb;
        const resolved = [];

        for (const entry of monsterEntries) {
            const monster = monsterDb.getMonsterByName(entry.monster);
            if (monster) {
                resolved.push({
                    monster: monster,
                    quantity: entry.quantity
                });
            } else {
                console.warn(`Monster not found: ${entry.monster}`);
            }
        }

        return resolved;
    }

    showTutorial() {
        const tutorialSteps = [
            {
                target: '#party-size',
                title: 'Set Party Size',
                content: 'Start by configuring your party. Set the number of players and their average level.'
            },
            {
                target: '#monster-search',
                title: 'Search Monsters',
                content: 'Use the search box to find monsters by name, or use the filters to browse by Challenge Rating and type.'
            },
            {
                target: '#xp-budget',
                title: 'XP Budget',
                content: 'This shows your encounter\'s XP budget. Green means you\'re within budget, red means you\'ve exceeded it.'
            },
            {
                target: '#encounter-monsters',
                title: 'Build Your Encounter',
                content: 'Monsters you add will appear here. Use the +/- buttons to adjust quantities.'
            },
            {
                target: '#save-encounter',
                title: 'Save Your Work',
                content: 'Don\'t forget to save your encounter! You can access saved encounters from the Saved tab.'
            }
        ];

        this.showTutorialStep(tutorialSteps, 0);
    }

    showTutorialStep(steps, currentStep) {
        if (currentStep >= steps.length) {
            this.hideTutorialOverlay();
            return;
        }

        const step = steps[currentStep];
        const target = document.querySelector(step.target);
        
        if (!target) {
            console.warn(`Tutorial target not found: ${step.target}`);
            this.showTutorialStep(steps, currentStep + 1);
            return;
        }

        this.createTutorialOverlay(target, step, () => {
            this.showTutorialStep(steps, currentStep + 1);
        });
    }

    createTutorialOverlay(target, step, onNext) {
        // Remove existing overlay
        this.hideTutorialOverlay();

        // Create overlay
        const overlay = document.createElement('div');
        overlay.id = 'tutorial-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            z-index: 10000;
            pointer-events: auto;
        `;

        // Create spotlight
        const rect = target.getBoundingClientRect();
        const spotlight = document.createElement('div');
        spotlight.style.cssText = `
            position: absolute;
            top: ${rect.top - 10}px;
            left: ${rect.left - 10}px;
            width: ${rect.width + 20}px;
            height: ${rect.height + 20}px;
            border: 2px solid var(--secondary-color);
            border-radius: var(--radius);
            background: transparent;
            box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.7);
            pointer-events: none;
        `;

        // Create tooltip
        const tooltip = document.createElement('div');
        tooltip.style.cssText = `
            position: absolute;
            top: ${rect.bottom + 20}px;
            left: ${rect.left}px;
            max-width: 300px;
            background: var(--surface-color);
            border: 2px solid var(--border-color);
            border-radius: var(--radius);
            padding: 1rem;
            color: var(--text-color);
            box-shadow: var(--shadow);
            z-index: 10001;
        `;

        tooltip.innerHTML = `
            <h4 style="color: var(--secondary-color); margin-bottom: 0.5rem;">${step.title}</h4>
            <p style="margin-bottom: 1rem;">${step.content}</p>
            <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
                <button id="tutorial-skip" class="btn-secondary" style="padding: 0.5rem 1rem;">Skip Tutorial</button>
                <button id="tutorial-next" class="btn-primary" style="padding: 0.5rem 1rem;">Next</button>
            </div>
        `;

        // Adjust tooltip position if it goes off screen
        if (rect.left + 300 > window.innerWidth) {
            tooltip.style.left = `${window.innerWidth - 320}px`;
        }
        if (rect.bottom + 200 > window.innerHeight) {
            tooltip.style.top = `${rect.top - 200}px`;
        }

        overlay.appendChild(spotlight);
        overlay.appendChild(tooltip);
        document.body.appendChild(overlay);

        // Bind events
        document.getElementById('tutorial-next').addEventListener('click', () => {
            this.hideTutorialOverlay();
            onNext();
        });

        document.getElementById('tutorial-skip').addEventListener('click', () => {
            this.hideTutorialOverlay();
        });

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                this.hideTutorialOverlay();
            }
        });
    }

    hideTutorialOverlay() {
        const overlay = document.getElementById('tutorial-overlay');
        if (overlay) {
            overlay.remove();
        }
    }

    showRandomEncounterGenerator() {
        const modal = this.app.modalManager;
        const content = `
            <div class="random-encounter-generator">
                <h2>Random Encounter Generator</h2>
                <div class="generator-form">
                    <div class="form-row">
                        <label>
                            Party Size:
                            <input type="number" id="random-party-size" min="1" max="8" value="4">
                        </label>
                        <label>
                            Party Level:
                            <input type="number" id="random-party-level" min="1" max="20" value="5">
                        </label>
                    </div>
                    <div class="form-row">
                        <label>
                            Difficulty:
                            <select id="random-difficulty">
                                <option value="easy">Easy</option>
                                <option value="medium" selected>Medium</option>
                                <option value="hard">Hard</option>
                                <option value="deadly">Deadly</option>
                            </select>
                        </label>
                        <label>
                            Environment:
                            <select id="random-environment">
                                <option value="any">Any</option>
                                <option value="dungeon">Dungeon</option>
                                <option value="forest">Forest</option>
                                <option value="mountains">Mountains</option>
                                <option value="urban">Urban</option>
                            </select>
                        </label>
                    </div>
                    <button id="generate-encounter" class="btn-primary">Generate Encounter</button>
                </div>
                <div id="generated-encounter" style="margin-top: 1rem;"></div>
            </div>
        `;

        modal.showModal(content, 'random-encounter-modal');

        document.getElementById('generate-encounter').addEventListener('click', () => {
            this.generateRandomEncounter();
        });
    }

    generateRandomEncounter() {
        const partySize = parseInt(document.getElementById('random-party-size').value);
        const partyLevel = parseInt(document.getElementById('random-party-level').value);
        const difficulty = document.getElementById('random-difficulty').value;
        const environment = document.getElementById('random-environment').value;

        const calculator = this.app.encounterBuilder.calculator;
        const monsterDb = this.app.encounterBuilder.monsterDb;

        const xpBudget = calculator.calculateXPBudget(partySize, partyLevel, difficulty);
        
        // Get appropriate monsters for the party level
        const availableMonsters = monsterDb.getMonsters().filter(monster => {
            const cr = monster.challengeRating;
            const minCR = Math.max(0, partyLevel - 4);
            const maxCR = partyLevel + 2;
            return cr >= minCR && cr <= maxCR;
        });

        if (availableMonsters.length === 0) {
            document.getElementById('generated-encounter').innerHTML = 
                '<div class="error-message">No suitable monsters found for this party level.</div>';
            return;
        }

        // Generate encounter suggestions
        const suggestions = calculator.suggestMonstersForBudget(availableMonsters, xpBudget, 6);
        
        if (suggestions.length === 0) {
            document.getElementById('generated-encounter').innerHTML = 
                '<div class="error-message">Could not generate a balanced encounter with available monsters.</div>';
            return;
        }

        // Pick a random suggestion
        const selectedEncounter = suggestions[Math.floor(Math.random() * Math.min(5, suggestions.length))];
        
        const encounterHTML = `
            <div class="generated-encounter-result">
                <h3>Generated Encounter</h3>
                <div class="encounter-info">
                    <div><strong>XP Budget:</strong> ${xpBudget}</div>
                    <div><strong>Encounter XP:</strong> ${selectedEncounter.adjustedXP}</div>
                    <div><strong>Difficulty:</strong> ${calculator.evaluateEncounterDifficulty(selectedEncounter.monsters, partySize, partyLevel)}</div>
                </div>
                <div class="monster-list">
                    ${selectedEncounter.monsters.map(entry => `
                        <div class="monster-entry">
                            <strong>${entry.quantity}x ${entry.monster.name}</strong> 
                            (CR ${this.formatCR(entry.monster.challengeRating)})
                        </div>
                    `).join('')}
                </div>
                <div class="encounter-actions">
                    <button id="load-generated" class="btn-primary">Load in Builder</button>
                    <button id="regenerate" class="btn-secondary">Generate Another</button>
                </div>
            </div>
        `;

        document.getElementById('generated-encounter').innerHTML = encounterHTML;

        document.getElementById('load-generated').addEventListener('click', () => {
            this.loadGeneratedEncounter(selectedEncounter, partySize, partyLevel, difficulty);
        });

        document.getElementById('regenerate').addEventListener('click', () => {
            this.generateRandomEncounter();
        });
    }

    loadGeneratedEncounter(encounter, partySize, partyLevel, difficulty) {
        const encounterData = {
            name: `Random ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Encounter`,
            monsters: encounter.monsters,
            partySize: partySize,
            partyLevel: partyLevel,
            difficulty: difficulty
        };

        this.app.encounterBuilder.loadEncounter(encounterData);
        this.app.navigationManager.goToEncounterBuilder();
        this.app.modalManager.closeModal();
    }

    formatCR(cr) {
        if (cr < 1) {
            return cr === 0.125 ? '1/8' : cr === 0.25 ? '1/4' : '1/2';
        }
        return cr.toString();
    }

    addDemoButton() {
        const header = document.querySelector('.app-header');
        if (!header || document.getElementById('demo-controls')) return;

        const demoControls = document.createElement('div');
        demoControls.id = 'demo-controls';
        demoControls.style.cssText = `
            margin-top: 1rem;
            display: flex;
            gap: 0.5rem;
            flex-wrap: wrap;
        `;

        demoControls.innerHTML = `
            <button id="load-demo-btn" class="btn-secondary" style="font-size: 0.9rem; padding: 0.5rem 1rem;">
                Load Demo Encounters
            </button>
            <button id="tutorial-btn" class="btn-secondary" style="font-size: 0.9rem; padding: 0.5rem 1rem;">
                Show Tutorial
            </button>
            <button id="random-encounter-btn" class="btn-secondary" style="font-size: 0.9rem; padding: 0.5rem 1rem;">
                Random Encounter
            </button>
        `;

        header.appendChild(demoControls);

        // Bind events
        document.getElementById('load-demo-btn').addEventListener('click', async () => {
            const success = await this.loadDemoEncounters();
            if (success) {
                alert('Demo encounters loaded! Check the Saved Encounters tab.');
            } else {
                alert('Failed to load demo encounters.');
            }
        });

        document.getElementById('tutorial-btn').addEventListener('click', () => {
            this.showTutorial();
        });

        document.getElementById('random-encounter-btn').addEventListener('click', () => {
            this.showRandomEncounterGenerator();
        });
    }
}

// Export for use in main app
export default DemoManager;