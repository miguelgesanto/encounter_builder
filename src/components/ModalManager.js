// ModalManager - Handles modal dialogs for monster details, encounter details, etc.
export class ModalManager {
    constructor() {
        this.modals = {};
        this.currentModal = null;
        this.overlayElement = null;
    }

    init() {
        this.createModalOverlay();
        this.bindEvents();
        console.log('ModalManager initialized');
    }

    createModalOverlay() {
        // Create or get existing modal overlay
        this.overlayElement = document.getElementById('monster-modal') || this.createModalElement();
    }

    createModalElement() {
        const modal = document.createElement('div');
        modal.id = 'monster-modal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close" id="modal-close">&times;</span>
                <div id="modal-body"></div>
            </div>
        `;
        document.body.appendChild(modal);
        return modal;
    }

    bindEvents() {
        // Close modal events
        document.addEventListener('click', (e) => {
            // Close button
            if (e.target.id === 'modal-close' || e.target.classList.contains('close')) {
                this.closeModal();
            }
            // Click outside modal
            if (e.target.classList.contains('modal')) {
                this.closeModal();
            }
        });

        // Escape key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.currentModal) {
                this.closeModal();
            }
        });
    }

    showModal(content, modalClass = '') {
        if (!this.overlayElement) {
            this.createModalOverlay();
        }

        const modalBody = document.getElementById('modal-body');
        if (modalBody) {
            modalBody.innerHTML = content;
        }

        // Add custom class if provided
        if (modalClass) {
            this.overlayElement.classList.add(modalClass);
        }

        this.overlayElement.style.display = 'block';
        this.currentModal = 'generic';
        
        // Focus management for accessibility
        this.overlayElement.focus();
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    }

    showMonsterDetails(monster) {
        const content = this.generateMonsterDetailsHTML(monster);
        this.showModal(content, 'monster-details-modal');
        this.currentModal = 'monster-details';
    }

    showEncounterDetails(encounter) {
        const content = this.generateEncounterDetailsHTML(encounter);
        this.showModal(content, 'encounter-details-modal');
        this.currentModal = 'encounter-details';
    }

    closeModal() {
        if (this.overlayElement) {
            this.overlayElement.style.display = 'none';
            this.overlayElement.className = 'modal'; // Reset classes
        }
        
        this.currentModal = null;
        
        // Restore body scroll
        document.body.style.overflow = '';
    }

    generateMonsterDetailsHTML(monster) {
        const crDisplay = this.formatChallengeRating(monster.challengeRating);
        const xpValue = this.getXPForCR(monster.challengeRating);
        const proficiencyBonus = this.getProficiencyBonus(monster.challengeRating);

        return `
            <div class="monster-details">
                <h2>${monster.name}</h2>
                <div class="monster-basic-info">
                    <p><em>${monster.size} ${monster.type}, ${monster.alignment || 'Unaligned'}</em></p>
                </div>
                
                <div class="stat-block">
                    <div class="basic-stats">
                        <div><strong>Armor Class:</strong> ${monster.armorClass}</div>
                        <div><strong>Hit Points:</strong> ${monster.hitPoints}</div>
                        <div><strong>Speed:</strong> ${monster.speed}</div>
                        <div><strong>Challenge Rating:</strong> ${crDisplay} (${xpValue} XP)</div>
                        <div><strong>Proficiency Bonus:</strong> +${proficiencyBonus}</div>
                    </div>
                </div>

                ${this.generateAbilitiesHTML(monster.abilities)}
                ${this.generateSkillsHTML(monster)}
                ${this.generateResistancesHTML(monster)}
                ${this.generateSensesHTML(monster)}
                ${this.generateLanguagesHTML(monster)}
                ${this.generateActionsHTML(monster)}
                ${this.generateDescriptionHTML(monster)}
            </div>
        `;
    }

    generateAbilitiesHTML(abilities) {
        if (!abilities) return '';

        const abilityNames = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
        const abilityLabels = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];

        return `
            <div class="abilities-section">
                <h3>Ability Scores</h3>
                <div class="abilities">
                    ${abilityNames.map((ability, index) => {
                        const score = abilities[ability] || 10;
                        const modifier = Math.floor((score - 10) / 2);
                        const modifierStr = modifier >= 0 ? `+${modifier}` : `${modifier}`;
                        
                        return `
                            <div class="ability-score">
                                <div class="ability-name">${abilityLabels[index]}</div>
                                <div class="score">${score}</div>
                                <div class="modifier">(${modifierStr})</div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }

    generateSkillsHTML(monster) {
        if (!monster.skills && !monster.savingThrows) return '';

        let html = '<div class="skills-section">';
        
        if (monster.savingThrows) {
            html += `<div><strong>Saving Throws:</strong> ${monster.savingThrows}</div>`;
        }
        
        if (monster.skills) {
            html += `<div><strong>Skills:</strong> ${monster.skills}</div>`;
        }
        
        html += '</div>';
        return html;
    }

    generateResistancesHTML(monster) {
        if (!monster.damageResistances && !monster.damageImmunities && !monster.damageVulnerabilities && !monster.conditionImmunities) {
            return '';
        }

        let html = '<div class="resistances-section">';
        
        if (monster.damageVulnerabilities) {
            html += `<div><strong>Damage Vulnerabilities:</strong> ${monster.damageVulnerabilities}</div>`;
        }
        
        if (monster.damageResistances) {
            html += `<div><strong>Damage Resistances:</strong> ${monster.damageResistances}</div>`;
        }
        
        if (monster.damageImmunities) {
            html += `<div><strong>Damage Immunities:</strong> ${monster.damageImmunities}</div>`;
        }
        
        if (monster.conditionImmunities) {
            html += `<div><strong>Condition Immunities:</strong> ${monster.conditionImmunities}</div>`;
        }
        
        html += '</div>';
        return html;
    }

    generateSensesHTML(monster) {
        if (!monster.senses) return '';
        return `<div class="senses-section"><strong>Senses:</strong> ${monster.senses}</div>`;
    }

    generateLanguagesHTML(monster) {
        if (!monster.languages) return '';
        return `<div class="languages-section"><strong>Languages:</strong> ${monster.languages}</div>`;
    }

    generateActionsHTML(monster) {
        if (!monster.actions && !monster.specialAbilities) return '';

        let html = '<div class="actions-section"><h3>Actions & Abilities</h3>';
        
        if (monster.specialAbilities) {
            html += `<div class="special-abilities">
                <h4>Special Abilities</h4>
                <div>${monster.specialAbilities}</div>
            </div>`;
        }
        
        if (monster.actions) {
            html += `<div class="actions">
                <h4>Actions</h4>
                <div>${monster.actions}</div>
            </div>`;
        }
        
        html += '</div>';
        return html;
    }

    generateDescriptionHTML(monster) {
        if (!monster.description) return '';
        return `<div class="description-section">
            <h3>Description</h3>
            <p>${monster.description}</p>
        </div>`;
    }

    generateEncounterDetailsHTML(encounter) {
        const totalMonsters = encounter.monsters.reduce((sum, entry) => sum + entry.quantity, 0);
        const createdDate = new Date(encounter.savedAt || encounter.createdAt).toLocaleString();
        
        // Calculate encounter XP
        const baseXP = encounter.monsters.reduce((total, entry) => {
            return total + (this.getXPForCR(entry.monster.challengeRating) * entry.quantity);
        }, 0);

        return `
            <div class="encounter-details">
                <h2>${encounter.name}</h2>
                
                <div class="encounter-summary">
                    <div class="party-details">
                        <h3>Party Configuration</h3>
                        <div><strong>Party Size:</strong> ${encounter.partySize}</div>
                        <div><strong>Average Level:</strong> ${encounter.partyLevel}</div>
                        <div><strong>Difficulty:</strong> ${encounter.difficulty}</div>
                    </div>
                    
                    <div class="encounter-stats">
                        <h3>Encounter Statistics</h3>
                        <div><strong>Total Monsters:</strong> ${totalMonsters}</div>
                        <div><strong>Base XP:</strong> ${baseXP}</div>
                        <div><strong>Created:</strong> ${createdDate}</div>
                    </div>
                </div>

                <div class="monster-list-detailed">
                    <h3>Monsters in Encounter</h3>
                    ${encounter.monsters.map(entry => {
                        const xp = this.getXPForCR(entry.monster.challengeRating);
                        const totalXP = xp * entry.quantity;
                        const crDisplay = this.formatChallengeRating(entry.monster.challengeRating);
                        
                        return `
                            <div class="encounter-monster-detail">
                                <div class="monster-header">
                                    <h4>${entry.quantity}x ${entry.monster.name}</h4>
                                    <span class="monster-cr">CR ${crDisplay}</span>
                                </div>
                                <div class="monster-stats-grid">
                                    <div><strong>AC:</strong> ${entry.monster.armorClass}</div>
                                    <div><strong>HP:</strong> ${entry.monster.hitPoints}</div>
                                    <div><strong>XP:</strong> ${xp} each (${totalXP} total)</div>
                                    <div><strong>Type:</strong> ${entry.monster.size} ${entry.monster.type}</div>
                                </div>
                                ${entry.monster.description ? `<div class="monster-description">${entry.monster.description}</div>` : ''}
                            </div>
                        `;
                    }).join('')}
                </div>

                <div class="encounter-actions">
                    <button class="btn-primary" onclick="window.modalManager.loadEncounterFromModal('${encounter.id}')">
                        Load in Builder
                    </button>
                    <button class="btn-secondary" onclick="window.modalManager.exportEncounterFromModal('${encounter.id}')">
                        Export Encounter
                    </button>
                </div>
            </div>
        `;
    }

    // Helper methods
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

    getProficiencyBonus(challengeRating) {
        if (challengeRating <= 4) return 2;
        if (challengeRating <= 8) return 3;
        if (challengeRating <= 12) return 4;
        if (challengeRating <= 16) return 5;
        if (challengeRating <= 20) return 6;
        if (challengeRating <= 24) return 7;
        if (challengeRating <= 28) return 8;
        return 9;
    }

    // Modal action handlers (called from modal content)
    loadEncounterFromModal(encounterId) {
        document.dispatchEvent(new CustomEvent('loadEncounterFromModal', { 
            detail: { encounterId } 
        }));
        this.closeModal();
    }

    exportEncounterFromModal(encounterId) {
        document.dispatchEvent(new CustomEvent('exportEncounterFromModal', { 
            detail: { encounterId } 
        }));
    }

    // Custom modal types
    showConfirmDialog(message, onConfirm, onCancel) {
        const content = `
            <div class="confirm-dialog">
                <h3>Confirm Action</h3>
                <p>${message}</p>
                <div class="dialog-actions">
                    <button class="btn-primary" id="confirm-yes">Yes</button>
                    <button class="btn-secondary" id="confirm-no">No</button>
                </div>
            </div>
        `;
        
        this.showModal(content, 'confirm-dialog-modal');
        
        document.getElementById('confirm-yes').addEventListener('click', () => {
            if (onConfirm) onConfirm();
            this.closeModal();
        });
        
        document.getElementById('confirm-no').addEventListener('click', () => {
            if (onCancel) onCancel();
            this.closeModal();
        });
    }

    showImageModal(imageSrc, altText = '') {
        const content = `
            <div class="image-modal">
                <img src="${imageSrc}" alt="${altText}" style="max-width: 100%; max-height: 80vh;">
                ${altText ? `<p class="image-caption">${altText}</p>` : ''}
            </div>
        `;
        this.showModal(content, 'image-modal');
    }

    showLoadingModal(message = 'Loading...') {
        const content = `
            <div class="loading-modal">
                <div class="loading-spinner"></div>
                <p>${message}</p>
            </div>
        `;
        this.showModal(content, 'loading-modal');
    }

    // Utility to check if modal is open
    isModalOpen() {
        return this.currentModal !== null;
    }

    getCurrentModal() {
        return this.currentModal;
    }
}

// Make modal manager globally available for modal content callbacks
window.modalManager = new ModalManager();