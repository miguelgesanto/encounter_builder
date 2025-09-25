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
  importSource?: 'manual' | 'text' | 'dndbeyond';
  importedAt?: string;
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