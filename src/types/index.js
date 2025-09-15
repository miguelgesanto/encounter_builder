// Core types and constants for D&D Encounter Builder & Initiative Tracker
// Converted to JavaScript with constants and helper functions

// Condition definitions for D&D 5e
const CONDITIONS = {
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
const ENCOUNTER_TEMPLATES = [
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

// Utility functions for type checking and validation
const createCombatant = (creature, isPC = false, level = null) => {
  return {
    id: `combatant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: creature.name,
    hp: creature.hp,
    maxHp: creature.maxHp || creature.hp,
    ac: creature.ac,
    initiative: 0,
    isPC: isPC,
    conditions: [],
    xp: creature.xp || 0,
    level: isPC ? level : undefined,
    type: creature.type,
    environment: creature.environment,
    cr: creature.cr,
    crValue: creature.crValue,
    isActive: false,
    notes: ''
  };
};

const createEncounter = (name, partySize, partyLevel, difficulty) => {
  return {
    id: `encounter-${Date.now()}`,
    name: name,
    combatants: [],
    round: 1,
    currentTurn: 0,
    isActive: false,
    partySize: partySize,
    partyLevel: partyLevel,
    difficulty: difficulty,
    xpBudget: 0,
    usedXp: 0,
    notes: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};

const createCondition = (name, description, duration = null, source = null) => {
  return {
    name: name,
    description: description,
    duration: duration,
    source: source
  };
};

// Format challenge rating for display
const formatChallengeRating = (cr) => {
  if (typeof cr === 'string') {
    if (cr === '0.125') return '1/8';
    if (cr === '0.25') return '1/4';
    if (cr === '0.5') return '1/2';
    return cr;
  }
  
  if (typeof cr === 'number') {
    if (cr === 0.125) return '1/8';
    if (cr === 0.25) return '1/4';
    if (cr === 0.5) return '1/2';
    return cr.toString();
  }
  
  return cr;
};

// Calculate ability modifier
const calculateModifier = (score) => {
  return Math.floor((score - 10) / 2);
};

// Format ability modifier for display
const formatModifier = (score) => {
  const modifier = calculateModifier(score);
  return modifier >= 0 ? `+${modifier}` : `${modifier}`;
};

// Make everything available globally
window.DnDTypes = {
  CONDITIONS,
  ENCOUNTER_TEMPLATES,
  createCombatant,
  createEncounter,
  createCondition,
  formatChallengeRating,
  calculateModifier,
  formatModifier
};