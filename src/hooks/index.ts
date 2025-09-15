// Custom hooks for D&D Encounter Builder & Initiative Tracker
import { useCallback, useMemo } from 'react';
import { useEncounterStore } from '../stores/encounterStore';
import type { Combatant, Encounter, Creature } from '../types';

/**
 * Hook for managing the active encounter
 */
export const useActiveEncounter = () => {
  const store = useEncounterStore();
  
  const activeEncounter = useMemo(() => {
    return store.initiative.encounters.find(
      e => e.id === store.initiative.activeEncounterId
    );
  }, [store.initiative.encounters, store.initiative.activeEncounterId]);

  const actions = useMemo(() => ({
    createEncounter: store.createEncounter,
    setActiveEncounter: store.setActiveEncounter,
    resetEncounter: store.resetEncounter
  }), [store.createEncounter, store.setActiveEncounter, store.resetEncounter]);

  return {
    encounter: activeEncounter,
    isActive: !!activeEncounter,
    ...actions
  };
};

/**
 * Hook for managing combatants in the active encounter
 */
export const useCombatants = () => {
  const store = useEncounterStore();
  
  const activeEncounter = store.initiative.encounters.find(
    e => e.id === store.initiative.activeEncounterId
  );

  const combatants = useMemo(() => {
    return activeEncounter?.combatants || [];
  }, [activeEncounter?.combatants]);

  const currentCombatant = useMemo(() => {
    if (!activeEncounter || combatants.length === 0) return null;
    return combatants[activeEncounter.currentTurn] || null;
  }, [activeEncounter, combatants]);

  const playerCharacters = useMemo(() => {
    return combatants.filter(c => c.isPC);
  }, [combatants]);

  const nonPlayerCharacters = useMemo(() => {
    return combatants.filter(c => !c.isPC);
  }, [combatants]);

  const actions = useMemo(() => ({
    addCombatant: store.addCombatant,
    removeCombatant: store.removeCombatant,
    updateCombatant: store.updateCombatant,
    rollInitiative: store.rollInitiative,
    rollAllInitiative: store.rollAllInitiative,
    sortByInitiative: store.sortByInitiative
  }), [
    store.addCombatant,
    store.removeCombatant, 
    store.updateCombatant,
    store.rollInitiative,
    store.rollAllInitiative,
    store.sortByInitiative
  ]);

  return {
    combatants,
    currentCombatant,
    playerCharacters,
    nonPlayerCharacters,
    round: activeEncounter?.round || 1,
    currentTurn: activeEncounter?.currentTurn || 0,
    ...actions
  };
};

/**
 * Hook for managing initiative and turn order
 */
export const useInitiative = () => {
  const store = useEncounterStore();
  
  const activeEncounter = store.initiative.encounters.find(
    e => e.id === store.initiative.activeEncounterId
  );

  const isInCombat = useMemo(() => {
    return !!activeEncounter && activeEncounter.combatants.length > 0;
  }, [activeEncounter]);

  const canAdvanceTurn = useMemo(() => {
    return isInCombat && activeEncounter!.combatants.length > 0;
  }, [isInCombat, activeEncounter]);

  const actions = useMemo(() => ({
    nextTurn: store.nextTurn,
    previousTurn: store.previousTurn,
    nextRound: store.nextRound,
    rollInitiative: store.rollInitiative,
    rollAllInitiative: store.rollAllInitiative,
    sortByInitiative: store.sortByInitiative
  }), [
    store.nextTurn,
    store.previousTurn,
    store.nextRound,
    store.rollInitiative,
    store.rollAllInitiative,
    store.sortByInitiative
  ]);

  return {
    isInCombat,
    canAdvanceTurn,
    round: activeEncounter?.round || 1,
    currentTurn: activeEncounter?.currentTurn || 0,
    combatantCount: activeEncounter?.combatants.length || 0,
    ...actions
  };
};

/**
 * Hook for managing combatant health and conditions
 */
export const useCombatantHealth = (combatantId: string) => {
  const store = useEncounterStore();
  
  const combatant = useMemo(() => {
    const activeEncounter = store.initiative.encounters.find(
      e => e.id === store.initiative.activeEncounterId
    );
    return activeEncounter?.combatants.find(c => c.id === combatantId);
  }, [store.initiative.encounters, store.initiative.activeEncounterId, combatantId]);

  const healthPercentage = useMemo(() => {
    if (!combatant) return 0;
    return Math.round((combatant.hp / combatant.maxHp) * 100);
  }, [combatant?.hp, combatant?.maxHp]);

  const isAlive = useMemo(() => {
    return (combatant?.hp || 0) > 0;
  }, [combatant?.hp]);

  const isBloodied = useMemo(() => {
    return healthPercentage <= 50 && healthPercentage > 0;
  }, [healthPercentage]);

  const actions = useMemo(() => ({
    updateHitPoints: (newHp: number) => store.updateHitPoints(combatantId, newHp),
    healCombatant: (amount: number) => store.healCombatant(combatantId, amount),
    damageCombatant: (amount: number) => store.damageCombatant(combatantId, amount),
    addCondition: (condition: any) => store.addCondition(combatantId, condition),
    removeCondition: (conditionName: string) => store.removeCondition(combatantId, conditionName)
  }), [
    combatantId,
    store.updateHitPoints,
    store.healCombatant,
    store.damageCombatant,
    store.addCondition,
    store.removeCondition
  ]);

  return {
    combatant,
    healthPercentage,
    isAlive,
    isBloodied,
    conditions: combatant?.conditions || [],
    ...actions
  };
};

