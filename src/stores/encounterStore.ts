// Zustand store for D&D Encounter Builder & Initiative Tracker
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { 
  AppState, 
  Encounter, 
  Combatant, 
  Creature, 
  Condition, 
  SavedEncounter,
  DifficultyLevel 
} from '../types';

interface EncounterStore extends AppState {
  // Initiative Tracker Actions
  createEncounter: (name: string, partySize: number, partyLevel: number, difficulty: DifficultyLevel) => void;
  setActiveEncounter: (encounterId: string) => void;
  addCombatant: (creature: Creature, isPC?: boolean, level?: number) => void;
  removeCombatant: (combatantId: string) => void;
  updateCombatant: (combatantId: string, updates: Partial<Combatant>) => void;
  rollInitiative: (combatantId: string) => void;
  rollAllInitiative: () => void;
  sortByInitiative: () => void;
  nextTurn: () => void;
  previousTurn: () => void;
  nextRound: () => void;
  resetEncounter: () => void;
  
  // Condition Management
  addCondition: (combatantId: string, condition: Condition) => void;
  removeCondition: (combatantId: string, conditionName: string) => void;
  updateConditionDuration: (combatantId: string, conditionName: string, duration: number) => void;
  
  // Health Management
  updateHitPoints: (combatantId: string, newHp: number) => void;
  healCombatant: (combatantId: string, amount: number) => void;
  damageCombatant: (combatantId: string, amount: number) => void;
  
  // Encounter Builder Actions
  setSearchTerm: (term: string) => void;
  setCrFilter: (cr: string) => void;
  setTypeFilter: (type: string) => void;
  setEnvironmentFilter: (environment: string) => void;
  filterCreatures: () => void;
  
  // Encounter Management
  saveEncounter: (name: string, description?: string, tags?: string[]) => void;
  loadEncounter: (savedEncounter: SavedEncounter) => void;
  deleteEncounter: (encounterId: string) => void;
  duplicateEncounter: (encounterId: string) => void;
  exportEncounter: (encounterId: string) => void;
  
  // Encounter Chaining (Story Progression)
  chainEncounter: (previousEncounterId: string, newEncounter: Encounter) => void;
  getEncounterChain: (encounterId: string) => Encounter[];
  
  // UI Actions
  toggleLeftSidebar: () => void;
  toggleRightPanel: () => void;
  togglePCForm: () => void;
  toggleConditionsModal: () => void;
  setSelectedCombatant: (combatantId: string | null) => void;
  
  // Utility Actions
  calculateDifficulty: (encounterId: string) => { difficulty: string; xp: number; partyThreshold: any };
  generateRandomEncounter: (partyLevel: number, partySize: number, difficulty: DifficultyLevel) => void;
}

