import { Combatant } from '../../combat-tracker/types/combat.types'
import { EncounterContext, ReminderContent, ReminderType } from '../types/reminder.types'
import { ParsedLairAction, ParsedLegendaryAction } from './CreatureAbilityParser'

export interface InitiativeTiming {
  initiative: number
  creatureId?: string
  isLairAction: boolean
  isLegendaryActionWindow: boolean
  round: number
  reminderTypes: ReminderType[]
}

export interface InitiativeWindow {
  initiative: number
  triggers: InitiativeEvent[]
  round: number
}

export interface InitiativeEvent {
  type: 'creature_turn' | 'lair_action' | 'legendary_action_window'
  creatureId?: string
  reminderTypes: ReminderType[]
  data?: any
}

export class InitiativeTimingEngine {

  /**
   * Generate initiative timing for all events in a round
   * This creates the proper D&D 5e initiative order with lair actions and legendary action windows
   */
  static generateInitiativeOrder(context: EncounterContext): InitiativeWindow[] {
    const windows: InitiativeWindow[] = []

    // 1. Create creature turn windows
    const sortedCreatures = [...context.creatures]
      .filter(c => c.hp > 0) // Only living creatures
      .sort((a, b) => b.initiative - a.initiative) // Highest initiative first

    sortedCreatures.forEach(creature => {
      windows.push({
        initiative: creature.initiative,
        round: context.round,
        triggers: [{
          type: 'creature_turn',
          creatureId: creature.id,
          reminderTypes: this.getCreatureTurnReminderTypes(creature),
          data: { creature }
        }]
      })
    })

    // 2. Add lair action window (initiative 20, losing ties)
    if (context.lairActions.length > 0) {
      // Find if there's already an initiative 20 window
      let lairWindow = windows.find(w => w.initiative === 20)

      if (lairWindow) {
        // Add lair action to existing initiative 20 window (lair actions lose ties)
        lairWindow.triggers.push({
          type: 'lair_action',
          reminderTypes: ['lair_actions'],
          data: { lairActions: context.lairActions }
        })
      } else {
        // Create new initiative 20 window for lair actions
        windows.push({
          initiative: 20,
          round: context.round,
          triggers: [{
            type: 'lair_action',
            reminderTypes: ['lair_actions'],
            data: { lairActions: context.lairActions }
          }]
        })
      }
    }

    // 3. Add legendary action windows (after each non-legendary creature's turn)
    const legendaryCreatures = context.legendaryCreatures.filter(lc => lc.isActive)

    if (legendaryCreatures.length > 0) {
      // Add legendary action windows after each player character or non-legendary creature turn
      sortedCreatures.forEach(creature => {
        const isLegendaryCreature = legendaryCreatures.some(lc => lc.id === creature.id)

        if (!isLegendaryCreature || creature.isPC) {
          // Create a legendary action window immediately after this creature's turn
          const legendaryInitiative = creature.initiative - 0.1 // Slightly after creature's turn

          windows.push({
            initiative: legendaryInitiative,
            round: context.round,
            triggers: [{
              type: 'legendary_action_window',
              reminderTypes: ['legendary_actions'],
              data: {
                legendaryCreatures: legendaryCreatures.filter(lc => lc.legendaryActionsRemaining > 0),
                triggeringCreature: creature
              }
            }]
          })
        }
      })
    }

    // Sort all windows by initiative (highest first)
    return windows.sort((a, b) => b.initiative - a.initiative)
  }

  /**
   * Check what reminders should fire at the current initiative
   */
  static getRemindersForInitiative(
    context: EncounterContext,
    currentInitiative: number,
    exact: boolean = true
  ): ReminderContent[] {
    const reminders: ReminderContent[] = []
    const windows = this.generateInitiativeOrder(context)

    // Find matching windows
    const matchingWindows = exact
      ? windows.filter(w => w.initiative === currentInitiative)
      : windows.filter(w => Math.abs(w.initiative - currentInitiative) < 0.2)

    matchingWindows.forEach(window => {
      window.triggers.forEach(trigger => {
        switch (trigger.type) {
          case 'creature_turn':
            reminders.push(...this.createCreatureTurnReminders(trigger, context))
            break

          case 'lair_action':
            reminders.push(...this.createLairActionReminders(trigger, context))
            break

          case 'legendary_action_window':
            reminders.push(...this.createLegendaryActionReminders(trigger, context))
            break
        }
      })
    })

    return reminders
  }

