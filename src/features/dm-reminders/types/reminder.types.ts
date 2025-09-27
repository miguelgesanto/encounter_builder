import { Combatant, Condition, Action, CombatEvent } from '../../combat-tracker/types/combat.types'

// Core reminder system types
export interface EncounterContext {
  currentTurn: number
  round: number
  creatures: Combatant[]
  activeConditions: ConditionState[]
  legendaryCreatures: LegendaryCreature[]
  lairActions: LairAction[]
  environmentalFactors: string[]
  recentEvents: GameEvent[]
  upcomingEvents: PredictedEvent[]
}

export interface ConditionState {
  id: string
  name: string
  creature: string
  duration: number
  description: string
  source?: string
  effects?: string[]
}

export interface LegendaryCreature {
  id: string
  name: string
  legendaryActionsTotal: number
  legendaryActionsRemaining: number
  actions: Action[]
  isActive: boolean
}

export interface LairAction {
  id: string
  name: string
  description: string
  initiative: number
  environmentEffect?: string
}

export interface GameEvent {
  type: 'damage' | 'condition' | 'death' | 'spell_cast' | 'legendary_action' | 'lair_action' | 'turn_start' | 'turn_end' | 'round_start'
  creature: string
  details: Record<string, any>
  timestamp: number
  round: number
  turn?: number
}

export interface PredictedEvent {
  id: string
  type: 'potential_death' | 'condition_ending' | 'legendary_action_window' | 'lair_action_trigger' | 'spell_concentration'
  creature?: string
  condition?: string
  probability: number
  triggerConditions?: string[]
  expectedTurn?: number
  expectedRound?: number
}

// Reminder content and display
export interface ReminderContent {
  id: string
  content: string
  type: ReminderType
  urgency: 'low' | 'medium' | 'high' | 'critical'
  displayDuration: number
  position: DisplayPosition
  timing: 'immediate' | 'delayed-500ms' | 'delayed-1s' | 'delayed-2s'
  context?: Record<string, any>
  dismissible: boolean
  persistent?: boolean
}

export type ReminderType =
  | 'turn_start'
  | 'turn_end'
  | 'round_start'
  | 'condition_reminder'
  | 'death_trigger'
  | 'legendary_actions'
  | 'lair_actions'
  | 'concentration_check'
  | 'environmental'
  | 'tactical_suggestion'

export type DisplayPosition =
  | 'turn-panel'      // Next to current creature
  | 'center-alert'    // Full-screen important alerts
  | 'sidebar'         // Persistent reminders
  | 'creature-card'   // On specific creature cards
  | 'round-header'    // In round display area
  | 'floating'        // Floating overlay

export interface DisplayedReminder extends ReminderContent {
  isVisible: boolean
  startTime: number
  targetCreature?: string
  autoHideTimer?: number
}

export interface ReminderBank {
  [key: string]: ReminderContent[]
}

// Trigger system
export interface Trigger {
  key: string
  urgency: 'low' | 'medium' | 'high' | 'critical'
  position: DisplayPosition
  timing: 'immediate' | 'delayed-500ms' | 'delayed-1s' | 'delayed-2s'
  conditions?: TriggerCondition[]
}

export interface TriggerCondition {
  type: 'hp_threshold' | 'turn_count' | 'condition_duration' | 'creature_type' | 'round_number'
  value: any
  operator: 'eq' | 'lt' | 'gt' | 'lte' | 'gte' | 'contains'
}

// Context analysis
export interface ContextSnapshot {
  timestamp: number
  context: EncounterContext
  hash: string
}

export interface StateChangeEvent {
  type: 'turn_change' | 'round_change' | 'hp_change' | 'condition_change' | 'creature_death' | 'combat_start' | 'combat_end'
  oldState: Partial<EncounterContext>
  newState: Partial<EncounterContext>
  affectedCreatures: string[]
  timestamp: number
}

// AI Agent types
export interface AIPromptTemplate {
  id: string
  name: string
  template: string
  variables: string[]
  reminderType: ReminderType
  maxTokens: number
  model?: string
}

export interface TurnContext {
  creature: Combatant
  isPC: boolean
  turnNumber: number
  round: number
  conditions: ConditionState[]
  recentActions: GameEvent[]
  upcomingThreats: PredictedEvent[]
  tacticalSituation: TacticalContext
}

export interface TacticalContext {
  nearbyEnemies: string[]
  nearbyAllies: string[]
  environmentalHazards: string[]
  availableActions: Action[]
  recommendedActions: string[]
  strategicNotes: string[]
}

// Cache and performance
export interface CacheEntry {
  key: string
  content: ReminderContent
  created: number
  accessed: number
  hits: number
  relevancyScore: number
}

export interface PreGenerationRequest {
  contextHash: string
  priority: 'low' | 'medium' | 'high'
  estimatedTriggerTurn: number
  reminderTypes: ReminderType[]
}

// Configuration and preferences
export interface ReminderPreferences {
  enabledReminderTypes: ReminderType[]
  displayPositions: Record<ReminderType, DisplayPosition>
  urgencyThresholds: Record<ReminderType, 'low' | 'medium' | 'high' | 'critical'>
  autoHideDurations: Record<ReminderType, number>
  enablePredictiveGeneration: boolean
  maxCachedReminders: number
  enableTacticalSuggestions: boolean
  enableEnvironmentalReminders: boolean
}

// Event system for the reminder engine
export interface ReminderEngineEvents {
  'reminder-generated': (reminder: ReminderContent) => void
  'reminder-displayed': (reminder: DisplayedReminder) => void
  'reminder-dismissed': (reminderId: string) => void
  'context-changed': (change: StateChangeEvent) => void
  'prediction-updated': (predictions: PredictedEvent[]) => void
  'cache-updated': (stats: { size: number; hitRate: number }) => void
}

// Type guards
export const isLegendaryCreature = (creature: Combatant): creature is Combatant & { legendaryActions: Action[] } => {
  return !!(creature.legendaryActions && creature.legendaryActions.length > 0)
}

export const hasLairActions = (creature: Combatant): creature is Combatant & { lairActions: Action[] } => {
  return !!(creature.lairActions && creature.lairActions.length > 0)
}

export const isConditionExpiring = (condition: ConditionState, turnsLeft: number = 2): boolean => {
  return condition.duration > 0 && condition.duration <= turnsLeft
}

export const isCreatureCritical = (creature: Combatant, threshold: number = 0.25): boolean => {
  return (creature.hp / creature.maxHp) <= threshold
}