// Mock creature data
const mockCreatures: Creature[] = [
  {
    id: 'goblin-1',
    name: "Goblin",
    cr: "1/4",
    crValue: 0.25,
    hp: 7,
    maxHp: 7,
    ac: 15,
    initiative: 0,
    type: "humanoid",
    size: "small",
    environment: "forest",
    xp: 50,
    abilities: { str: 8, dex: 14, con: 10, int: 10, wis: 8, cha: 8 },
    speed: "30 ft.",
    senses: "Darkvision 60 ft., Passive Perception 9",
    languages: "Common, Goblin"
  },
  {
    id: 'orc-1',
    name: "Orc",
    cr: "1/2",
    crValue: 0.5,
    hp: 15,
    maxHp: 15,
    ac: 13,
    initiative: 0,
    type: "humanoid",
    size: "medium",
    environment: "any",
    xp: 100,
    abilities: { str: 16, dex: 12, con: 16, int: 7, wis: 11, cha: 10 },
    speed: "30 ft.",
    senses: "Darkvision 60 ft., Passive Perception 10",
    languages: "Common, Orc"
  },
  {
    id: 'hobgoblin-1',
    name: "Hobgoblin",
    cr: "1/2",
    crValue: 0.5,
    hp: 11,
    maxHp: 11,
    ac: 18,
    initiative: 0,
    type: "humanoid",
    size: "medium",
    environment: "any",
    xp: 100,
    abilities: { str: 13, dex: 12, con: 12, int: 10, wis: 10, cha: 9 },
    speed: "30 ft.",
    senses: "Darkvision 60 ft., Passive Perception 10",
    languages: "Common, Goblin"
  },
  {
    id: 'skeleton-1',
    name: "Skeleton",
    cr: "1/4",
    crValue: 0.25,
    hp: 13,
    maxHp: 13,
    ac: 13,
    initiative: 0,
    type: "undead",
    size: "medium",
    environment: "any",
    xp: 50,
    abilities: { str: 10, dex: 14, con: 15, int: 6, wis: 8, cha: 5 },
    speed: "30 ft.",
    senses: "Darkvision 60 ft., Passive Perception 9",
    languages: "Understands all languages it knew in life but can't speak"
  },
  {
    id: 'zombie-1',
    name: "Zombie",
    cr: "1/4",
    crValue: 0.25,
    hp: 22,
    maxHp: 22,
    ac: 8,
    initiative: 0,
    type: "undead",
    size: "medium",
    environment: "any",
    xp: 50,
    abilities: { str: 13, dex: 6, con: 16, int: 3, wis: 6, cha: 5 },
    speed: "20 ft.",
    senses: "Darkvision 60 ft., Passive Perception 8",
    languages: "Understands the languages it knew in life but can't speak"
  }
];

// XP thresholds for encounter difficulty
const difficultyThresholds: Record<number, Record<string, number>> = {
  1: { easy: 25, medium: 50, hard: 75, deadly: 100 },
  2: { easy: 50, medium: 100, hard: 150, deadly: 200 },
  3: { easy: 75, medium: 150, hard: 225, deadly: 400 },
  4: { easy: 125, medium: 250, hard: 375, deadly: 500 },
  5: { easy: 250, medium: 500, hard: 750, deadly: 1100 },
  6: { easy: 300, medium: 600, hard: 900, deadly: 1400 },
  7: { easy: 350, medium: 750, hard: 1100, deadly: 1700 },
  8: { easy: 450, medium: 900, hard: 1400, deadly: 2100 },
  9: { easy: 550, medium: 1100, hard: 1600, deadly: 2400 },
  10: { easy: 600, medium: 1200, hard: 1900, deadly: 2800 }
};

