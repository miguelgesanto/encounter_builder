import {
  EncounterContext,
  ReminderContent,
  ReminderType,
  DisplayPosition
} from '../types/reminder.types'
import { Combatant } from '../../combat-tracker/types/combat.types'
import { CreatureAbilityParser, ParsedCreatureAbilities } from '../utils/CreatureAbilityParser'
import { InitiativeTimingEngine } from '../utils/InitiativeTimingEngine'
import { ReminderAIAgent } from '../agents/ReminderAIAgent'

export interface SmartReminderOptions {
  useAI: boolean
  enablePredictive: boolean
  reminderTypes: ReminderType[]
  groupByType: boolean
}

export interface GroupedReminders {
  [key: string]: ReminderContent[]
}

export class SmartReminderEngine {
  private static readonly DEFAULT_OPTIONS: SmartReminderOptions = {
    useAI: true,
    enablePredictive: true,
    reminderTypes: [
      'turn_start',
      'legendary_actions',
      'lair_actions',
      'condition_reminder',
      'death_trigger'
    ],
    groupByType: true
  }

  /**
   * Generate reminders for the current combat state using proper D&D rules
   */
  static async generateReminders(
    context: EncounterContext,
    options: Partial<SmartReminderOptions> = {}
  ): Promise<ReminderContent[]> {
    const opts = { ...this.DEFAULT_OPTIONS, ...options }
    const reminders: ReminderContent[] = []

    // Get current creature
    const currentCreature = context.creatures[context.currentTurn]
    if (!currentCreature) return []

    // Parse creature abilities
    const parsedAbilities = CreatureAbilityParser.parseCreatureAbilities(currentCreature)

    // Generate turn-specific reminders
    if (opts.reminderTypes.includes('turn_start')) {
      const turnReminders = await this.generateTurnStartReminders(
        currentCreature,
        parsedAbilities,
        context,
        opts.useAI
      )
      reminders.push(...turnReminders)
    }

    // Generate lair action reminders (initiative 20)
    if (opts.reminderTypes.includes('lair_actions')) {
      const lairReminders = await this.generateLairActionReminders(context, opts.useAI)
      reminders.push(...lairReminders)
    }

    // Generate legendary action reminders (after non-legendary turns)
    if (opts.reminderTypes.includes('legendary_actions')) {
      const legendaryReminders = await this.generateLegendaryActionReminders(context, opts.useAI)
      reminders.push(...legendaryReminders)
    }

    // Generate condition reminders
    if (opts.reminderTypes.includes('condition_reminder')) {
      const conditionReminders = await this.generateConditionReminders(
        currentCreature,
        context,
        opts.useAI
      )
      reminders.push(...conditionReminders)
    }

    // Generate death trigger reminders
    if (opts.reminderTypes.includes('death_trigger')) {
      const deathReminders = await this.generateDeathTriggerReminders(
        currentCreature,
        parsedAbilities,
        context,
        opts.useAI
      )
      reminders.push(...deathReminders)
    }

    return reminders
  }

  /**
   * Generate reminders for a specific initiative value (proper D&D timing)
   */
  static async generateRemindersForInitiative(
    context: EncounterContext,
    initiative: number,
    options: Partial<SmartReminderOptions> = {}
  ): Promise<ReminderContent[]> {
    const opts = { ...this.DEFAULT_OPTIONS, ...options }

    // Use the initiative timing engine to get proper reminders
    return InitiativeTimingEngine.getRemindersForInitiative(context, initiative)
  }

  /**
   * Generate turn start reminders using parsed abilities
   */
  private static async generateTurnStartReminders(
    creature: Combatant,
    abilities: ParsedCreatureAbilities,
    context: EncounterContext,
    useAI: boolean
  ): Promise<ReminderContent[]> {
    const reminders: ReminderContent[] = []

    if (useAI) {
      // Use AI with parsed abilities
      const turnContext = this.buildTurnContext(creature, abilities, context)
      const aiReminder = await ReminderAIAgent.generateTurnReminder(turnContext)
      if (aiReminder) reminders.push(aiReminder)
    } else {
      // Generate structured reminder without AI
      const structuredReminder = this.generateStructuredTurnReminder(creature, abilities, context)
      if (structuredReminder) reminders.push(structuredReminder)
    }

    return reminders
  }

