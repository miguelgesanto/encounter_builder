// Combat Tracker Feature Module Exports
//
// This module handles HP tracking, condition management, and individual
// combatant display for the D&D Encounter Builder.

// Main Components
export { CombatCard } from './components/CombatCard';
// TODO: Uncomment as components are implemented
// export { ConditionsTracker } from './components/ConditionsTracker';
// export { HPModal } from './components/HPModal';
// export { CombatantList } from './components/CombatantList';
// export { CombatStats } from './components/CombatStats';

// Custom Hooks
// TODO: Uncomment as hooks are implemented
// export { useCombatants } from './hooks/useCombatants';
// export { useConditionManager } from './hooks/useConditionManager';
// export { useHPManager } from './hooks/useHPManager';
// export { useCombatValidation } from './hooks/useCombatValidation';

// Types (if any feature-specific types exist)
// export type { CombatEvent, HPChangeEvent } from './types/combat';

// The main Combat Tracker orchestration component
// export { CombatTracker } from './CombatTracker';

/**
 * USAGE EXAMPLE:
 * 
 * import { CombatCard, CombatTracker } from '../features/combat-tracker';
 * 
 * <CombatTracker
 *   combatants={encounter.combatants}
 *   currentTurn={encounter.currentTurn}
 *   onCombatantsChange={handleCombatantsChange}
 * />
 */