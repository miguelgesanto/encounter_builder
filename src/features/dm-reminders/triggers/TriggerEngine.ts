import { Trigger, TriggerCondition, EncounterContext, ReminderType } from '../types/reminder.types'
import { Combatant } from '../../combat-tracker/types/combat.types'

export class TriggerEngine {
  private registeredTriggers: Trigger[] = []

  constructor() {
    this.initializeDefaultTriggers()
  }

  /**
   * Register a new trigger condition
   */
  registerTrigger(trigger: Trigger): void {
    this.registeredTriggers.push(trigger)
  }

  /**
   * Evaluate all triggers against current context
   */
  evaluateTriggers(context: EncounterContext): ReminderType[] {
    const activeTriggers: ReminderType[] = []

    for (const trigger of this.registeredTriggers) {
      if (this.evaluateTrigger(trigger, context)) {
        activeTriggers.push(trigger.key as ReminderType)
      }
    }

    return activeTriggers
  }

  /**
   * Check if a specific trigger should fire
   */
  private evaluateTrigger(trigger: Trigger, context: EncounterContext): boolean {
    if (!trigger.conditions || trigger.conditions.length === 0) {
      return true // Always fire if no conditions
    }

    return trigger.conditions.every(condition =>
      this.evaluateCondition(condition, context)
    )
  }

  /**
   * Evaluate a single trigger condition
   */
  private evaluateCondition(condition: TriggerCondition, context: EncounterContext): boolean {
    const currentCreature = context.creatures[context.currentTurn]

    switch (condition.type) {
      case 'hp_threshold':
        if (!currentCreature) return false
        const hpPercent = currentCreature.hp / currentCreature.maxHp
        return this.compareValues(hpPercent, condition.value, condition.operator)

      case 'turn_count':
        return this.compareValues(context.currentTurn, condition.value, condition.operator)

      case 'round_number':
        return this.compareValues(context.round, condition.value, condition.operator)

      case 'condition_duration':
        const relevantConditions = context.activeConditions.filter(c =>
          c.creature === currentCreature?.id
        )
        return relevantConditions.some(c =>
          this.compareValues(c.duration, condition.value, condition.operator)
        )

      case 'creature_type':
        if (!currentCreature) return false
        if (condition.operator === 'contains') {
          return currentCreature.type?.toLowerCase().includes(condition.value.toLowerCase()) || false
        }
        return this.compareValues(currentCreature.type, condition.value, condition.operator)

      default:
        console.warn(`Unknown trigger condition type: ${condition.type}`)
        return false
    }
  }

  /**
   * Compare values based on operator
   */
  private compareValues(actual: any, expected: any, operator: string): boolean {
    switch (operator) {
      case 'eq': return actual === expected
      case 'lt': return actual < expected
      case 'gt': return actual > expected
      case 'lte': return actual <= expected
      case 'gte': return actual >= expected
      case 'contains':
        return String(actual).toLowerCase().includes(String(expected).toLowerCase())
      default:
        console.warn(`Unknown operator: ${operator}`)
        return false
    }
  }

  /**
   * Initialize D&D 5e specific trigger conditions
   */
  private initializeDefaultTriggers(): void {
    // Death trigger - creature at 0 HP or critical health
    this.registerTrigger({
      key: 'death_trigger',
      urgency: 'critical',
      position: 'center-alert',
      timing: 'immediate',
      conditions: [
        {
          type: 'hp_threshold',
          value: 0.25,
          operator: 'lte'
        }
      ]
    })

    // Legendary actions - when it's not the legendary creature's turn
    this.registerTrigger({
      key: 'legendary_actions',
      urgency: 'high',
      position: 'sidebar',
      timing: 'immediate',
      conditions: [
        {
          type: 'turn_count',
          value: 0,
          operator: 'gte'
        }
      ]
    })

    // Lair actions - at initiative 20 (beginning of round)
    this.registerTrigger({
      key: 'lair_actions',
      urgency: 'critical',
      position: 'center-alert',
      timing: 'immediate',
      conditions: [
        {
          type: 'turn_count',
          value: 0,
          operator: 'eq'
        }
      ]
    })

    // Turn start - always fire for current creature
    this.registerTrigger({
      key: 'turn_start',
      urgency: 'medium',
      position: 'turn-panel',
      timing: 'immediate'
    })

    // Condition reminders - when creature has conditions
    this.registerTrigger({
      key: 'condition_reminder',
      urgency: 'medium',
      position: 'creature-card',
      timing: 'immediate',
      conditions: [
        {
          type: 'condition_duration',
          value: 0,
          operator: 'gt'
        }
      ]
    })

    // Concentration checks - when creature has concentration spells
    this.registerTrigger({
      key: 'concentration_check',
      urgency: 'high',
      position: 'creature-card',
      timing: 'immediate'
    })

    // Environmental hazards - round-based environmental effects
    this.registerTrigger({
      key: 'environmental',
      urgency: 'medium',
      position: 'sidebar',
      timing: 'delayed-500ms',
      conditions: [
        {
          type: 'round_number',
          value: 1,
          operator: 'gte'
        }
      ]
    })

    // Tactical suggestions - for complex encounters
    this.registerTrigger({
      key: 'tactical_suggestion',
      urgency: 'low',
      position: 'floating',
      timing: 'delayed-2s',
      conditions: [
        {
          type: 'round_number',
          value: 2,
          operator: 'gte'
        }
      ]
    })

    // Dragon-specific breath weapon triggers
    this.registerTrigger({
      key: 'turn_start',
      urgency: 'high',
      position: 'turn-panel',
      timing: 'immediate',
      conditions: [
        {
          type: 'creature_type',
          value: 'dragon',
          operator: 'contains'
        }
      ]
    })

    // Undead-specific turn triggers
    this.registerTrigger({
      key: 'turn_start',
      urgency: 'medium',
      position: 'turn-panel',
      timing: 'immediate',
      conditions: [
        {
          type: 'creature_type',
          value: 'undead',
          operator: 'contains'
        }
      ]
    })
  }

  /**
   * Get trigger configuration for a specific reminder type
   */
  getTriggerConfig(reminderType: ReminderType): Trigger | undefined {
    return this.registeredTriggers.find(t => t.key === reminderType)
  }

  /**
   * Update trigger urgency based on context
   */
  adjustTriggerUrgency(reminderType: ReminderType, context: EncounterContext): 'low' | 'medium' | 'high' | 'critical' {
    const trigger = this.getTriggerConfig(reminderType)
    if (!trigger) return 'medium'

    const currentCreature = context.creatures[context.currentTurn]

    // Escalate urgency for critical situations
    if (currentCreature) {
      const hpPercent = currentCreature.hp / currentCreature.maxHp

      if (hpPercent <= 0.1) return 'critical'
      if (hpPercent <= 0.25) return 'high'
      if (context.round >= 5) return 'high' // Long combat escalation
    }

    return trigger.urgency
  }
}