  /**
   * Generate lair action reminders (initiative 20)
   */
  private static async generateLairActionReminders(
    context: EncounterContext,
    useAI: boolean
  ): Promise<ReminderContent[]> {
    // Only generate if we're at initiative 20 and have lair actions
    if (!InitiativeTimingEngine.isLairActionTime(context, 20)) {
      return []
    }

    const reminders: ReminderContent[] = []

    if (context.lairActions.length > 0) {
      const lairActionNames = context.lairActions.map(action => action.name).join(', ')

      const reminder: ReminderContent = {
        id: `lair_actions_${context.round}_${Date.now()}`,
        content: `🏰 **Initiative 20 - Lair Actions**\n\n**Available Actions:**\n${lairActionNames}\n\n⚠️ **Remember:** Lair actions lose initiative ties`,
        type: 'lair_actions',
        urgency: 'critical',
        displayDuration: 0, // Don't auto-hide
        position: 'center-alert',
        timing: 'immediate',
        dismissible: true,
        context: {
          round: context.round,
          initiative: 20,
          lairActions: context.lairActions
        }
      }

      reminders.push(reminder)
    }

    return reminders
  }

  /**
   * Generate legendary action reminders (after non-legendary turns)
   */
  private static async generateLegendaryActionReminders(
    context: EncounterContext,
    useAI: boolean
  ): Promise<ReminderContent[]> {
    const reminders: ReminderContent[] = []

    // Check if we have active legendary creatures
    const activeLegendaryCreatures = context.legendaryCreatures.filter(lc =>
      lc.isActive && lc.legendaryActionsRemaining > 0
    )

    if (activeLegendaryCreatures.length === 0) return []

    // Generate reminders for each legendary creature
    activeLegendaryCreatures.forEach(legendaryCreature => {
      const creature = context.creatures.find(c => c.id === legendaryCreature.id)
      if (!creature) return

      const actionsList = legendaryCreature.actions
        .map(action => `${action.name} (${action.cost || 1} action${(action.cost || 1) > 1 ? 's' : ''})`)
        .join('\n')

      const reminder: ReminderContent = {
        id: `legendary_${legendaryCreature.id}_${context.round}_${Date.now()}`,
        content: `⚡ **Legendary Actions Available**\n\n**${legendaryCreature.name}**\nActions Remaining: ${legendaryCreature.legendaryActionsRemaining}/3\n\n**Available Actions:**\n${actionsList}`,
        type: 'legendary_actions',
        urgency: 'high',
        displayDuration: 12000,
        position: 'sidebar',
        timing: 'immediate',
        dismissible: true,
        context: {
          creatureId: legendaryCreature.id,
          round: context.round,
          actionsRemaining: legendaryCreature.legendaryActionsRemaining
        }
      }

      reminders.push(reminder)
    })

    return reminders
  }

  /**
   * Generate condition reminders
   */
  private static async generateConditionReminders(
    creature: Combatant,
    context: EncounterContext,
    useAI: boolean
  ): Promise<ReminderContent[]> {
    const reminders: ReminderContent[] = []

    creature.conditions.forEach(condition => {
      const content = this.generateConditionContent(condition)

      const reminder: ReminderContent = {
        id: `condition_${condition.id}_${context.round}`,
        content,
        type: 'condition_reminder',
        urgency: (condition.duration || 0) <= 1 ? 'high' : 'medium',
        displayDuration: 6000,
        position: 'creature-card',
        timing: 'immediate',
        dismissible: true,
        targetCreature: creature.id,
        context: {
          conditionId: condition.id,
          creatureId: creature.id,
          round: context.round
        }
      }

      reminders.push(reminder)
    })

    return reminders
  }

