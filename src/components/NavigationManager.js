// NavigationManager - Handles navigation between different views/tabs
export class NavigationManager {
    constructor() {
        this.currentView = 'encounter-builder';
        this.views = {
            'encounter-builder': 'encounter-tab',
            'bestiary': 'bestiary-tab',
            'saved-encounters': 'saved-tab'
        };
    }

    init() {
        this.bindEvents();
        this.setActiveView(this.currentView);
        console.log('NavigationManager initialized');
    }

    bindEvents() {
        // Bind navigation tab clicks
        Object.entries(this.views).forEach(([viewId, tabId]) => {
            const tabElement = document.getElementById(tabId);
            if (tabElement) {
                tabElement.addEventListener('click', () => {
                    this.navigateToView(viewId);
                });
            }
        });

        // Handle browser back/forward buttons
        window.addEventListener('popstate', (event) => {
            if (event.state && event.state.view) {
                this.setActiveView(event.state.view, false);
            }
        });

        // Set initial history state
        history.replaceState({ view: this.currentView }, '', `#${this.currentView}`);
    }

    navigateToView(viewId) {
        if (this.views[viewId]) {
            this.setActiveView(viewId, true);
        } else {
            console.warn(`Unknown view: ${viewId}`);
        }
    }

    setActiveView(viewId, pushState = true) {
        if (!this.views[viewId]) {
            console.warn(`Cannot set active view: ${viewId} does not exist`);
            return;
        }

        const previousView = this.currentView;
        this.currentView = viewId;

        // Update URL and history
        if (pushState) {
            history.pushState({ view: viewId }, '', `#${viewId}`);
        }

        // Update view visibility
        this.updateViewVisibility();

        // Update tab states
        this.updateTabStates();

        // Trigger view change event
        this.triggerViewChangeEvent(viewId, previousView);

        console.log(`Navigated to view: ${viewId}`);
    }

    updateViewVisibility() {
        // Hide all views
        Object.keys(this.views).forEach(viewId => {
            const viewElement = document.getElementById(viewId);
            if (viewElement) {
                viewElement.classList.remove('active');
            }
        });

        // Show current view
        const currentViewElement = document.getElementById(this.currentView);
        if (currentViewElement) {
            currentViewElement.classList.add('active');
        }
    }

    updateTabStates() {
        // Remove active state from all tabs
        Object.values(this.views).forEach(tabId => {
            const tabElement = document.getElementById(tabId);
            if (tabElement) {
                tabElement.classList.remove('active');
            }
        });

        // Add active state to current tab
        const currentTabId = this.views[this.currentView];
        const currentTabElement = document.getElementById(currentTabId);
        if (currentTabElement) {
            currentTabElement.classList.add('active');
        }
    }

    triggerViewChangeEvent(newView, previousView) {
        const event = new CustomEvent('viewChanged', {
            detail: {
                newView: newView,
                previousView: previousView,
                timestamp: Date.now()
            }
        });
        document.dispatchEvent(event);
    }

    getCurrentView() {
        return this.currentView;
    }

    // Get view from URL hash
    getViewFromHash() {
        const hash = window.location.hash.replace('#', '');
        return this.views[hash] ? hash : null;
    }

    // Initialize from URL hash
    initFromHash() {
        const hashView = this.getViewFromHash();
        if (hashView) {
            this.setActiveView(hashView, false);
        }
    }

    // Add new view (for extensibility)
    addView(viewId, tabId) {
        if (this.views[viewId]) {
            console.warn(`View ${viewId} already exists`);
            return false;
        }

        this.views[viewId] = tabId;
        
        // Bind event to new tab
        const tabElement = document.getElementById(tabId);
        if (tabElement) {
            tabElement.addEventListener('click', () => {
                this.navigateToView(viewId);
            });
        }

        console.log(`Added new view: ${viewId} -> ${tabId}`);
        return true;
    }

    // Remove view (for extensibility)
    removeView(viewId) {
        if (!this.views[viewId]) {
            console.warn(`View ${viewId} does not exist`);
            return false;
        }

        // If removing current view, navigate to default
        if (this.currentView === viewId) {
            this.navigateToView('encounter-builder');
        }

        delete this.views[viewId];
        console.log(`Removed view: ${viewId}`);
        return true;
    }

    // Navigation shortcuts
    goToEncounterBuilder() {
        this.navigateToView('encounter-builder');
    }

    goToBestiary() {
        this.navigateToView('bestiary');
    }

    goToSavedEncounters() {
        this.navigateToView('saved-encounters');
    }

    // Check if view exists
    hasView(viewId) {
        return !!this.views[viewId];
    }

    // Get all available views
    getViews() {
        return { ...this.views };
    }

    // View state management for complex interactions
    setViewState(viewId, state) {
        if (!this.viewStates) {
            this.viewStates = {};
        }
        this.viewStates[viewId] = state;
    }

    getViewState(viewId) {
        return this.viewStates ? this.viewStates[viewId] : null;
    }

    // Breadcrumb navigation support
    getBreadcrumbs() {
        const breadcrumbs = [];
        const viewNames = {
            'encounter-builder': 'Encounter Builder',
            'bestiary': 'Bestiary',
            'saved-encounters': 'Saved Encounters'
        };

        breadcrumbs.push({
            name: viewNames[this.currentView] || this.currentView,
            viewId: this.currentView,
            active: true
        });

        return breadcrumbs;
    }

    // Navigation guard system (for future expansion)
    addNavigationGuard(guard) {
        if (!this.navigationGuards) {
            this.navigationGuards = [];
        }
        this.navigationGuards.push(guard);
    }

    async checkNavigationGuards(fromView, toView) {
        if (!this.navigationGuards) return true;

        for (const guard of this.navigationGuards) {
            const result = await guard(fromView, toView);
            if (!result) {
                return false;
            }
        }
        return true;
    }

    // Enhanced navigation with guards
    async navigateToViewWithGuards(viewId) {
        const canNavigate = await this.checkNavigationGuards(this.currentView, viewId);
        if (canNavigate) {
            this.navigateToView(viewId);
        } else {
            console.log(`Navigation to ${viewId} blocked by guard`);
        }
    }

    // Keyboard navigation support
    bindKeyboardNavigation() {
        document.addEventListener('keydown', (event) => {
            // Alt + 1, 2, 3 for quick navigation
            if (event.altKey && !event.ctrlKey && !event.shiftKey) {
                switch (event.key) {
                    case '1':
                        this.goToEncounterBuilder();
                        event.preventDefault();
                        break;
                    case '2':
                        this.goToBestiary();
                        event.preventDefault();
                        break;
                    case '3':
                        this.goToSavedEncounters();
                        event.preventDefault();
                        break;
                }
            }
        });
    }

    // Analytics/tracking support
    trackViewChange(viewId, previousView) {
        // Placeholder for analytics integration
        console.log(`View change tracked: ${previousView} -> ${viewId}`);
        
        // Could integrate with analytics services here
        if (window.gtag) {
            window.gtag('event', 'page_view', {
                page_title: viewId,
                page_location: window.location.href
            });
        }
    }
}