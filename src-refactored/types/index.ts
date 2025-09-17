// Shared TypeScript Type Definitions
//
// Central export point for all shared types used across
// the D&D Encounter Builder application.

// Core types from combatant.ts (our main types file)
export * from './combatant';

// Type guards and utility functions
export { isPC, isMonster } from './combatant';

// Re-export commonly used types for convenience
export type {
  Combatant,
  Condition,
  Encounter,
  SavedEncounter,
  Creature,
  CreatureAbility,
  EncounterTemplate,
  DifficultyData,
  ValidationResult,
  HPChangeEvent,
  CombatEvent,
  InitiativeRoll,
  PartyComposition,
  FeatureState,
  LayoutState,
  UserPreferences,
  AppState
} from './combatant';

// Commonly used union types
export type {
  ConditionName,
  CreatureType,
  CombatCardVariant,
  ButtonVariant,
  ButtonSize
} from './combatant';

// Utility types
export type {
  PartialUpdate,
  CreateEntity
} from './combatant';

// Constants for easy importing
export {
  CHALLENGE_RATINGS,
  STANDARD_CONDITIONS,
  CREATURE_TYPES,
  DIFFICULTY_THRESHOLDS
} from './combatant';

/**
 * TYPE SYSTEM OVERVIEW:
 * 
 * This type system provides comprehensive TypeScript support for the
 * D&D Encounter Builder with the following key principles:
 * 
 * 🎯 CORE ENTITIES:
 * - Combatant: Core entity representing PCs and monsters in combat
 * - Encounter: Container for combat scenarios with state tracking
 * - Creature: Database entries for monsters and NPCs
 * - Condition: D&D 5e conditions with optional duration tracking
 * 
 * 🔧 UTILITY TYPES:
 * - PartialUpdate<T>: For partial entity updates with required ID
 * - CreateEntity<T>: For entity creation (omits auto-generated fields)
 * - ValidationResult: Standardized validation response format
 * - FeatureState<T>: Generic state container for feature modules
 * 
 * 🎨 UI TYPES:
 * - ButtonVariant: Theme variants for buttons (primary, secondary, etc.)
 * - ButtonSize: Size options (xs, sm, md, lg, xl)
 * - CombatCardVariant: Visual variants for combat cards
 * - LayoutState: Application layout preferences
 * 
 * 🎲 GAME LOGIC TYPES:
 * - ConditionName: Union of all D&D 5e conditions
 * - CreatureType: Union of all D&D monster types
 * - DifficultyData: Encounter difficulty calculation results
 * - InitiativeRoll: Initiative rolling results with tie-breaking
 * 
 * 📊 DATA TRACKING:
 * - CombatEvent: Combat action logging
 * - HPChangeEvent: HP change tracking
 * - PartyComposition: Party analysis for encounter balance
 * 
 * USAGE EXAMPLES:
 * 
 * // Import commonly used types
 * import { Combatant, Encounter, ButtonVariant } from '@/types';
 * 
 * // Create a new combatant
 * const newCombatant: Combatant = {
 *   id: '1',
 *   name: 'Goblin',
 *   hp: 7,
 *   maxHp: 7,
 *   ac: 15,
 *   initiative: 12,
 *   isPC: false,
 *   conditions: [],
 *   tempHp: 0
 * };
 * 
 * // Use validation result
 * const validateName = (name: string): ValidationResult => {
 *   if (!name.trim()) {
 *     return { isValid: false, error: 'Name is required' };
 *   }
 *   return { isValid: true };
 * };
 * 
 * // Type-safe component props
 * interface CombatCardProps {
 *   combatant: Combatant;
 *   variant?: CombatCardVariant;
 *   onUpdate: (update: PartialUpdate<Combatant>) => void;
 * }
 * 
 * TYPE SAFETY BENEFITS:
 * 
 * ✅ Compile-time error detection for D&D rule violations
 * ✅ IntelliSense support for all game mechanics
 * ✅ Prevents common bugs like undefined property access
 * ✅ Ensures consistent data structures across features  
 * ✅ Makes refactoring safer with IDE-supported changes
 * ✅ Provides self-documenting code with interface definitions
 */