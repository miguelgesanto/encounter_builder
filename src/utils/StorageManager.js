// StorageManager - Handles local storage operations for saved encounters and app data
export class StorageManager {
    constructor() {
        this.storageKey = 'dnd_encounter_builder';
        this.data = {
            encounters: [],
            settings: {
                theme: 'dark',
                autoSave: true,
                lastPartyConfig: {
                    size: 4,
                    level: 3,
                    difficulty: 'medium'
                }
            }
        };
    }

    async init() {
        try {
            this.loadData();
            console.log('StorageManager initialized');
        } catch (error) {
            console.error('Error initializing StorageManager:', error);
            // Initialize with default data if loading fails
            this.saveData();
        }
    }

    loadData() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                const parsedData = JSON.parse(stored);
                this.data = { ...this.data, ...parsedData };
            }
        } catch (error) {
            console.error('Error loading data from localStorage:', error);
            throw new Error('Failed to load saved data');
        }
    }

    saveData() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.data));
        } catch (error) {
            console.error('Error saving data to localStorage:', error);
            throw new Error('Failed to save data');
        }
    }

    // Encounter management
    saveEncounter(encounter) {
        try {
            const encounterWithId = {
                ...encounter,
                id: this.generateId(),
                savedAt: new Date().toISOString()
            };

            this.data.encounters.push(encounterWithId);
            this.saveData();
            
            console.log(`Saved encounter: ${encounter.name}`);
            return encounterWithId.id;
        } catch (error) {
            console.error('Error saving encounter:', error);
            throw new Error('Failed to save encounter');
        }
    }

    getEncounters() {
        return [...this.data.encounters];
    }

    getEncounter(id) {
        return this.data.encounters.find(encounter => encounter.id === id);
    }

    updateEncounter(id, updatedEncounter) {
        try {
            const index = this.data.encounters.findIndex(encounter => encounter.id === id);
            if (index === -1) {
                throw new Error('Encounter not found');
            }

            this.data.encounters[index] = {
                ...this.data.encounters[index],
                ...updatedEncounter,
                updatedAt: new Date().toISOString()
            };

            this.saveData();
            console.log(`Updated encounter: ${id}`);
        } catch (error) {
            console.error('Error updating encounter:', error);
            throw new Error('Failed to update encounter');
        }
    }

    deleteEncounter(id) {
        try {
            const index = this.data.encounters.findIndex(encounter => encounter.id === id);
            if (index === -1) {
                throw new Error('Encounter not found');
            }

            const deleted = this.data.encounters.splice(index, 1)[0];
            this.saveData();
            
            console.log(`Deleted encounter: ${deleted.name}`);
            return deleted;
        } catch (error) {
            console.error('Error deleting encounter:', error);
            throw new Error('Failed to delete encounter');
        }
    }

    duplicateEncounter(id) {
        try {
            const original = this.getEncounter(id);
            if (!original) {
                throw new Error('Encounter not found');
            }

            const duplicate = {
                ...original,
                id: this.generateId(),
                name: `${original.name} (Copy)`,
                createdAt: new Date().toISOString(),
                savedAt: new Date().toISOString()
            };

            delete duplicate.updatedAt;
            this.data.encounters.push(duplicate);
            this.saveData();

            console.log(`Duplicated encounter: ${original.name}`);
            return duplicate;
        } catch (error) {
            console.error('Error duplicating encounter:', error);
            throw new Error('Failed to duplicate encounter');
        }
    }

    // Settings management
    getSetting(key) {
        return this.data.settings[key];
    }

    setSetting(key, value) {
        try {
            this.data.settings[key] = value;
            this.saveData();
            console.log(`Updated setting: ${key} = ${value}`);
        } catch (error) {
            console.error('Error saving setting:', error);
            throw new Error('Failed to save setting');
        }
    }

    getSettings() {
        return { ...this.data.settings };
    }

    updateSettings(newSettings) {
        try {
            this.data.settings = { ...this.data.settings, ...newSettings };
            this.saveData();
            console.log('Updated settings');
        } catch (error) {
            console.error('Error updating settings:', error);
            throw new Error('Failed to update settings');
        }
    }

    // Party configuration shortcuts
    saveLastPartyConfig(config) {
        this.setSetting('lastPartyConfig', config);
    }

    getLastPartyConfig() {
        return this.getSetting('lastPartyConfig');
    }

    // Export/Import functionality
    exportData() {
        try {
            const exportData = {
                ...this.data,
                exportedAt: new Date().toISOString(),
                version: '1.0'
            };

            const dataStr = JSON.stringify(exportData, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = `dnd_encounters_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            console.log('Data exported successfully');
        } catch (error) {
            console.error('Error exporting data:', error);
            throw new Error('Failed to export data');
        }
    }

    async importData(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const importData = JSON.parse(e.target.result);
                    
                    // Validate import data structure
                    if (!importData.encounters || !Array.isArray(importData.encounters)) {
                        throw new Error('Invalid import data: missing encounters array');
                    }

                    // Merge encounters (avoiding duplicates by name and creation date)
                    const existingNames = new Set(this.data.encounters.map(e => `${e.name}_${e.createdAt}`));
                    const newEncounters = importData.encounters.filter(encounter => {
                        const key = `${encounter.name}_${encounter.createdAt}`;
                        return !existingNames.has(key);
                    });

                    // Assign new IDs to imported encounters
                    newEncounters.forEach(encounter => {
                        encounter.id = this.generateId();
                        encounter.importedAt = new Date().toISOString();
                    });

                    this.data.encounters.push(...newEncounters);

                    // Merge settings if present
                    if (importData.settings) {
                        this.data.settings = { ...this.data.settings, ...importData.settings };
                    }

                    this.saveData();
                    
                    console.log(`Imported ${newEncounters.length} new encounters`);
                    resolve({
                        imported: newEncounters.length,
                        total: importData.encounters.length,
                        skipped: importData.encounters.length - newEncounters.length
                    });
                } catch (error) {
                    console.error('Error importing data:', error);
                    reject(new Error('Failed to import data: ' + error.message));
                }
            };

            reader.onerror = () => {
                reject(new Error('Failed to read import file'));
            };

            reader.readAsText(file);
        });
    }

    // Search and filter encounters
    searchEncounters(query) {
        if (!query.trim()) {
            return this.getEncounters();
        }

        const searchTerm = query.toLowerCase();
        return this.data.encounters.filter(encounter => {
            return encounter.name.toLowerCase().includes(searchTerm) ||
                   encounter.monsters.some(entry => 
                       entry.monster.name.toLowerCase().includes(searchTerm)
                   );
        });
    }

    getEncountersByDifficulty(difficulty) {
        return this.data.encounters.filter(encounter => encounter.difficulty === difficulty);
    }

    getEncountersByPartyLevel(minLevel, maxLevel) {
        return this.data.encounters.filter(encounter => {
            const level = encounter.partyLevel;
            return level >= minLevel && level <= maxLevel;
        });
    }

    // Statistics
    getStorageStats() {
        const dataSize = new Blob([JSON.stringify(this.data)]).size;
        const maxSize = 5 * 1024 * 1024; // 5MB typical localStorage limit
        
        return {
            encounterCount: this.data.encounters.length,
            dataSize: dataSize,
            maxSize: maxSize,
            usagePercentage: (dataSize / maxSize) * 100,
            formattedSize: this.formatBytes(dataSize)
        };
    }

    // Cleanup operations
    clearAllData() {
        try {
            if (confirm('Are you sure you want to clear all saved data? This cannot be undone!')) {
                localStorage.removeItem(this.storageKey);
                this.data = {
                    encounters: [],
                    settings: {
                        theme: 'dark',
                        autoSave: true,
                        lastPartyConfig: {
                            size: 4,
                            level: 3,
                            difficulty: 'medium'
                        }
                    }
                };
                console.log('All data cleared');
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error clearing data:', error);
            throw new Error('Failed to clear data');
        }
    }

    cleanupOldEncounters(daysOld = 90) {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysOld);

            const initialCount = this.data.encounters.length;
            this.data.encounters = this.data.encounters.filter(encounter => {
                const encounterDate = new Date(encounter.createdAt || encounter.savedAt);
                return encounterDate > cutoffDate;
            });

            const removedCount = initialCount - this.data.encounters.length;
            if (removedCount > 0) {
                this.saveData();
                console.log(`Cleaned up ${removedCount} old encounters`);
            }

            return removedCount;
        } catch (error) {
            console.error('Error cleaning up old encounters:', error);
            throw new Error('Failed to cleanup old encounters');
        }
    }

    // Utility methods
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Backup and restore
    createBackup() {
        try {
            const backup = {
                ...this.data,
                backupCreatedAt: new Date().toISOString(),
                version: '1.0'
            };
            
            const backupKey = `${this.storageKey}_backup_${Date.now()}`;
            localStorage.setItem(backupKey, JSON.stringify(backup));
            
            console.log('Backup created:', backupKey);
            return backupKey;
        } catch (error) {
            console.error('Error creating backup:', error);
            throw new Error('Failed to create backup');
        }
    }

    restoreFromBackup(backupKey) {
        try {
            const backup = localStorage.getItem(backupKey);
            if (!backup) {
                throw new Error('Backup not found');
            }

            const backupData = JSON.parse(backup);
            this.data = {
                encounters: backupData.encounters || [],
                settings: { ...this.data.settings, ...backupData.settings }
            };

            this.saveData();
            console.log('Data restored from backup:', backupKey);
        } catch (error) {
            console.error('Error restoring backup:', error);
            throw new Error('Failed to restore from backup');
        }
    }
}