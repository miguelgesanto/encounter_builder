import {
  EncounterContext,
  StateChangeEvent,
  PredictedEvent,
  ConditionState,
  LegendaryCreature,
  GameEvent,
  Trigger,
  isLegendaryCreature,
  hasLairActions,
  isConditionExpiring,
  isCreatureCritical
} from '../types/reminder.types'
import { Combatant, CombatState } from '../../combat-tracker/types/combat.types'

export class ContextAnalyzer {
  // Convert combat state to encounter context
  static combatStateToContext(combatState: CombatState): EncounterContext {
    const activeConditions = this.extractActiveConditions(combatState.combatants)
    const legendaryCreatures = this.extractLegendaryCreatures(combatState.combatants)
    const recentEvents = this.convertCombatEvents(combatState.events || [])

    return {
      currentTurn: combatState.currentTurn,
      round: combatState.round,
      creatures: combatState.combatants,
      activeConditions,
      legendaryCreatures,
      lairActions: this.extractLairActions(combatState.combatants),
      environmentalFactors: this.extractEnvironmentalFactors(combatState),
      recentEvents,
      upcomingEvents: this.predictUpcomingEvents({
        currentTurn: combatState.currentTurn,
        round: combatState.round,
        creatures: combatState.combatants,
        activeConditions,
        legendaryCreatures,
        lairActions: [],
        environmentalFactors: [],
        recentEvents,
        upcomingEvents: []
      })
    }
  }

  // Extract active conditions with proper structure
  private static extractActiveConditions(combatants: Combatant[]): ConditionState[] {
    const conditions: ConditionState[] = []

    combatants.forEach(combatant => {
      combatant.conditions.forEach(condition => {
        conditions.push({
          id: condition.id,
          name: condition.name,
          creature: combatant.id,
          duration: condition.duration || -1,
          description: condition.description,
          source: condition.source
        })
      })
    })

    return conditions
  }

  // Extract legendary creatures with action tracking
  private static extractLegendaryCreatures(combatants: Combatant[]): LegendaryCreature[] {
    return combatants
      .filter(isLegendaryCreature)
      .map(creature => ({
        id: creature.id,
        name: creature.name,
        legendaryActionsTotal: 3, // Standard D&D 5e
        legendaryActionsRemaining: 3, // TODO: Track this in combat state
        actions: creature.legendaryActions || [],
        isActive: true
      }))
  }

  // Extract lair actions
  private static extractLairActions(combatants: Combatant[]) {
    const lairActions: any[] = []

    combatants.forEach(creature => {
      if (hasLairActions(creature)) {
        creature.lairActions!.forEach((action, index) => {
          lairActions.push({
            id: `${creature.id}-lair-${index}`,
            name: action.name,
            description: action.description,
            initiative: 20, // Lair actions typically happen on initiative 20
            environmentEffect: action.description
          })
        })
      }
    })

    return lairActions
  }

  // Extract environmental factors from notes and creature abilities
  private static extractEnvironmentalFactors(combatState: CombatState): string[] {
    const factors: string[] = []

    // Check notes for environmental mentions
    if (combatState.notes) {
      const environmentKeywords = ['difficult terrain', 'darkness', 'fog', 'fire', 'ice', 'poison gas', 'water', 'height advantage']
      environmentKeywords.forEach(keyword => {
        if (combatState.notes.toLowerCase().includes(keyword)) {
          factors.push(keyword)
        }
      })
    }

    // Check creature abilities for environmental effects
    combatState.combatants.forEach(creature => {
      creature.specialAbilities?.forEach(ability => {
        if (ability.description.toLowerCase().includes('aura') ||
            ability.description.toLowerCase().includes('environment')) {
          factors.push(`${creature.name}: ${ability.name}`)
        }
      })
    })

    return factors
  }

  // Convert combat events to game events
  private static convertCombatEvents(events: any[]): GameEvent[] {
    return events.map(event => ({
      type: this.mapEventType(event.type),
      creature: event.combatantId || 'unknown',
      details: event.data || {},
      timestamp: new Date(event.timestamp).getTime(),
      round: event.data?.round || 1
    }))
  }