  /**
   * Get the next initiative timing event
   */
  static getNextInitiativeEvent(context: EncounterContext, currentInitiative: number): InitiativeWindow | null {
    const windows = this.generateInitiativeOrder(context)

    // Find next window after current initiative
    const nextWindow = windows.find(w => w.initiative < currentInitiative)

    if (nextWindow) {
      return nextWindow
    }

    // If no more windows this round, return first window of next round
    if (windows.length > 0) {
      return {
        ...windows[0],
        round: context.round + 1
      }
    }

    return null
  }

  /**
   * Check if it's time for lair actions (initiative 20)
   */
  static isLairActionTime(context: EncounterContext, currentInitiative: number): boolean {
    return currentInitiative === 20 && context.lairActions.length > 0
  }

  /**
   * Check if it's time for legendary actions (after non-legendary creature turns)
   */
  static isLegendaryActionTime(
    context: EncounterContext,
    justFinishedCreatureId: string
  ): boolean {
    const justFinishedCreature = context.creatures.find(c => c.id === justFinishedCreatureId)
    if (!justFinishedCreature) return false

    // Check if the creature that just finished is not a legendary creature (or is a PC)
    const isLegendaryCreature = context.legendaryCreatures.some(lc => lc.id === justFinishedCreatureId)
    const hasActiveLegendaryCreatures = context.legendaryCreatures.some(lc =>
      lc.isActive && lc.legendaryActionsRemaining > 0
    )

    return (!isLegendaryCreature || justFinishedCreature.isPC) && hasActiveLegendaryCreatures
  }

  /**
   * Determine what reminder types should fire for a creature's turn
   */
  private static getCreatureTurnReminderTypes(creature: Combatant): ReminderType[] {
    const types: ReminderType[] = ['turn_start']

    // Add condition reminders if creature has conditions
    if (creature.conditions.length > 0) {
      types.push('condition_reminder')
    }

    // Add death trigger reminder if creature is critical
    if (creature.hp <= creature.maxHp * 0.25) {
      types.push('death_trigger')
    }

    // Add concentration check reminder if relevant
    const hasConcentrationSpell = creature.conditions.some(c =>
      c.description.toLowerCase().includes('concentration')
    )
    if (hasConcentrationSpell) {
      types.push('concentration_check')
    }

    return types
  }

  /**
   * Create reminders for creature turns
   */
  private static createCreatureTurnReminders(
    trigger: InitiativeEvent,
    context: EncounterContext
  ): ReminderContent[] {
    const creature = trigger.data?.creature as Combatant
    if (!creature) return []

    const reminders: ReminderContent[] = []

    // Turn start reminder
    const hpPercent = (creature.hp / creature.maxHp) * 100
    const urgency = hpPercent <= 25 ? 'critical' as const :
                   hpPercent <= 50 ? 'high' as const : 'medium' as const

    reminders.push({
      id: `turn_start_${creature.id}_${context.round}_${Date.now()}`,
      content: this.generateCreatureTurnContent(creature, context),
      type: 'turn_start',
      urgency,
      displayDuration: 8000,
      position: 'turn-panel',
      timing: 'immediate',
      dismissible: true,
      context: {
        creatureId: creature.id,
        round: context.round,
        initiative: creature.initiative
      }
    })

    return reminders
  }

  /**
   * Create reminders for lair actions
   */
  private static createLairActionReminders(
    trigger: InitiativeEvent,
    context: EncounterContext
  ): ReminderContent[] {
    const lairActions = trigger.data?.lairActions as ParsedLairAction[]
    if (!lairActions || lairActions.length === 0) return []

    const lairActionNames = lairActions.map(la => la.name).join(', ')

    return [{
      id: `lair_actions_${context.round}_${Date.now()}`,
      content: `🏰 **Initiative 20 - Lair Actions**\n\nAvailable: ${lairActionNames}\n\n⚠️ **Remember**: Lair actions lose initiative ties`,
      type: 'lair_actions',
      urgency: 'critical',
      displayDuration: 0, // Don't auto-hide
      position: 'center-alert',
      timing: 'immediate',
      dismissible: true,
      context: {
        round: context.round,
        initiative: 20,
        lairActions
      }
    }]
  }

