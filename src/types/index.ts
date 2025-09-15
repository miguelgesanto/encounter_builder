// Core types for D&D Encounter Builder & Initiative Tracker

export interface Creature {
  id: string;
  name: string;
  cr: string;
  crValue: number;
  hp: number;
  maxHp: number;
  ac: number;
  initiative: number;
  type: string;
  size: string;
  environment: string;
  xp: number;
  speed?: string;
  abilities?: {
    str: number;
    dex: number;
    con: number;
    int: number;
    wis: number;
    cha: number;
  };
  skills?: string;
  senses?: string;
  languages?: string;
  description?: string;
}

export interface Combatant {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  tempHp?: number;
  ac: number;
  initiative: number;
  isPC: boolean;
  conditions: Condition[];
  xp?: number;
  level?: number;
  type?: string;
  environment?: string;
  cr?: string;
  crValue?: number;
  isActive?: boolean;
  notes?: string;
}

export interface Condition {
  name: string;
  description: string;
  duration?: number;
  source?: string;
}

export interface Encounter {
  id: string;
  name: string;
  combatants: Combatant[];
  round: number;
  currentTurn: number;
  isActive: boolean;
  partySize: number;
  partyLevel: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'deadly';
  xpBudget: number;
  usedXp: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SavedEncounter {
  id: string;
  name: string;
  encounter: Omit<Encounter, 'id'>;
  savedAt: string;
  tags: string[];
  description?: string;
}

export interface InitiativeState {
  encounters: Encounter[];
  activeEncounterId: string | null;
  selectedCombatantId: string | null;
}

export interface EncounterBuilderState {
  creatures: Creature[];
  filteredCreatures: Creature[];
  searchTerm: string;
  crFilter: string;
  typeFilter: string;
  environmentFilter: string;
}

export interface UIState {
  leftSidebarCollapsed: boolean;
  rightPanelCollapsed: boolean;
  showPCForm: boolean;
  showConditionsModal: boolean;
  showEncounterChain: boolean;
}

export interface AppState {
  initiative: InitiativeState;
  encounterBuilder: EncounterBuilderState;
  ui: UIState;
}

// Condition definitions for D&D 5e
export const CONDITIONS: Record<string, Condition> = {
  'Blinded': {
    name: 'Blinded',
    description: "Can't see. Attacks against you have Advantage; your attacks have Disadvantage."
  },
  'Charmed': {
    name: 'Charmed',
    description: "Can't attack the charmer or target them with harmful abilities. Charmer has Advantage on social interactions."
  },
  'Deafened': {
    name: 'Deafened',
    description: "Can't hear. Automatically fail ability checks that require hearing."
  },
  'Frightened': {
    name: 'Frightened',
    description: "Disadvantage on ability checks and attacks while source of fear is in sight. Can't move closer to source."
  },
  'Grappled': {
    name: 'Grappled',
    description: "Speed becomes 0. Can't benefit from speed bonuses. Ends if grappler is incapacitated."
  },
  'Incapacitated': {
    name: 'Incapacitated',
    description: "Can't take actions or reactions. Can still move unless otherwise specified."
  },
  'Invisible': {
    name: 'Invisible',
    description: "Considered heavily obscured. Attacks have Advantage; attacks against have Disadvantage."
  },
  'Paralyzed': {
    name: 'Paralyzed',
    description: "Incapacitated, can't move or speak. Fail Str/Dex saves. Attacks auto-crit within 5ft."
  },
  'Petrified': {
    name: 'Petrified',
    description: "Transformed to stone. Incapacitated, can't move/speak. Resistant to all damage. Immunity to poison/disease."
  },
  'Poisoned': {
    name: 'Poisoned',
    description: "Disadvantage on attack rolls and ability checks."
  },
  'Prone': {
    name: 'Prone',
    description: "Disadvantage on attacks. Attacks against you: Advantage if within 5ft, Disadvantage if farther."
  },
  'Restrained': {
    name: 'Restrained',
    description: "Speed 0. Attacks: Disadvantage. Attacks against: Advantage. Disadvantage on Dex saves."
  },
  'Stunned': {
    name: 'Stunned',
    description: "Incapacitated, can't move. Can speak falteringly. Fail Str/Dex saves. Attacks have Advantage."
  },
  'Unconscious': {
    name: 'Unconscious',
    description: "Incapacitated, can't move/speak, unaware of surroundings. Drop held items, fall prone. Fail Str/Dex saves."
  },
  'Exhaustion': {
    name: 'Exhaustion',
    description: "Levels 1-3: Disadvantage on d20 rolls. Level 4+: Speed halved. Level 6: Death."
  },
  'Concentration': {
    name: 'Concentration',
    description: "Maintaining a spell. Can be broken by damage, incapacitation, or casting another concentration spell."
  }
};

// Encounter templates for quick setup
export interface EncounterTemplate {
  name: string;
  description: string;
  suggestedLevel: number;
  creatures: { name: string; quantity: number }[];
  environment: string;
  tags: string[];
}

export const ENCOUNTER_TEMPLATES: EncounterTemplate[] = [
  {
    name: "Goblin Ambush",
    description: "A classic low-level encounter with goblins springing from hiding",
    suggestedLevel: 2,
    creatures: [
      { name: "Goblin", quantity: 4 },
      { name: "Hobgoblin", quantity: 1 }
    ],
    environment: "forest",
    tags: ["ambush", "humanoid", "low-level"]
  },
  {
    name: "Undead Rising",
    description: "Skeletons and zombies emerge from an ancient graveyard",
    suggestedLevel: 3,
    creatures: [
      { name: "Skeleton", quantity: 3 },
      { name: "Zombie", quantity: 2 }
    ],
    environment: "graveyard",
    tags: ["undead", "horror", "mid-level"]
  },
  {
    name: "Dragon's Hoard",
    description: "Face a young dragon guarding its treasure",
    suggestedLevel: 8,
    creatures: [
      { name: "Young Red Dragon", quantity: 1 }
    ],
    environment: "lair",
    tags: ["dragon", "boss", "high-level"]
  }
];

export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'deadly';
export type CreatureType = 'aberration' | 'beast' | 'celestial' | 'construct' | 'dragon' | 'elemental' | 'fey' | 'fiend' | 'giant' | 'humanoid' | 'monstrosity' | 'ooze' | 'plant' | 'undead';
export type CreatureSize = 'tiny' | 'small' | 'medium' | 'large' | 'huge' | 'gargantuan';