  private static mapEventType(combatEventType: string): GameEvent['type'] {
    const typeMap: Record<string, GameEvent['type']> = {
      'damage_taken': 'damage',
      'condition_added': 'condition',
      'condition_removed': 'condition',
      'turn_start': 'turn_start',
      'turn_end': 'turn_end',
      'round_start': 'round_start'
    }
    return typeMap[combatEventType] || 'turn_start'
  }

  // Predict upcoming events based on current context
  static predictUpcomingEvents(context: EncounterContext): PredictedEvent[] {
    const predictions: PredictedEvent[] = []

    // Predict potential deaths (creatures with low HP)
    context.creatures.forEach(creature => {
      if (isCreatureCritical(creature, 0.3)) { // 30% HP threshold
        predictions.push({
          id: `death-${creature.id}-${Date.now()}`,
          type: 'potential_death',
          creature: creature.id,
          probability: this.calculateDeathProbability(creature),
          triggerConditions: ['takes_damage'],
          expectedTurn: context.currentTurn + 1,
          expectedRound: context.round
        })
      }
    })

    // Predict condition endings
    context.activeConditions.forEach(condition => {
      if (isConditionExpiring(condition, 2)) {
        predictions.push({
          id: `condition-end-${condition.id}-${Date.now()}`,
          type: 'condition_ending',
          creature: condition.creature,
          condition: condition.name,
          probability: condition.duration === 1 ? 0.9 : 0.7,
          expectedTurn: context.currentTurn + condition.duration,
          expectedRound: context.round
        })
      }
    })

    // Predict legendary action opportunities
    context.legendaryCreatures.forEach(creature => {
      if (creature.legendaryActionsRemaining > 0) {
        predictions.push({
          id: `legendary-${creature.id}-${Date.now()}`,
          type: 'legendary_action_window',
          creature: creature.id,
          probability: 0.8,
          triggerConditions: ['player_turn_ends'],
          expectedTurn: context.currentTurn + 1
        })
      }
    })

    // Predict lair actions (initiative count 20)
    if (context.lairActions.length > 0) {
      predictions.push({
        id: `lair-actions-${Date.now()}`,
        type: 'lair_action_trigger',
        probability: 0.95,
        triggerConditions: ['initiative_count_20'],
        expectedRound: context.round + 1
      })
    }

    return predictions
  }

  // Calculate death probability based on HP and threat level
  private static calculateDeathProbability(creature: Combatant): number {
    const hpPercentage = creature.hp / creature.maxHp

    if (hpPercentage <= 0.1) return 0.9  // 10% HP or less
    if (hpPercentage <= 0.25) return 0.7 // 25% HP or less
    if (hpPercentage <= 0.5) return 0.4  // 50% HP or less

    return 0.1 // Above 50% HP
  }

  // Analyze state changes between two contexts
  static analyzeStateChange(oldContext: EncounterContext, newContext: EncounterContext): StateChangeEvent[] {
    const changes: StateChangeEvent[] = []

    // Turn change
    if (oldContext.currentTurn !== newContext.currentTurn) {
      changes.push({
        type: 'turn_change',
        oldState: { currentTurn: oldContext.currentTurn },
        newState: { currentTurn: newContext.currentTurn },
        affectedCreatures: [newContext.creatures[newContext.currentTurn]?.id || ''],
        timestamp: Date.now()
      })
    }

    // Round change
    if (oldContext.round !== newContext.round) {
      changes.push({
        type: 'round_change',
        oldState: { round: oldContext.round },
        newState: { round: newContext.round },
        affectedCreatures: newContext.creatures.map(c => c.id),
        timestamp: Date.now()
      })
    }

    // HP changes
    const hpChanges = this.detectHPChanges(oldContext.creatures, newContext.creatures)
    changes.push(...hpChanges)

    // Condition changes
    const conditionChanges = this.detectConditionChanges(oldContext.activeConditions, newContext.activeConditions)
    changes.push(...conditionChanges)

    // Deaths
    const deaths = this.detectDeaths(oldContext.creatures, newContext.creatures)
    changes.push(...deaths)

    return changes
  }

