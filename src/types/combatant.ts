export interface Condition {
  name: string;
  duration?: number;
}

export interface Combatant {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  ac: number;
  initiative: number;
  isPC: boolean;
  level?: number;
  conditions: Condition[];
  cr?: string;
  type?: string;
  environment?: string;
  xp?: number;
  tempHp?: number;
  importSource?: 'manual' | 'text' | 'dndbeyond' | 'open5e';
  importedAt?: string;
  sourceUrl?: string;
  abilities?: {
    str?: number;
    dex?: number;
    con?: number;
    int?: number;
    wis?: number;
    cha?: number;
  };
  saves?: string;
  skills?: string;
  damageResistances?: string;
  damageImmunities?: string;
  conditionImmunities?: string;
  senses?: string;
  languages?: string;
  speed?: string;
  legendaryActions?: Array<{ name: string; description: string; cost?: number }>;
  lairActions?: Array<{ name: string; description: string }>;
  specialAbilities?: Array<{ name: string; description: string }>;
  actions?: Array<{ name: string; description: string }>;
  // Combat state tracking
  legendaryActionsRemaining?: number; // Resets to 3 at start of creature's turn
  rechargeAbilities?: Array<{
    name: string;
    isAvailable: boolean;
    rechargeOn: string; // e.g., "5-6", "4-6", "6"
    description?: string;
  }>;
  concentratingOn?: {
    spellName: string;
    spellLevel: number;
    duration: string; // e.g., "10 minutes", "1 hour", "Concentration, up to 1 minute"
    startedRound: number;
    dc?: number; // Spell save DC if applicable
  };
  savingThrows?: {
    str?: number;
    dex?: number;
    con?: number;
    int?: number;
    wis?: number;
    cha?: number;
  };
  regeneration?: {
    amount: number; // HP regenerated per turn
    damageTypes?: string[]; // Damage types that prevent regeneration (e.g., ["fire", "acid"])
    isActive: boolean; // Whether regeneration is currently working
    description?: string;
  };
}

export interface SavedEncounter {
  id: string;
  name: string;
  combatants: Combatant[];
  round: number;
  currentTurn: number;
  notes: string;
  savedAt: string;
}