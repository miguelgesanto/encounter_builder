// =================================================================
// SHARED TYPESCRIPT TYPES FOR D&D ENCOUNTER BUILDER
// Refactored from monolithic structure to feature-based modules
// =================================================================

/**
 * Core Combatant Interface
 * Used across all features for consistent combatant representation
 */
export interface Combatant {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  ac: number;
  initiative: number;
  isPC: boolean;
  conditions: Condition[];
  tempHp: number;
  
  // Optional properties for different combatant types
  level?: number;        // For Player Characters
  cr?: string;          // For Monsters (e.g., "1/4", "2", "15")
  crValue?: number;     // Numeric CR value for calculations
  type?: string;        // Monster type (humanoid, beast, etc.)
  environment?: string; // Monster environment (forest, dungeon, etc.)
  xp?: number;         // Experience points awarded
}

/**
 * Condition Interface
 * Represents D&D 5e conditions applied to combatants
 */
export interface Condition {
  name: string;
  duration?: number;     // Duration in rounds (optional)
  source?: string;       // Source of the condition (spell, ability, etc.)
  description?: string;  // Brief description of effects
}

/**
 * Encounter Interface
 * Represents a complete combat encounter
 */
export interface Encounter {
  id: string;
  name: string;
  combatants: Combatant[];
  round: number;
  currentTurn: number;
  notes: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Saved Encounter Interface
 * For persistence and loading of encounters
 */
export interface SavedEncounter extends Encounter {
  savedAt: string;
}

/**
 * Creature Database Entry
 * For monsters and NPCs in the creature library
 */
export interface Creature {
  name: string;
  cr: string;
  crValue: number;
  hp: number;
  ac: number;
  initiative: number;
  type: string;
  environment: string;
  xp: number;
  description?: string;
  abilities?: CreatureAbility[];
}

/**
 * Creature Ability Interface
 * For special monster abilities and actions
 */
export interface CreatureAbility {
  name: string;
  description: string;
  type: 'action' | 'bonus_action' | 'reaction' | 'legendary' | 'lair';
  uses?: number;        // Uses per rest/day
  recharge?: string;    // Recharge dice (e.g., "5-6")
}

/**
 * Encounter Template Interface
 * For pre-built encounter templates
 */
export interface EncounterTemplate {
  id: string;
  name: string;
  description?: string;
  creatures: string[];  // Array of creature names
  environment?: string;
  difficulty?: string;
  notes?: string;
}

/**
 * Difficulty Data Interface
 * For encounter difficulty calculations
 */
export interface DifficultyData {
  difficulty: 'Trivial' | 'Easy' | 'Medium' | 'Hard' | 'Deadly' | 'Unknown';
  xp: number;
  baseXP?: number;
  partyThreshold?: {
    easy: number;
    medium: number;
    hard: number;
    deadly: number;
  };
}

/**
 * Validation Result Interface
 * For input validation across features
 */
export interface ValidationResult {
  isValid: boolean;
  error?: string;
  warnings?: string[];
}

/**
 * HP Change Event Interface
 * For tracking HP changes and combat events
 */
export interface HPChangeEvent {
  combatantId: string;
  type: 'damage' | 'healing' | 'temp_hp' | 'max_hp_change';
  amount: number;
  source?: string;
  timestamp: number;
}

/**
 * Combat Event Interface
 * For logging combat actions and events
 */
export interface CombatEvent {
  id: string;
  round: number;
  turn: number;
  combatantId: string;
  type: 'damage' | 'healing' | 'condition_applied' | 'condition_removed' | 'initiative_change' | 'turn_start' | 'turn_end';
  description: string;
  data?: any;          // Additional event data
  timestamp: number;
}

/**
 * Initiative Roll Result Interface
 * For initiative rolling system
 */
export interface InitiativeRoll {
  combatantId: string;
  roll: number;        // D20 roll result
  modifier: number;    // Initiative modifier
  total: number;       // Roll + modifier
  tiebreaker?: number; // Dexterity score for tie-breaking
}

/**
 * Party Composition Interface
 * For encounter balance calculations
 */
export interface PartyComposition {
  playerCount: number;
  averageLevel: number;
  levelRange: [number, number];
  classes?: string[];  // Optional class tracking
}

/**
 * Feature Module State Interface
 * Generic interface for feature module state management
 */
export interface FeatureState<T = any> {
  data: T;
  loading: boolean;
  error?: string;
  lastUpdated?: number;
}

/**
 * UI Layout State Interface
 * For managing application layout preferences
 */
export interface LayoutState {
  leftSidebarCollapsed: boolean;
  rightPanelCollapsed: boolean;
  theme: 'adventure' | 'classic' | 'dark';
  fontSize: 'small' | 'medium' | 'large';
}

/**
 * User Preferences Interface
 * For storing user settings and preferences
 */
export interface UserPreferences {
  layout: LayoutState;
  autoSave: boolean;
  soundEffects: boolean;
  animations: boolean;
  accessibility: {
    highContrast: boolean;
    reducedMotion: boolean;
    screenReader: boolean;
  };
  gameRules: {
    autoRollInitiative: boolean;
    trackConditionDuration: boolean;
    autoProcessTurnEffects: boolean;
  };
}

/**
 * Application State Interface
 * Top-level application state structure
 */
export interface AppState {
  encounter: Encounter;
  preferences: UserPreferences;
  layout: LayoutState;
  history: CombatEvent[];
}

// =================================================================
// TYPE GUARDS AND UTILITY TYPES
// =================================================================

/**
 * Type guard to check if combatant is a Player Character
 */
export function isPC(combatant: Combatant): boolean {
  return combatant.isPC === true;
}

/**
 * Type guard to check if combatant is a Monster/NPC
 */
export function isMonster(combatant: Combatant): boolean {
  return combatant.isPC === false;
}

/**
 * Utility type for partial updates
 */
export type PartialUpdate<T> = Partial<T> & { id: string };

/**
 * Utility type for creating new entities
 */
export type CreateEntity<T> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Union type for all possible condition names
 */
export type ConditionName = 
  | 'Blinded'
  | 'Charmed' 
  | 'Deafened'
  | 'Frightened'
  | 'Grappled'
  | 'Incapacitated'
  | 'Invisible'
  | 'Paralyzed'
  | 'Petrified'
  | 'Poisoned'
  | 'Prone'
  | 'Restrained'
  | 'Stunned'
  | 'Unconscious'
  | 'Exhaustion'
  | 'Concentration';

/**
 * Union type for creature types
 */
export type CreatureType = 
  | 'aberration'
  | 'beast'
  | 'celestial'
  | 'construct'
  | 'dragon'
  | 'elemental'
  | 'fey'
  | 'fiend'
  | 'giant'
  | 'humanoid'
  | 'monstrosity'
  | 'ooze'
  | 'plant'
  | 'undead';

/**
 * Union type for combat card variants
 */
export type CombatCardVariant = 'pc' | 'monster' | 'current-turn' | 'selected';

/**
 * Union type for button variants
 */
export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'warning';

/**
 * Union type for button sizes
 */
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// =================================================================
// CONSTANTS AND ENUMS
// =================================================================

/**
 * D&D 5e Challenge Ratings
 */
export const CHALLENGE_RATINGS = [
  '0', '1/8', '1/4', '1/2', '1', '2', '3', '4', '5',
  '6', '7', '8', '9', '10', '11', '12', '13', '14', '15',
  '16', '17', '18', '19', '20', '21', '22', '23', '24',
  '25', '26', '27', '28', '29', '30'
] as const;

/**
 * Standard D&D 5e Conditions
 */
export const STANDARD_CONDITIONS: ConditionName[] = [
  'Blinded', 'Charmed', 'Deafened', 'Frightened', 'Grappled',
  'Incapacitated', 'Invisible', 'Paralyzed', 'Petrified', 'Poisoned',
  'Prone', 'Restrained', 'Stunned', 'Unconscious', 'Exhaustion', 'Concentration'
];

/**
 * Creature Types
 */
export const CREATURE_TYPES: CreatureType[] = [
  'aberration', 'beast', 'celestial', 'construct', 'dragon',
  'elemental', 'fey', 'fiend', 'giant', 'humanoid',
  'monstrosity', 'ooze', 'plant', 'undead'
];

/**
 * Difficulty Thresholds by Level (per character)
 */
export const DIFFICULTY_THRESHOLDS: Record<number, { easy: number; medium: number; hard: number; deadly: number; }> = {
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

// Export all types for use across features
export type * from './combatant';