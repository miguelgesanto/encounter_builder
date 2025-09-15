// Main Application Entry Point
import { EncounterBuilder } from './components/EncounterBuilder.js';
import { Bestiary } from './components/Bestiary.js';
import { SavedEncounters } from './components/SavedEncounters.js';
import { NavigationManager } from './components/NavigationManager.js';
import { ModalManager } from './components/ModalManager.js';
import { StorageManager } from './utils/StorageManager.js';

class App {
    constructor() {
        this.encounterBuilder = null;
        this.bestiary = null;
        this.savedEncounters = null;
        this.navigationManager = null;
        this.modalManager = null;
        this.storageManager = new StorageManager();
    }

    async init() {
        try {
            // Initialize storage
            await this.storageManager.init();

            // Initialize modal manager
            this.modalManager = new ModalManager();
            this.modalManager.init();

            // Initialize navigation
            this.navigationManager = new NavigationManager();
            this.navigationManager.init();
            this.navigationManager.bindKeyboardNavigation();

            // Initialize components
            this.encounterBuilder = new EncounterBuilder(this.storageManager, this.modalManager);
            this.bestiary = new Bestiary(this.storageManager, this.modalManager);
            this.savedEncounters = new SavedEncounters(this.storageManager, this.modalManager);

            // Initialize all components
            await this.encounterBuilder.init();
            await this.bestiary.init();
            await this.savedEncounters.init();

            // Make app and managers globally available for debugging and cross-component access
            window.dndApp = this;
            window.encounterBuilder = this.encounterBuilder;
            window.storageManager = this.storageManager;
            window.modalManager = this.modalManager;

            // Bind global events
            this.bindGlobalEvents();
            
            console.log('D&D Encounter Builder initialized successfully');
        } catch (error) {
            console.error('Error initializing app:', error);
            this.showErrorMessage('Failed to initialize application. Please refresh the page.');
        }
    }

    bindGlobalEvents() {
        // Handle encounter loading from modals/other components
        document.addEventListener('loadEncounter', (e) => {
            if (this.encounterBuilder && e.detail) {
                this.encounterBuilder.loadEncounter(e.detail);
                this.navigationManager.goToEncounterBuilder();
            }
        });

        // Handle encounter loading from modal
        document.addEventListener('loadEncounterFromModal', (e) => {
            if (this.encounterBuilder && e.detail.encounterId) {
                const encounter = this.storageManager.getEncounter(e.detail.encounterId);
                if (encounter) {
                    this.encounterBuilder.loadEncounter(encounter);
                    this.navigationManager.goToEncounterBuilder();
                }
            }
        });

        // Handle encounter export from modal
        document.addEventListener('exportEncounterFromModal', (e) => {
            if (e.detail.encounterId) {
                const encounter = this.storageManager.getEncounter(e.detail.encounterId);
                if (encounter && this.savedEncounters) {
                    this.savedEncounters.exportEncounter(encounter);
                }
            }
        });

        // Handle storage events from other tabs/windows
        window.addEventListener('storage', (e) => {
            if (e.key === this.storageManager.storageKey) {
                this.handleStorageChange();
            }
        });

        // Handle visibility change to refresh data
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.handleVisibilityChange();
            }
        });

        // Handle beforeunload for unsaved changes warning
        window.addEventListener('beforeunload', (e) => {
            if (this.encounterBuilder && this.encounterBuilder.hasUnsavedChanges()) {
                e.preventDefault();
                e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
            }
        });
    }

    handleStorageChange() {
        try {
            // Reload storage data
            this.storageManager.loadData();
            
            // Refresh saved encounters if visible
            if (this.navigationManager.getCurrentView() === 'saved-encounters') {
                this.savedEncounters.loadEncounters();
                this.savedEncounters.displayEncounters();
            }
            
            console.log('Storage updated from external source');
        } catch (error) {
            console.error('Error handling storage change:', error);
        }
    }

    handleVisibilityChange() {
        try {
            // Check for storage updates when tab becomes visible
            this.storageManager.loadData();
            
            // Refresh current view if needed
            const currentView = this.navigationManager.getCurrentView();
            if (currentView === 'saved-encounters' && this.savedEncounters) {
                this.savedEncounters.loadEncounters();
                this.savedEncounters.displayEncounters();
            }
        } catch (error) {
            console.error('Error handling visibility change:', error);
        }
    }

    showErrorMessage(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message global-error';
        errorDiv.innerHTML = `
            <div class="error-content">
                <span class="error-icon">⚠️</span>
                <span class="error-text">${message}</span>
                <button class="error-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--error-color);
            color: var(--text-color);
            padding: 1rem;
            border-radius: var(--radius);
            z-index: 10000;
            box-shadow: var(--shadow);
            animation: slideIn 0.3s ease;
            max-width: 400px;
        `;
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => {
                    if (errorDiv.parentNode) {
                        errorDiv.parentNode.removeChild(errorDiv);
                    }
                }, 300);
            }
        }, 8000);
    }

    // Public methods for external use
    getComponent(componentName) {
        switch (componentName) {
            case 'encounterBuilder':
                return this.encounterBuilder;
            case 'bestiary':
                return this.bestiary;
            case 'savedEncounters':
                return this.savedEncounters;
            case 'navigationManager':
                return this.navigationManager;
            case 'modalManager':
                return this.modalManager;
            case 'storageManager':
                return this.storageManager;
            default:
                return null;
        }
    }

    // Development and debugging helpers
    getDiagnostics() {
        return {
            components: {
                encounterBuilder: !!this.encounterBuilder,
                bestiary: !!this.bestiary,
                savedEncounters: !!this.savedEncounters,
                navigationManager: !!this.navigationManager,
                modalManager: !!this.modalManager,
                storageManager: !!this.storageManager
            },
            currentView: this.navigationManager?.getCurrentView(),
            storageStats: this.storageManager?.getStorageStats(),
            timestamp: new Date().toISOString()
        };
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init();
});

// Export for potential external use
window.DnDApp = App;