  // Detect HP changes between creature lists
  private static detectHPChanges(oldCreatures: Combatant[], newCreatures: Combatant[]): StateChangeEvent[] {
    const changes: StateChangeEvent[] = []

    oldCreatures.forEach(oldCreature => {
      const newCreature = newCreatures.find(c => c.id === oldCreature.id)
      if (newCreature && oldCreature.hp !== newCreature.hp) {
        changes.push({
          type: 'hp_change',
          oldState: { creatures: [oldCreature] },
          newState: { creatures: [newCreature] },
          affectedCreatures: [oldCreature.id],
          timestamp: Date.now()
        })
      }
    })

    return changes
  }

  // Detect condition changes
  private static detectConditionChanges(oldConditions: ConditionState[], newConditions: ConditionState[]): StateChangeEvent[] {
    const changes: StateChangeEvent[] = []

    // Find added conditions
    newConditions.forEach(newCondition => {
      const existed = oldConditions.find(c => c.id === newCondition.id)
      if (!existed) {
        changes.push({
          type: 'condition_change',
          oldState: { activeConditions: oldConditions },
          newState: { activeConditions: [newCondition] },
          affectedCreatures: [newCondition.creature],
          timestamp: Date.now()
        })
      }
    })

    // Find removed conditions
    oldConditions.forEach(oldCondition => {
      const stillExists = newConditions.find(c => c.id === oldCondition.id)
      if (!stillExists) {
        changes.push({
          type: 'condition_change',
          oldState: { activeConditions: [oldCondition] },
          newState: { activeConditions: newConditions },
          affectedCreatures: [oldCondition.creature],
          timestamp: Date.now()
        })
      }
    })

    return changes
  }

  // Detect creature deaths
  private static detectDeaths(oldCreatures: Combatant[], newCreatures: Combatant[]): StateChangeEvent[] {
    const changes: StateChangeEvent[] = []

    oldCreatures.forEach(oldCreature => {
      const newCreature = newCreatures.find(c => c.id === oldCreature.id)
      if (newCreature && oldCreature.hp > 0 && newCreature.hp <= 0) {
        changes.push({
          type: 'creature_death',
          oldState: { creatures: [oldCreature] },
          newState: { creatures: [newCreature] },
          affectedCreatures: [oldCreature.id],
          timestamp: Date.now()
        })
      }
    })

    return changes
  }

  // Generate triggers based on state changes
  static generateTriggersFromChanges(changes: StateChangeEvent[]): Trigger[] {
    const triggers: Trigger[] = []

    changes.forEach(change => {
      switch (change.type) {
        case 'turn_change':
          triggers.push({
            key: `turn_${change.newState.currentTurn}`,
            urgency: 'high',
            position: 'turn-panel',
            timing: 'immediate'
          })
          break

        case 'round_change':
          triggers.push({
            key: `round_${change.newState.round}`,
            urgency: 'high',
            position: 'round-header',
            timing: 'immediate'
          })
          break

        case 'hp_change':
          const creature = change.newState.creatures?.[0]
          if (creature && isCreatureCritical(creature)) {
            triggers.push({
              key: `hp_critical_${creature.id}`,
              urgency: 'critical',
              position: 'creature-card',
              timing: 'immediate'
            })
          }
          break

        case 'condition_change':
          triggers.push({
            key: `condition_${change.affectedCreatures[0]}`,
            urgency: 'medium',
            position: 'creature-card',
            timing: 'delayed-500ms'
          })
          break

        case 'creature_death':
          triggers.push({
            key: `death_${change.affectedCreatures[0]}`,
            urgency: 'critical',
            position: 'center-alert',
            timing: 'immediate'
          })
          break
      }
    })

    return triggers
  }

  // Generate a hash for context comparison
  static generateContextHash(context: EncounterContext): string {
    const hashData = {
      turn: context.currentTurn,
      round: context.round,
      creatures: context.creatures.map(c => ({
        id: c.id,
        hp: c.hp,
        conditions: c.conditions.length
      })),
      activeConditions: context.activeConditions.length
    }

    return btoa(JSON.stringify(hashData))
  }
}