  /**
   * Create reminders for legendary action windows
   */
  private static createLegendaryActionReminders(
    trigger: InitiativeEvent,
    context: EncounterContext
  ): ReminderContent[] {
    const legendaryCreatures = trigger.data?.legendaryCreatures as Array<{
      id: string
      name: string
      legendaryActionsRemaining: number
      actions: ParsedLegendaryAction[]
    }>

    const triggeringCreature = trigger.data?.triggeringCreature as Combatant

    if (!legendaryCreatures || legendaryCreatures.length === 0) return []

    const reminders: ReminderContent[] = []

    legendaryCreatures.forEach(creature => {
      if (creature.legendaryActionsRemaining > 0) {
        const actionsList = creature.actions
          .map(action => `${action.name} (${action.cost} action${action.cost > 1 ? 's' : ''})`)
          .join('\n')

        reminders.push({
          id: `legendary_${creature.id}_${context.round}_${Date.now()}`,
          content: `⚡ **Legendary Actions Available**\n\n**${creature.name}** has ${creature.legendaryActionsRemaining}/3 legendary actions\n\n**Available Actions:**\n${actionsList}\n\n*Triggered after ${triggeringCreature?.name}'s turn*`,
          type: 'legendary_actions',
          urgency: 'high',
          displayDuration: 12000,
          position: 'sidebar',
          timing: 'immediate',
          dismissible: true,
          context: {
            creatureId: creature.id,
            round: context.round,
            triggeringCreature: triggeringCreature?.id,
            actionsRemaining: creature.legendaryActionsRemaining
          }
        })
      }
    })

    return reminders
  }

  /**
   * Generate content for creature turn reminders
   */
  private static generateCreatureTurnContent(creature: Combatant, context: EncounterContext): string {
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

    // Active conditions
    if (creature.conditions.length > 0) {
      const conditionNames = creature.conditions.map(c => c.name).join(', ')
      content.push(`⚠️ **Conditions**: ${conditionNames}`)
    }

    // Special abilities reminder
    if (creature.specialAbilities && creature.specialAbilities.length > 0) {
      const turnStartAbilities = creature.specialAbilities.filter(ability =>
        ability.description.toLowerCase().includes('start of') ||
        ability.description.toLowerCase().includes('beginning of')
      )

      if (turnStartAbilities.length > 0) {
        content.push(`✨ **Turn Start**: ${turnStartAbilities.map(a => a.name).join(', ')}`)
      }
    }

    // Legendary actions if available
    if (creature.legendaryActions && creature.legendaryActions.length > 0) {
      content.push(`🦁 **Has Legendary Actions** (usable after enemy turns)`)
    }

    return content.join('\n')
  }

  /**
   * Get all creatures sorted by initiative order
   */
  static getInitiativeOrder(creatures: Combatant[]): Combatant[] {
    return [...creatures]
      .filter(c => c.hp > 0)
      .sort((a, b) => {
        if (a.initiative === b.initiative) {
          // Tie-breaker: PCs win ties, otherwise by name
          if (a.isPC && !b.isPC) return -1
          if (!a.isPC && b.isPC) return 1
          return a.name.localeCompare(b.name)
        }
        return b.initiative - a.initiative
      })
  }

  /**
   * Calculate when the next creature's turn will be
   */
  static getNextCreatureTurn(context: EncounterContext): { creature: Combatant; turnsUntil: number } | null {
    const initiativeOrder = this.getInitiativeOrder(context.creatures)
    const currentIndex = initiativeOrder.findIndex(c =>
      context.creatures[context.currentTurn]?.id === c.id
    )

    if (currentIndex === -1) return null

    const nextIndex = (currentIndex + 1) % initiativeOrder.length
    const nextCreature = initiativeOrder[nextIndex]
    const turnsUntil = nextIndex > currentIndex ? nextIndex - currentIndex :
                      (initiativeOrder.length - currentIndex) + nextIndex

    return { creature: nextCreature, turnsUntil }
  }
}