  /**
   * Generate death trigger reminders
   */
  private static async generateDeathTriggerReminders(
    creature: Combatant,
    abilities: ParsedCreatureAbilities,
    context: EncounterContext,
    useAI: boolean
  ): Promise<ReminderContent[]> {
    const reminders: ReminderContent[] = []

    // Only generate if creature is critical or has death triggers
    const isCritical = creature.hp <= creature.maxHp * 0.25
    const hasDeathTriggers = abilities.deathTriggers.length > 0

    if (!isCritical && !hasDeathTriggers) return []

    const content: string[] = []

    if (isCritical) {
      content.push(`💀 **${creature.name}** is critically wounded (${creature.hp}/${creature.maxHp} HP)`)

      if (creature.isPC) {
        content.push(`🎲 **Death Saves Required** if reduced to 0 HP`)
      }
    }

    if (hasDeathTriggers) {
      content.push(`⚡ **Death Triggers:**`)
      abilities.deathTriggers.forEach(trigger => {
        content.push(`• ${trigger.name}: ${trigger.effect}`)
      })
    }

    if (content.length > 0) {
      const reminder: ReminderContent = {
        id: `death_trigger_${creature.id}_${context.round}`,
        content: content.join('\n'),
        type: 'death_trigger',
        urgency: 'critical',
        displayDuration: 0, // Don't auto-hide
        position: 'center-alert',
        timing: 'immediate',
        dismissible: true,
        context: {
          creatureId: creature.id,
          round: context.round,
          deathTriggers: abilities.deathTriggers
        }
      }

      reminders.push(reminder)
    }

    return reminders
  }

  /**
   * Generate structured turn reminder without AI
   */
  private static generateStructuredTurnReminder(
    creature: Combatant,
    abilities: ParsedCreatureAbilities,
    context: EncounterContext
  ): ReminderContent | null {
    const content: string[] = []

    // Header
    content.push(`🎯 **${creature.name}'s Turn** (${creature.isPC ? 'PC' : 'NPC'})`)

    // HP status
    const hpPercent = (creature.hp / creature.maxHp) * 100
    if (hpPercent <= 25) {
      content.push(`💀 **Critical HP**: ${creature.hp}/${creature.maxHp} (${Math.round(hpPercent)}%)`)
    } else if (hpPercent <= 50) {
      content.push(`🩸 **Bloodied**: ${creature.hp}/${creature.maxHp} (${Math.round(hpPercent)}%)`)
    }

    // Turn start abilities
    const turnStartAbilities = abilities.turnStartAbilities.filter(a => a.trigger === 'turn_start')
    if (turnStartAbilities.length > 0) {
      content.push(`✨ **Turn Start**: ${turnStartAbilities.map(a => a.name).join(', ')}`)
    }

    // Regeneration
    if (abilities.regenerationAbilities.length > 0) {
      abilities.regenerationAbilities.forEach(regen => {
        if (regen.triggersOnTurnStart) {
          content.push(`🩹 **Regeneration**: ${regen.healingAmount} HP${regen.condition ? ` (${regen.condition})` : ''}`)
        }
      })
    }

    // Recharge abilities
    const availableRecharge = abilities.rechargeAbilities.filter(a => a.isAvailable)
    if (availableRecharge.length > 0) {
      content.push(`⚡ **Available**: ${availableRecharge.map(a => a.name).join(', ')}`)
    }

    // Conditions
    if (creature.conditions.length > 0) {
      const conditionNames = creature.conditions.map(c => c.name).join(', ')
      content.push(`⚠️ **Conditions**: ${conditionNames}`)
    }

    if (content.length <= 1) return null // Only header

    const urgency = hpPercent <= 25 ? 'critical' as const :
                   hpPercent <= 50 ? 'high' as const : 'medium' as const

    return {
      id: `structured_turn_${creature.id}_${context.round}`,
      content: content.join('\n'),
      type: 'turn_start',
      urgency,
      displayDuration: 8000,
      position: 'turn-panel',
      timing: 'immediate',
      dismissible: true,
      context: {
        creatureId: creature.id,
        round: context.round,
        abilities
      }
    }
  }