export const useEncounterStore = create<EncounterStore>()(
  persist(
    immer((set, get) => ({
      // Initial State
      initiative: {
        encounters: [],
        activeEncounterId: null,
        selectedCombatantId: null
      },
      encounterBuilder: {
        creatures: mockCreatures,
        filteredCreatures: mockCreatures,
        searchTerm: '',
        crFilter: '',
        typeFilter: '',
        environmentFilter: ''
      },
      ui: {
        leftSidebarCollapsed: false,
        rightPanelCollapsed: false,
        showPCForm: false,
        showConditionsModal: false,
        showEncounterChain: false
      },

      // Initiative Tracker Actions
      createEncounter: (name, partySize, partyLevel, difficulty) => set((state) => {
        const newEncounter: Encounter = {
          id: `encounter-${Date.now()}`,
          name,
          combatants: [],
          round: 1,
          currentTurn: 0,
          isActive: false,
          partySize,
          partyLevel,
          difficulty,
          xpBudget: difficultyThresholds[partyLevel]?.[difficulty] * partySize || 0,
          usedXp: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        state.initiative.encounters.push(newEncounter);
        state.initiative.activeEncounterId = newEncounter.id;
      }),

      setActiveEncounter: (encounterId) => set((state) => {
        state.initiative.activeEncounterId = encounterId;
      }),

      addCombatant: (creature, isPC = false, level) => set((state) => {
        const activeEncounter = state.initiative.encounters.find(
          e => e.id === state.initiative.activeEncounterId
        );
        if (!activeEncounter) return;

        const newCombatant: Combatant = {
          id: `combatant-${Date.now()}-${Math.random()}`,
          name: creature.name,
          hp: creature.hp,
          maxHp: creature.maxHp,
          ac: creature.ac,
          initiative: 0,
          isPC,
          conditions: [],
          xp: creature.xp,
          level: isPC ? level : undefined,
          type: creature.type,
          environment: creature.environment,
          cr: creature.cr,
          crValue: creature.crValue
        };

        activeEncounter.combatants.push(newCombatant);
        activeEncounter.updatedAt = new Date().toISOString();
        
        // Recalculate used XP
        const totalXp = activeEncounter.combatants
          .filter(c => !c.isPC)
          .reduce((sum, c) => sum + (c.xp || 0), 0);
        activeEncounter.usedXp = totalXp;
      }),

      removeCombatant: (combatantId) => set((state) => {
        const activeEncounter = state.initiative.encounters.find(
          e => e.id === state.initiative.activeEncounterId
        );
        if (!activeEncounter) return;

        const index = activeEncounter.combatants.findIndex(c => c.id === combatantId);
        if (index !== -1) {
          activeEncounter.combatants.splice(index, 1);
          activeEncounter.updatedAt = new Date().toISOString();
          
          // Adjust currentTurn if necessary
          if (activeEncounter.currentTurn >= activeEncounter.combatants.length) {
            activeEncounter.currentTurn = Math.max(0, activeEncounter.combatants.length - 1);
          }
          
          // Recalculate used XP
          const totalXp = activeEncounter.combatants
            .filter(c => !c.isPC)
            .reduce((sum, c) => sum + (c.xp || 0), 0);
          activeEncounter.usedXp = totalXp;
        }
      }),

      updateCombatant: (combatantId, updates) => set((state) => {
        const activeEncounter = state.initiative.encounters.find(
          e => e.id === state.initiative.activeEncounterId
        );
        if (!activeEncounter) return;

        const combatant = activeEncounter.combatants.find(c => c.id === combatantId);
        if (combatant) {
          Object.assign(combatant, updates);
          activeEncounter.updatedAt = new Date().toISOString();
        }
      }),

      rollInitiative: (combatantId) => set((state) => {
        const activeEncounter = state.initiative.encounters.find(
          e => e.id === state.initiative.activeEncounterId
        );
        if (!activeEncounter) return;

        const combatant = activeEncounter.combatants.find(c => c.id === combatantId);
        if (combatant) {
          const roll = Math.floor(Math.random() * 20) + 1;
          const dexMod = combatant.isPC ? 2 : Math.floor(Math.random() * 4); // Simplified
          combatant.initiative = roll + dexMod;
          activeEncounter.updatedAt = new Date().toISOString();
        }
      }),

      rollAllInitiative: () => set((state) => {
        const activeEncounter = state.initiative.encounters.find(
          e => e.id === state.initiative.activeEncounterId
        );
        if (!activeEncounter) return;

        activeEncounter.combatants.forEach(combatant => {
          const roll = Math.floor(Math.random() * 20) + 1;
          const dexMod = combatant.isPC ? 2 : Math.floor(Math.random() * 4);
          combatant.initiative = roll + dexMod;
        });
        activeEncounter.updatedAt = new Date().toISOString();
      }),

      sortByInitiative: () => set((state) => {
        const activeEncounter = state.initiative.encounters.find(
          e => e.id === state.initiative.activeEncounterId
        );
        if (!activeEncounter) return;

        activeEncounter.combatants.sort((a, b) => b.initiative - a.initiative);
        activeEncounter.currentTurn = 0;
        activeEncounter.updatedAt = new Date().toISOString();
      }),

      nextTurn: () => set((state) => {
        const activeEncounter = state.initiative.encounters.find(
          e => e.id === state.initiative.activeEncounterId
        );
        if (!activeEncounter || activeEncounter.combatants.length === 0) return;

        activeEncounter.currentTurn = (activeEncounter.currentTurn + 1) % activeEncounter.combatants.length;
        if (activeEncounter.currentTurn === 0) {
          activeEncounter.round++;
        }
        activeEncounter.updatedAt = new Date().toISOString();
      }),

      previousTurn: () => set((state) => {
        const activeEncounter = state.initiative.encounters.find(
          e => e.id === state.initiative.activeEncounterId
        );
        if (!activeEncounter || activeEncounter.combatants.length === 0) return;

        if (activeEncounter.currentTurn === 0) {
          activeEncounter.currentTurn = activeEncounter.combatants.length - 1;
          if (activeEncounter.round > 1) {
            activeEncounter.round--;
          }
        } else {
          activeEncounter.currentTurn--;
        }
        activeEncounter.updatedAt = new Date().toISOString();
      }),

      nextRound: () => set((state) => {
        const activeEncounter = state.initiative.encounters.find(
          e => e.id === state.initiative.activeEncounterId
        );
        if (!activeEncounter) return;

        activeEncounter.round++;
        activeEncounter.currentTurn = 0;
        activeEncounter.updatedAt = new Date().toISOString();
      }),

      resetEncounter: () => set((state) => {
        const activeEncounter = state.initiative.encounters.find(
          e => e.id === state.initiative.activeEncounterId
        );
        if (!activeEncounter) return;

        activeEncounter.round = 1;
        activeEncounter.currentTurn = 0;
        activeEncounter.isActive = false;
        activeEncounter.combatants.forEach(combatant => {
          combatant.initiative = 0;
          combatant.conditions = [];
          combatant.hp = combatant.maxHp;
        });
        activeEncounter.updatedAt = new Date().toISOString();
      }),

      // Condition Management
      addCondition: (combatantId, condition) => set((state) => {
        const activeEncounter = state.initiative.encounters.find(
          e => e.id === state.initiative.activeEncounterId
        );
        if (!activeEncounter) return;

        const combatant = activeEncounter.combatants.find(c => c.id === combatantId);
        if (combatant) {
          combatant.conditions.push(condition);
          activeEncounter.updatedAt = new Date().toISOString();
        }
      }),

      removeCondition: (combatantId, conditionName) => set((state) => {
        const activeEncounter = state.initiative.encounters.find(
          e => e.id === state.initiative.activeEncounterId
        );
        if (!activeEncounter) return;

        const combatant = activeEncounter.combatants.find(c => c.id === combatantId);
        if (combatant) {
          combatant.conditions = combatant.conditions.filter(c => c.name !== conditionName);
          activeEncounter.updatedAt = new Date().toISOString();
        }
      }),

      updateConditionDuration: (combatantId, conditionName, duration) => set((state) => {
        const activeEncounter = state.initiative.encounters.find(
          e => e.id === state.initiative.activeEncounterId
        );
        if (!activeEncounter) return;

        const combatant = activeEncounter.combatants.find(c => c.id === combatantId);
        if (combatant) {
          const condition = combatant.conditions.find(c => c.name === conditionName);
          if (condition) {
            condition.duration = duration;
            activeEncounter.updatedAt = new Date().toISOString();
          }
        }
      }),

      // Health Management
      updateHitPoints: (combatantId, newHp) => set((state) => {
        const activeEncounter = state.initiative.encounters.find(
          e => e.id === state.initiative.activeEncounterId
        );
        if (!activeEncounter) return;

        const combatant = activeEncounter.combatants.find(c => c.id === combatantId);
        if (combatant) {
          combatant.hp = Math.max(0, Math.min(newHp, combatant.maxHp));
          activeEncounter.updatedAt = new Date().toISOString();
        }
      }),

      healCombatant: (combatantId, amount) => set((state) => {
        const activeEncounter = state.initiative.encounters.find(
          e => e.id === state.initiative.activeEncounterId
        );
        if (!activeEncounter) return;

        const combatant = activeEncounter.combatants.find(c => c.id === combatantId);
        if (combatant) {
          combatant.hp = Math.min(combatant.hp + amount, combatant.maxHp);
          activeEncounter.updatedAt = new Date().toISOString();
        }
      }),

      damageCombatant: (combatantId, amount) => set((state) => {
        const activeEncounter = state.initiative.encounters.find(
          e => e.id === state.initiative.activeEncounterId
        );
        if (!activeEncounter) return;

        const combatant = activeEncounter.combatants.find(c => c.id === combatantId);
        if (combatant) {
          combatant.hp = Math.max(0, combatant.hp - amount);
          activeEncounter.updatedAt = new Date().toISOString();
        }
      }),

      // Encounter Builder Actions
      setSearchTerm: (term) => set((state) => {
        state.encounterBuilder.searchTerm = term;
        get().filterCreatures();
      }),

      setCrFilter: (cr) => set((state) => {
        state.encounterBuilder.crFilter = cr;
        get().filterCreatures();
      }),

      setTypeFilter: (type) => set((state) => {
        state.encounterBuilder.typeFilter = type;
        get().filterCreatures();
      }),

      setEnvironmentFilter: (environment) => set((state) => {
        state.encounterBuilder.environmentFilter = environment;
        get().filterCreatures();
      }),

      filterCreatures: () => set((state) => {
        const { creatures, searchTerm, crFilter, typeFilter, environmentFilter } = state.encounterBuilder;
        
        state.encounterBuilder.filteredCreatures = creatures.filter(creature => {
          const matchesSearch = creature.name.toLowerCase().includes(searchTerm.toLowerCase());
          const matchesCR = !crFilter || creature.cr === crFilter;
          const matchesType = !typeFilter || creature.type.toLowerCase() === typeFilter.toLowerCase();
          const matchesEnvironment = !environmentFilter || creature.environment.toLowerCase() === environmentFilter.toLowerCase();
          
          return matchesSearch && matchesCR && matchesType && matchesEnvironment;
        });
      }),

      // UI Actions
      toggleLeftSidebar: () => set((state) => {
        state.ui.leftSidebarCollapsed = !state.ui.leftSidebarCollapsed;
      }),

      toggleRightPanel: () => set((state) => {
        state.ui.rightPanelCollapsed = !state.ui.rightPanelCollapsed;
      }),

      togglePCForm: () => set((state) => {
        state.ui.showPCForm = !state.ui.showPCForm;
      }),

      toggleConditionsModal: () => set((state) => {
        state.ui.showConditionsModal = !state.ui.showConditionsModal;
      }),

      setSelectedCombatant: (combatantId) => set((state) => {
        state.initiative.selectedCombatantId = combatantId;
      }),

      // Utility Actions
      calculateDifficulty: (encounterId) => {
        const state = get();
        const encounter = state.initiative.encounters.find(e => e.id === encounterId);
        if (!encounter) return { difficulty: 'Unknown', xp: 0, partyThreshold: null };
        
        const thresholds = difficultyThresholds[encounter.partyLevel] || difficultyThresholds[5];
        const partyThreshold = {
          easy: thresholds.easy * encounter.partySize,
          medium: thresholds.medium * encounter.partySize,
          hard: thresholds.hard * encounter.partySize,
          deadly: thresholds.deadly * encounter.partySize
        };
        
        const xp = encounter.usedXp;
        let difficulty = 'Trivial';
        if (xp >= partyThreshold.deadly) difficulty = 'Deadly';
        else if (xp >= partyThreshold.hard) difficulty = 'Hard';
        else if (xp >= partyThreshold.medium) difficulty = 'Medium';
        else if (xp >= partyThreshold.easy) difficulty = 'Easy';
        
        return { difficulty, xp, partyThreshold };
      },

      // Placeholder implementations for remaining actions
      saveEncounter: () => {},
      loadEncounter: () => {},
      deleteEncounter: () => {},
      duplicateEncounter: () => {},
      exportEncounter: () => {},
      chainEncounter: () => {},
      getEncounterChain: () => [],
      generateRandomEncounter: () => {}
    })),
    {
      name: 'dnd-encounter-storage',
      partialize: (state) => ({
        initiative: state.initiative,
        encounterBuilder: {
          ...state.encounterBuilder,
          filteredCreatures: [] // Don't persist filtered results
        }
      })
    }
  )
);