/**
 * Hook for managing creature search and filtering
 */
export const useCreatureLibrary = () => {
  const store = useEncounterStore();
  
  const { 
    creatures, 
    filteredCreatures, 
    searchTerm, 
    crFilter, 
    typeFilter, 
    environmentFilter 
  } = store.encounterBuilder;

  const creatureCount = useMemo(() => ({
    total: creatures.length,
    filtered: filteredCreatures.length
  }), [creatures.length, filteredCreatures.length]);

  const availableFilters = useMemo(() => {
    const crValues = [...new Set(creatures.map(c => c.cr))].sort((a, b) => {
      const aVal = parseFloat(a) || 0;
      const bVal = parseFloat(b) || 0;
      return aVal - bVal;
    });
    
    const types = [...new Set(creatures.map(c => c.type))].sort();
    const environments = [...new Set(creatures.map(c => c.environment))].sort();
    
    return { crValues, types, environments };
  }, [creatures]);

  const actions = useMemo(() => ({
    setSearchTerm: store.setSearchTerm,
    setCrFilter: store.setCrFilter,
    setTypeFilter: store.setTypeFilter,
    setEnvironmentFilter: store.setEnvironmentFilter,
    addCreatureToEncounter: store.addCombatant,
    clearFilters: () => {
      store.setSearchTerm('');
      store.setCrFilter('');
      store.setTypeFilter('');
      store.setEnvironmentFilter('');
    }
  }), [
    store.setSearchTerm,
    store.setCrFilter,
    store.setTypeFilter,
    store.setEnvironmentFilter,
    store.addCombatant
  ]);

  return {
    creatures: filteredCreatures,
    searchTerm,
    filters: { crFilter, typeFilter, environmentFilter },
    availableFilters,
    creatureCount,
    ...actions
  };
};

/**
 * Hook for managing encounter difficulty and balance
 */
export const useEncounterBalance = () => {
  const store = useEncounterStore();
  
  const activeEncounter = store.initiative.encounters.find(
    e => e.id === store.initiative.activeEncounterId
  );

  const difficultyData = useMemo(() => {
    return activeEncounter ? store.calculateDifficulty(activeEncounter.id) : null;
  }, [activeEncounter, store.calculateDifficulty]);

  const isOverBudget = useMemo(() => {
    if (!activeEncounter || !difficultyData) return false;
    return difficultyData.xp > activeEncounter.xpBudget;
  }, [activeEncounter, difficultyData]);

  const budgetPercentage = useMemo(() => {
    if (!activeEncounter || !difficultyData) return 0;
    return Math.round((difficultyData.xp / activeEncounter.xpBudget) * 100);
  }, [activeEncounter, difficultyData]);

  const recommendations = useMemo(() => {
    if (!difficultyData || !activeEncounter) return [];
    
    const suggestions = [];
    if (isOverBudget) {
      suggestions.push('Consider removing some creatures or reducing quantities');
    }
    if (budgetPercentage < 50) {
      suggestions.push('You can add more creatures to increase difficulty');
    }
    if (activeEncounter.combatants.filter(c => !c.isPC).length > 6) {
      suggestions.push('Many creatures can slow down combat - consider fewer, stronger enemies');
    }
    
    return suggestions;
  }, [difficultyData, activeEncounter, isOverBudget, budgetPercentage]);

  return {
    difficulty: difficultyData?.difficulty || 'Unknown',
    xpUsed: difficultyData?.xp || 0,
    xpBudget: activeEncounter?.xpBudget || 0,
    isOverBudget,
    budgetPercentage,
    recommendations,
    partyLevel: activeEncounter?.partyLevel || 1,
    partySize: activeEncounter?.partySize || 4
  };
};

/**
 * Hook for managing UI state
 */
export const useUI = () => {
  const store = useEncounterStore();
  
  const { ui } = store;
  
  const actions = useMemo(() => ({
    toggleLeftSidebar: store.toggleLeftSidebar,
    toggleRightPanel: store.toggleRightPanel,
    togglePCForm: store.togglePCForm,
    toggleConditionsModal: store.toggleConditionsModal,
    setSelectedCombatant: store.setSelectedCombatant
  }), [
    store.toggleLeftSidebar,
    store.toggleRightPanel,
    store.togglePCForm,
    store.toggleConditionsModal,
    store.setSelectedCombatant
  ]);

  return {
    ...ui,
    selectedCombatantId: store.initiative.selectedCombatantId,
    ...actions
  };
};

/**
 * Hook for keyboard shortcuts
 */
export const useKeyboardShortcuts = () => {
  const { nextTurn, previousTurn, rollAllInitiative } = useInitiative();
  const { createEncounter } = useActiveEncounter();
  
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    // Only handle shortcuts when not in input fields
    if (event.target instanceof HTMLInputElement || 
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement) {
      return;
    }

    switch (event.key.toLowerCase()) {
      case ' ':
        event.preventDefault();
        nextTurn();
        break;
      case 'arrowleft':
        if (event.shiftKey) {
          event.preventDefault();
          previousTurn();
        }
        break;
      case 'r':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          rollAllInitiative();
        }
        break;
      case 'n':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          createEncounter('New Encounter', 4, 3, 'medium');
        }
        break;
    }
  }, [nextTurn, previousTurn, rollAllInitiative, createEncounter]);

  return { handleKeyPress };
};

export default {
  useActiveEncounter,
  useCombatants,
  useInitiative,
  useCombatantHealth,
  useCreatureLibrary,
  useEncounterBalance,
  useUI,
  useKeyboardShortcuts
};