  /**
   * Build turn context for AI generation
   */
  private static buildTurnContext(
    creature: Combatant,
    abilities: ParsedCreatureAbilities,
    context: EncounterContext
  ): any {
    return {
      creature,
      isPC: creature.isPC,
      turnNumber: context.currentTurn,
      round: context.round,
      conditions: context.activeConditions.filter(c => c.creature === creature.id),
      recentActions: context.recentEvents.filter(e => e.creature === creature.id).slice(-3),
      upcomingThreats: context.upcomingEvents.filter(e => e.creature === creature.id),
      tacticalSituation: {
        nearbyEnemies: context.creatures.filter(c => c.isPC !== creature.isPC && c.hp > 0).map(c => c.name),
        nearbyAllies: context.creatures.filter(c => c.isPC === creature.isPC && c.id !== creature.id && c.hp > 0).map(c => c.name),
        environmentalHazards: context.environmentalFactors,
        availableActions: [...(creature.actions || []), ...(creature.reactions || [])],
        recommendedActions: [],
        strategicNotes: []
      },
      parsedAbilities: abilities
    }
  }

  /**
   * Generate condition content
   */
  private static generateConditionContent(condition: any): string {
    const content: string[] = []

    // Condition name and effect
    content.push(`⚠️ **${condition.name}**`)

    // Standard condition effects
    const effectMap: Record<string, string> = {
      'poisoned': 'Disadvantage on attack rolls and ability checks',
      'restrained': 'Speed 0, disadvantage on attack rolls, advantage for attackers',
      'stunned': 'Incapacitated, can\'t move, fails Str/Dex saves, attackers have advantage',
      'paralyzed': 'Incapacitated, can\'t move/speak, fails Str/Dex saves, auto-crit if hit',
      'frightened': 'Disadvantage on ability checks/attacks while source is in sight',
      'charmed': 'Can\'t attack charmer, charmer has advantage on social interactions',
      'blinded': 'Auto-fail sight-based checks, disadvantage on attacks, advantage for attackers',
      'deafened': 'Auto-fail hearing-based checks',
      'invisible': 'Advantage on attack rolls, disadvantage for attackers',
      'prone': 'Disadvantage on attack rolls, advantage for melee attackers, half movement to stand'
    }

    const effect = effectMap[condition.name.toLowerCase()]
    if (effect) {
      content.push(effect)
    } else if (condition.description) {
      content.push(condition.description)
    }

    // Duration
    if (condition.duration && condition.duration > 0) {
      content.push(`⏰ ${condition.duration} turn${condition.duration > 1 ? 's' : ''} remaining`)
    }

    return content.join('\n')
  }

  /**
   * Group reminders by type for better organization
   */
  static groupRemindersByType(reminders: ReminderContent[]): GroupedReminders {
    const grouped: GroupedReminders = {}

    reminders.forEach(reminder => {
      if (!grouped[reminder.type]) {
        grouped[reminder.type] = []
      }
      grouped[reminder.type].push(reminder)
    })

    return grouped
  }

  /**
   * Sort reminders by urgency and type priority
   */
  static sortRemindersByPriority(reminders: ReminderContent[]): ReminderContent[] {
    const urgencyOrder = { critical: 4, high: 3, medium: 2, low: 1 }
    const typeOrder: Record<ReminderType, number> = {
      death_trigger: 10,
      lair_actions: 9,
      legendary_actions: 8,
      turn_start: 7,
      condition_reminder: 6,
      concentration_check: 5,
      environmental: 4,
      tactical_suggestion: 3,
      turn_end: 2,
      round_start: 1
    }

    return [...reminders].sort((a, b) => {
      // First by urgency
      const urgencyDiff = urgencyOrder[b.urgency] - urgencyOrder[a.urgency]
      if (urgencyDiff !== 0) return urgencyDiff

      // Then by type priority
      return (typeOrder[b.type] || 0) - (typeOrder[a.type] || 0)
    })
  }
}