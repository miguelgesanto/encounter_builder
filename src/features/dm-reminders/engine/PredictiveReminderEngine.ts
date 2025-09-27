import {
  EncounterContext,
  PredictedEvent,
  ReminderContent,
  ReminderBank,
  TurnContext,
  TacticalContext,
  ReminderType,
  PreGenerationRequest,
  isLegendaryCreature,
  hasLairActions,
  isConditionExpiring,
  isCreatureCritical
} from '../types/reminder.types'
import { Combatant } from '../../combat-tracker/types/combat.types'
import { SmartReminderEngine } from './SmartReminderEngine'
import { InitiativeTimingEngine } from '../utils/InitiativeTimingEngine'
import { CreatureAbilityParser } from '../utils/CreatureAbilityParser'

export class PredictiveReminderEngine {
  private reminderBank: ReminderBank = {}
  private preGenerationQueue: PreGenerationRequest[] = []
  private isProcessingQueue = false

  constructor(private aiAgent?: any) {
    this.startBackgroundProcessing()
  }

  // Pre-generate reminders for upcoming turns/events using the new smart engine
  async preGenerateReminders(context: EncounterContext): Promise<ReminderBank> {
    const predictions = this.predictUpcomingEvents(context)
    const reminderBank: ReminderBank = {}

    // Generate reminders for initiative order (proper D&D timing)
    const initiativeWindows = InitiativeTimingEngine.generateInitiativeOrder(context)

    for (const window of initiativeWindows) {
      const windowKey = `initiative_${window.initiative}_round_${window.round}`

      try {
        // Use the smart reminder engine for each initiative window
        reminderBank[windowKey] = await SmartReminderEngine.generateRemindersForInitiative(
          context,
          window.initiative,
          { useAI: true, enablePredictive: true, groupByType: true, reminderTypes: ['turn_start', 'legendary_actions', 'lair_actions', 'condition_reminder', 'death_trigger'] }
        )
      } catch (error) {
        console.warn(`Failed to generate reminders for ${windowKey}:`, error)
        reminderBank[windowKey] = this.generateFallbackReminders(context)
      }
    }

    // Generate event-specific reminders
    for (const event of predictions) {
      const eventKey = `event_${event.id}`
      try {
        reminderBank[eventKey] = await this.generateEventReminders(event, context)
      } catch (error) {
        console.warn(`Failed to generate reminders for ${eventKey}:`, error)
        reminderBank[eventKey] = this.generateFallbackEventReminders(event)
      }
    }

    // Generate round-specific reminders
    const roundKey = `round_${context.round + 1}`
    reminderBank[roundKey] = await this.generateRoundReminders(context)

    return reminderBank
  }

