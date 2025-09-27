import { BaseEntity, AbilityScores, ImportSource, ChallengeRating, CreatureType, CreatureSize, Alignment } from '../../../shared/types/common.types'

export interface Condition {
  id: string
  name: string
  description: string
  duration?: number
  source?: string
}

export interface Action {
  id: string
  name: string
  description: string
  actionType: 'action' | 'bonus_action' | 'reaction' | 'legendary' | 'lair'
  cost?: number // For legendary actions
}

export interface SpecialAbility {
  id: string
  name: string
  description: string
  type: 'passive' | 'active' | 'recharge' | 'legendary_resistance'
  recharge?: string // e.g., "5-6"
}

export interface Combatant extends BaseEntity {
  // Basic Info
  name: string
  isPC: boolean
  level?: number

  // Combat Stats
  hp: number
  maxHp: number
  tempHp: number
  ac: number
  initiative: number

  // Creature Details
  size?: CreatureSize
  type?: CreatureType
  alignment?: Alignment
  cr?: ChallengeRating
  xp?: number
  speed?: string
  environment?: string

  // Abilities
  abilities?: AbilityScores

  // Combat Features
  conditions: Condition[]
  actions?: Action[]
  specialAbilities?: SpecialAbility[]
  legendaryActions?: Action[]
  lairActions?: Action[]
  reactions?: Action[]

  // Defenses
  saves?: string
  skills?: string
  damageResistances?: string
  damageImmunities?: string
  conditionImmunities?: string
  senses?: string
  languages?: string

  // Metadata
  importSource?: ImportSource
  importedAt?: string
  sourceUrl?: string
}

export interface CombatState {
  combatants: Combatant[]
  currentTurn: number
  round: number
  isActive: boolean
  isPaused: boolean
  startTime?: string
  notes: string
}

export interface CombatStats {
  totalXP: number
  averageHP: number
  activeConditions: number
  turnDuration: number
  totalTurns: number
}

// Type guards
export const isCombatant = (obj: any): obj is Combatant => {
  return obj &&
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.hp === 'number' &&
    typeof obj.maxHp === 'number' &&
    typeof obj.ac === 'number' &&
    typeof obj.initiative === 'number' &&
    typeof obj.isPC === 'boolean'
}

export const isValidCR = (cr: string): cr is ChallengeRating => {
  const validCRs = ['0', '1/8', '1/4', '1/2', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30']
  return validCRs.includes(cr)
}

// Utility types for forms and operations
export type CombatantInput = Omit<Combatant, 'id' | 'createdAt' | 'updatedAt' | 'conditions'>
export type CombatantUpdate = Partial<Pick<Combatant, 'name' | 'hp' | 'maxHp' | 'tempHp' | 'ac' | 'initiative'>>
export type ConditionInput = Omit<Condition, 'id'>

// Events
export interface CombatEvent {
  id: string
  type: 'turn_start' | 'turn_end' | 'round_start' | 'round_end' | 'damage_taken' | 'healing_received' | 'condition_added' | 'condition_removed'
  combatantId?: string
  timestamp: string
  data?: Record<string, any>
}