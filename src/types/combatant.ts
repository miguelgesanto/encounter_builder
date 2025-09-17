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