  // Predict what's likely to happen next
  predictUpcomingEvents(context: EncounterContext): PredictedEvent[] {
    const events: PredictedEvent[] = []

    // Predict creature deaths (low HP)
    context.creatures.forEach(creature => {
      if (isCreatureCritical(creature, 0.25)) {
        events.push({
          id: `death_${creature.id}_${context.round}`,
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
        events.push({
          id: `condition_end_${condition.id}_${context.round}`,
          type: 'condition_ending',
          condition: condition.name,
          creature: condition.creature,
          probability: condition.duration <= 1 ? 0.9 : 0.7,
          expectedTurn: context.currentTurn + condition.duration,
          expectedRound: context.round
        })
      }
    })

    // Predict legendary action opportunities
    context.legendaryCreatures.forEach(creature => {
      if (creature.legendaryActionsRemaining > 0) {
        events.push({
          id: `legendary_${creature.id}_${context.round}`,
          type: 'legendary_action_window',
          creature: creature.id,
          probability: 0.8,
          triggerConditions: ['player_turn_ends'],
          expectedTurn: context.currentTurn + 1,
          expectedRound: context.round
        })
      }
    })

    // Predict lair actions (initiative count 20)
    if (context.lairActions.length > 0) {
      events.push({
        id: `lair_actions_${context.round}`,
        type: 'lair_action_trigger',
        probability: 0.95,
        triggerConditions: ['initiative_count_20'],
        expectedRound: context.round + 1
      })
    }

    // Predict concentration checks
    context.activeConditions.forEach(condition => {
      if (condition.name.toLowerCase().includes('concentration') ||
          condition.description.toLowerCase().includes('concentration')) {
        events.push({
          id: `concentration_${condition.id}_${context.round}`,
          type: 'spell_concentration',
          creature: condition.creature,
          condition: condition.name,
          probability: 0.6,
          triggerConditions: ['takes_damage'],
          expectedTurn: context.currentTurn + 1
        })
      }
    })

    return events
  }

  // Simulate future turn context
  private simulateFutureTurn(context: EncounterContext, turnsAhead: number): EncounterContext {
    const futureTurn = (context.currentTurn + turnsAhead) % context.creatures.length
    const futureRound = context.round + Math.floor((context.currentTurn + turnsAhead) / context.creatures.length)

    // Update condition durations
    const updatedConditions = context.activeConditions.map(condition => ({
      ...condition,
      duration: condition.duration > 0 ? Math.max(0, condition.duration - turnsAhead) : condition.duration
    })).filter(condition => condition.duration !== 0)

    return {
      ...context,
      currentTurn: futureTurn,
      round: futureRound,
      activeConditions: updatedConditions
    }
  }

  // Generate reminders for a specific context
  private async generateRemindersForContext(context: EncounterContext): Promise<ReminderContent[]> {
    const reminders: ReminderContent[] = []
    const currentCreature = context.creatures[context.currentTurn]

    if (!currentCreature) return reminders

    const turnContext = this.buildTurnContext(currentCreature, context)

    // Generate turn start reminder
    const turnReminder = await this.generateTurnStartReminder(turnContext)
    if (turnReminder) reminders.push(turnReminder)

    // Generate condition reminders
    const conditionReminders = await this.generateConditionReminders(turnContext)
    reminders.push(...conditionReminders)

    // Generate tactical suggestions
    if (this.shouldGenerateTacticalSuggestions(currentCreature)) {
      const tacticalReminder = await this.generateTacticalReminder(turnContext)
      if (tacticalReminder) reminders.push(tacticalReminder)
    }

    return reminders
  }

  // Generate turn start reminder
  private async generateTurnStartReminder(context: TurnContext): Promise<ReminderContent | null> {
    const reminders: string[] = []

    // HP status
    const hpPercent = (context.creature.hp / context.creature.maxHp) * 100
    if (hpPercent <= 25) {
      reminders.push(`🩸 **${context.creature.name}** is critically wounded (${context.creature.hp}/${context.creature.maxHp} HP)`)
    } else if (hpPercent <= 50) {
      reminders.push(`⚠️ **${context.creature.name}** is bloodied (${context.creature.hp}/${context.creature.maxHp} HP)`)
    }

    // Active conditions
    if (context.conditions.length > 0) {
      const activeConditions = context.conditions.map(c => c.name).join(', ')
      reminders.push(`🔥 **Active Conditions**: ${activeConditions}`)
    }

    // Death saves reminder
    if (context.creature.hp <= 0 && context.creature.isPC) {
      reminders.push(`💀 **Death Saves Required** - Roll d20: 10+ success, 9- failure`)
    }

    // Legendary actions available
    if (isLegendaryCreature(context.creature)) {
      reminders.push(`⚡ **Legendary Actions Available** - Can act after enemy turns`)
    }

    // Reactions available
    if (context.creature.reactions && context.creature.reactions.length > 0) {
      const reactionNames = context.creature.reactions.map(r => r.name).join(', ')
      reminders.push(`🔄 **Reactions Available**: ${reactionNames}`)
    }

    if (reminders.length === 0) return null

    return {
      id: `turn_start_${context.creature.id}_${context.round}_${context.turnNumber}`,
      content: reminders.join('\n'),
      type: 'turn_start',
      urgency: hpPercent <= 25 ? 'critical' : hpPercent <= 50 ? 'high' : 'medium',
      displayDuration: 8000,
      position: 'turn-panel',
      timing: 'immediate',
      dismissible: true,
      context: {
        creatureId: context.creature.id,
        round: context.round,
        turn: context.turnNumber
      }
    }
  }

  // Generate condition-specific reminders
  private async generateConditionReminders(context: TurnContext): Promise<ReminderContent[]> {
    const reminders: ReminderContent[] = []

    context.conditions.forEach(condition => {
      const reminderContent: string[] = []

      // Condition effect reminders
      switch (condition.name.toLowerCase()) {
        case 'poisoned':
          reminderContent.push(`🤢 **Poisoned**: Disadvantage on attack rolls and ability checks`)
          break
        case 'restrained':
          reminderContent.push(`🕸️ **Restrained**: Speed 0, disadvantage on attack rolls, advantage for attackers`)
          break
        case 'stunned':
          reminderContent.push(`😵 **Stunned**: Incapacitated, can't move, fails Str/Dex saves, attackers have advantage`)
          break
        case 'paralyzed':
          reminderContent.push(`🧊 **Paralyzed**: Incapacitated, can't move/speak, fails Str/Dex saves, auto-crit if hit`)
          break
        case 'frightened':
          reminderContent.push(`😨 **Frightened**: Disadvantage on ability checks/attacks while source is in sight`)
          break
        case 'charmed':
          reminderContent.push(`😍 **Charmed**: Can't attack charmer, charmer has advantage on social interactions`)
          break
        case 'blinded':
          reminderContent.push(`👁️‍🗨️ **Blinded**: Auto-fail sight-based checks, disadvantage on attacks, advantage for attackers`)
          break
        case 'deafened':
          reminderContent.push(`🔇 **Deafened**: Auto-fail hearing-based checks`)
          break
        case 'invisible':
          reminderContent.push(`👻 **Invisible**: Advantage on attack rolls, disadvantage for attackers, hide as bonus action`)
          break
        case 'prone':
          reminderContent.push(`⬇️ **Prone**: Disadvantage on attack rolls, advantage for melee attackers, half movement to stand`)
          break
        default:
          if (condition.description) {
            reminderContent.push(`⚠️ **${condition.name}**: ${condition.description}`)
          }
      }

      // Duration warning
      if (condition.duration > 0 && condition.duration <= 2) {
        reminderContent.push(`⏰ **Ending Soon**: ${condition.duration} turn${condition.duration > 1 ? 's' : ''} remaining`)
      }

      if (reminderContent.length > 0) {
        reminders.push({
          id: `condition_${condition.id}_${context.round}`,
          content: reminderContent.join('\n'),
          type: 'condition_reminder',
          urgency: condition.duration <= 1 ? 'high' : 'medium',
          displayDuration: 6000,
          position: 'creature-card',
          timing: 'immediate',
          dismissible: true,
          targetCreature: context.creature.id
        })
      }
    })

    return reminders
  }

  // Generate tactical suggestions
  private async generateTacticalReminder(context: TurnContext): Promise<ReminderContent | null> {
    const suggestions: string[] = []

    // Low HP suggestions
    const hpPercent = (context.creature.hp / context.creature.maxHp) * 100
    if (hpPercent <= 25 && !context.creature.isPC) {
      suggestions.push(`🎯 **Tactical**: Consider desperate actions, retreat, or calling for help`)
    }

    // Positioning suggestions
    if (context.tacticalSituation.nearbyEnemies.length > 2) {
      suggestions.push(`🏃 **Positioning**: Surrounded! Consider movement or area effects`)
    }

    // Action economy suggestions
    if (isLegendaryCreature(context.creature)) {
      suggestions.push(`⚡ **Legendary**: Use legendary actions between player turns for maximum impact`)
    }

    // Environmental suggestions
    if (context.tacticalSituation.environmentalHazards.length > 0) {
      suggestions.push(`🗺️ **Environment**: Hazards present - ${context.tacticalSituation.environmentalHazards.join(', ')}`)
    }

    if (suggestions.length === 0) return null

    return {
      id: `tactical_${context.creature.id}_${context.round}`,
      content: suggestions.join('\n'),
      type: 'tactical_suggestion',
      urgency: 'low',
      displayDuration: 15000,
      position: 'floating',
      timing: 'delayed-1s',
      dismissible: true
    }
  }

  // Generate event-specific reminders
  private async generateEventReminders(event: PredictedEvent, context: EncounterContext): Promise<ReminderContent[]> {
    const reminders: ReminderContent[] = []

    switch (event.type) {
      case 'potential_death':
        if (event.creature) {
          const creature = context.creatures.find(c => c.id === event.creature)
          if (creature) {
            reminders.push(await this.generateDeathTriggerReminder(creature, event))
          }
        }
        break

      case 'condition_ending':
        reminders.push(await this.generateConditionEndingReminder(event))
        break

      case 'legendary_action_window':
        if (event.creature) {
          const creature = context.creatures.find(c => c.id === event.creature)
          if (creature && isLegendaryCreature(creature)) {
            reminders.push(await this.generateLegendaryActionReminder(creature))
          }
        }
        break

      case 'lair_action_trigger':
        reminders.push(await this.generateLairActionReminder(context))
        break
    }

    return reminders.filter(r => r !== null) as ReminderContent[]
  }

  // Generate death trigger reminders
  private async generateDeathTriggerReminder(creature: Combatant, event: PredictedEvent): Promise<ReminderContent> {
    const content: string[] = []

    content.push(`💀 **${creature.name}** is near death (${creature.hp}/${creature.maxHp} HP)`)

    // Check for death-triggered abilities
    if (creature.specialAbilities) {
      const deathTriggers = creature.specialAbilities.filter(ability =>
        ability.description.toLowerCase().includes('death') ||
        ability.description.toLowerCase().includes('die') ||
        ability.description.toLowerCase().includes('reduced to 0')
      )

      if (deathTriggers.length > 0) {
        content.push(`⚡ **Death Triggers**: ${deathTriggers.map(a => a.name).join(', ')}`)
      }
    }

    if (creature.isPC) {
      content.push(`🎲 **Death Saves**: Remember to roll death saves if reduced to 0 HP`)
    }

    return {
      id: `death_${creature.id}_${Date.now()}`,
      content: content.join('\n'),
      type: 'death_trigger',
      urgency: 'critical',
      displayDuration: 0, // Don't auto-hide
      position: 'center-alert',
      timing: 'immediate',
      dismissible: true
    }
  }

  // Generate condition ending reminder
  private async generateConditionEndingReminder(event: PredictedEvent): Promise<ReminderContent> {
    return {
      id: `condition_ending_${event.id}`,
      content: `⏰ **${event.condition}** will end this turn for ${event.creature}`,
      type: 'condition_reminder',
      urgency: 'medium',
      displayDuration: 5000,
      position: 'creature-card',
      timing: 'immediate',
      dismissible: true,
      targetCreature: event.creature
    }
  }

  // Generate legendary action reminder
  private async generateLegendaryActionReminder(creature: Combatant): Promise<ReminderContent> {
    const actions = creature.legendaryActions || []
    const actionNames = actions.map(a => `${a.name} (${a.cost || 1} action${(a.cost || 1) > 1 ? 's' : ''})`).join(', ')

    return {
      id: `legendary_${creature.id}_${Date.now()}`,
      content: `⚡ **Legendary Actions for ${creature.name}**\nAvailable: ${actionNames}`,
      type: 'legendary_actions',
      urgency: 'high',
      displayDuration: 10000,
      position: 'sidebar',
      timing: 'immediate',
      dismissible: true
    }
  }

  // Generate lair action reminder
  private async generateLairActionReminder(context: EncounterContext): Promise<ReminderContent> {
    const lairActionNames = context.lairActions.map(a => a.name).join(', ')

    return {
      id: `lair_actions_${context.round}`,
      content: `🏰 **Lair Actions on Initiative 20**\n${lairActionNames}`,
      type: 'lair_actions',
      urgency: 'critical',
      displayDuration: 0, // Don't auto-hide
      position: 'center-alert',
      timing: 'immediate',
      dismissible: true
    }
  }

  // Generate round-specific reminders
  private async generateRoundReminders(context: EncounterContext): Promise<ReminderContent[]> {
    const reminders: ReminderContent[] = []

    // Lair action reminder for initiative 20
    if (context.lairActions.length > 0) {
      reminders.push({
        id: `round_${context.round + 1}_lair`,
        content: `🏰 **Initiative Count 20**: Lair actions trigger`,
        type: 'lair_actions',
        urgency: 'high',
        displayDuration: 8000,
        position: 'round-header',
        timing: 'immediate',
        dismissible: true
      })
    }

    // Ongoing effects reminder
    const ongoingEffects = context.activeConditions.filter(c => c.duration === -1)
    if (ongoingEffects.length > 0) {
      const effectNames = ongoingEffects.map(e => e.name).join(', ')
      reminders.push({
        id: `round_${context.round + 1}_ongoing`,
        content: `🔄 **Ongoing Effects**: ${effectNames}`,
        type: 'environmental',
        urgency: 'low',
        displayDuration: 12000,
        position: 'sidebar',
        timing: 'delayed-1s',
        dismissible: true
      })
    }

    return reminders
  }

  // Helper methods
  private buildTurnContext(creature: Combatant, context: EncounterContext): TurnContext {
    const creatureConditions = context.activeConditions.filter(c => c.creature === creature.id)
    const recentActions = context.recentEvents.filter(e => e.creature === creature.id).slice(-3)
    const upcomingThreats = context.upcomingEvents.filter(e => e.creature === creature.id)

    return {
      creature,
      isPC: creature.isPC,
      turnNumber: context.currentTurn,
      round: context.round,
      conditions: creatureConditions,
      recentActions,
      upcomingThreats,
      tacticalSituation: this.buildTacticalContext(creature, context)
    }
  }

  private buildTacticalContext(creature: Combatant, context: EncounterContext): TacticalContext {
    return {
      nearbyEnemies: context.creatures.filter(c => c.isPC !== creature.isPC && c.hp > 0).map(c => c.name),
      nearbyAllies: context.creatures.filter(c => c.isPC === creature.isPC && c.id !== creature.id && c.hp > 0).map(c => c.name),
      environmentalHazards: context.environmentalFactors,
      availableActions: [...(creature.actions || []), ...(creature.reactions || [])],
      recommendedActions: [], // TODO: Implement AI-based recommendations
      strategicNotes: []
    }
  }

  private shouldGenerateTacticalSuggestions(creature: Combatant): boolean {
    // Generate tactical suggestions for non-PC creatures or when specifically enabled
    return !creature.isPC || (creature.isPC && creature.level && creature.level <= 5) // Help new players
  }

  private calculateDeathProbability(creature: Combatant): number {
    const hpPercent = creature.hp / creature.maxHp
    if (hpPercent <= 0.1) return 0.95
    if (hpPercent <= 0.2) return 0.8
    if (hpPercent <= 0.3) return 0.6
    return 0.3
  }

  // Fallback reminders when AI generation fails
  private generateFallbackReminders(context: EncounterContext): ReminderContent[] {
    const creature = context.creatures[context.currentTurn]
    if (!creature) return []

    return [{
      id: `fallback_${creature.id}_${context.round}`,
      content: `🎯 **${creature.name}'s Turn** - HP: ${creature.hp}/${creature.maxHp}`,
      type: 'turn_start',
      urgency: 'medium',
      displayDuration: 5000,
      position: 'turn-panel',
      timing: 'immediate',
      dismissible: true
    }]
  }

  private generateFallbackEventReminders(event: PredictedEvent): ReminderContent[] {
    return [{
      id: `fallback_${event.id}`,
      content: `⚠️ **Predicted Event**: ${event.type} (${Math.round(event.probability * 100)}% chance)`,
      type: 'environmental',
      urgency: 'low',
      displayDuration: 8000,
      position: 'sidebar',
      timing: 'delayed-1s',
      dismissible: true
    }]
  }

  // Background processing
  private startBackgroundProcessing() {
    setInterval(() => {
      if (!this.isProcessingQueue && this.preGenerationQueue.length > 0) {
        this.processPreGenerationQueue()
      }
    }, 2000) // Check every 2 seconds
  }

  private async processPreGenerationQueue() {
    this.isProcessingQueue = true

    try {
      while (this.preGenerationQueue.length > 0) {
        const request = this.preGenerationQueue.shift()!
        // TODO: Process pre-generation request
        await new Promise(resolve => setTimeout(resolve, 100)) // Small delay
      }
    } catch (error) {
      console.error('Error processing pre-generation queue:', error)
    } finally {
      this.isProcessingQueue = false
    }
  }

  // Public API
  public updateReminderBank(newBank: ReminderBank) {
    this.reminderBank = { ...this.reminderBank, ...newBank }
  }

  public getReminderBank(): ReminderBank {
    return { ...this.reminderBank }
  }

  public queuePreGeneration(request: PreGenerationRequest) {
    this.preGenerationQueue.push(request)
    this.preGenerationQueue.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
  }
}