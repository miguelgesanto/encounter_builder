export interface CreatureAbility {
  type: 'start_of_turn' | 'end_of_turn' | 'legendary_actions' | 'lair_actions' | 'combat_ability' | 'resistance' | 'concentration';
  name: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  timing?: string; // "initiative 20", "start of turn", etc.
  count?: number; // for legendary actions tracking
}

export interface CreatureTemplate {
  name: string;
  cr: string;
  abilities: CreatureAbility[];
}