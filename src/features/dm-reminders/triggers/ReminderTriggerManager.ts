import {
  EncounterContext,
  StateChangeEvent,
  Trigger,
  ReminderContent,
  DisplayedReminder,
  TriggerCondition,
  ReminderBank,
  PredictedEvent
} from '../types/reminder.types'
import { ReminderAIAgent } from '../agents/ReminderAIAgent'

export interface TriggerManagerConfig {
  enablePredictiveTriggers: boolean
  triggerDelayMs: number
  maxConcurrentReminders: number
  intelligentGrouping: boolean
  contextAwareUrgency: boolean
}

export class ReminderTriggerManager {
  private reminderBank: ReminderBank = {}
  private activeReminders: DisplayedReminder[] = []
  private triggerQueue: QueuedTrigger[] = []
  private isProcessingQueue = false
  private config: TriggerManagerConfig

  constructor(config: Partial<TriggerManagerConfig> = {}) {
    this.config = {
      enablePredictiveTriggers: true,
      triggerDelayMs: 100,
      maxConcurrentReminders: 5,
      intelligentGrouping: true,
      contextAwareUrgency: true,
      ...config
    }

    this.startTriggerProcessor()
  }

  // Monitor game state changes and trigger appropriate reminders
  async onGameStateChange(
    oldState: EncounterContext,
    newState: EncounterContext,
    onDisplayReminder: (reminder: DisplayedReminder) => void
  ): Promise<void> {
    try {
      // Analyze state changes
      const stateChanges = this.analyzeStateChange(oldState, newState)

      // Generate triggers from state changes
      const triggers = this.generateTriggersFromStateChanges(stateChanges, newState)

      // Add predictive triggers if enabled
      if (this.config.enablePredictiveTriggers) {
        const predictiveTriggers = this.generatePredictiveTriggers(newState)
        triggers.push(...predictiveTriggers)
      }

      // Process triggers
      await this.processTriggers(triggers, newState, onDisplayReminder)

    } catch (error) {
      console.error('Error processing state change in trigger manager:', error)
    }
  }

  // Analyze the differences between two encounter contexts
  private analyzeStateChange(oldState: EncounterContext, newState: EncounterContext): StateChangeEvent[] {
    const changes: StateChangeEvent[] = []

    // Turn change
    if (oldState.currentTurn !== newState.currentTurn) {
      changes.push({
        type: 'turn_change',
        oldState: { currentTurn: oldState.currentTurn },
        newState: { currentTurn: newState.currentTurn },
        affectedCreatures: [newState.creatures[newState.currentTurn]?.id || ''],
        timestamp: Date.now()
      })
    }

    // Round change
    if (oldState.round !== newState.round) {
      changes.push({
        type: 'round_change',
        oldState: { round: oldState.round },
        newState: { round: newState.round },
        affectedCreatures: newState.creatures.map(c => c.id),
        timestamp: Date.now()
      })
    }

    // HP changes
    const hpChanges = this.detectHPChanges(oldState.creatures, newState.creatures)
    changes.push(...hpChanges)

    // Condition changes
    const conditionChanges = this.detectConditionChanges(oldState.activeConditions, newState.activeConditions)
    changes.push(...conditionChanges)

    // Creature deaths
    const deaths = this.detectDeaths(oldState.creatures, newState.creatures)
    changes.push(...deaths)

    // Combat state changes
    if (oldState.creatures.length !== newState.creatures.length) {
      changes.push({
        type: 'combat_start',
        oldState: { creatures: oldState.creatures },
        newState: { creatures: newState.creatures },
        affectedCreatures: newState.creatures.map(c => c.id),
        timestamp: Date.now()
      })
    }

    return changes
  }

  // Generate triggers from state changes
  private generateTriggersFromStateChanges(changes: StateChangeEvent[], context: EncounterContext): Trigger[] {
    const triggers: Trigger[] = []

    changes.forEach(change => {
      switch (change.type) {
        case 'turn_change':
          triggers.push(...this.generateTurnChangeTriggers(change, context))
          break
        case 'round_change':
          triggers.push(...this.generateRoundChangeTriggers(change, context))
          break
        case 'hp_change':
          triggers.push(...this.generateHPChangeTriggers(change, context))
          break
        case 'condition_change':
          triggers.push(...this.generateConditionChangeTriggers(change, context))
          break
        case 'creature_death':
          triggers.push(...this.generateDeathTriggers(change, context))
          break
        case 'combat_start':
          triggers.push(...this.generateCombatStartTriggers(change, context))
          break
      }
    })

    return triggers
  }

  // Generate turn change triggers
  private generateTurnChangeTriggers(change: StateChangeEvent, context: EncounterContext): Trigger[] {
    const triggers: Trigger[] = []
    const currentCreature = context.creatures[context.currentTurn]

    if (!currentCreature) return triggers

    // Main turn start trigger
    triggers.push({
      key: `turn_start_${currentCreature.id}_${context.round}`,
      urgency: this.calculateTurnUrgency(currentCreature, context),
      position: 'turn-panel',
      timing: 'immediate',
      conditions: [
        { type: 'creature_type', value: currentCreature.id, operator: 'eq' }
      ]
    })

    // Condition-specific triggers for current creature
    const creatureConditions = context.activeConditions.filter(c => c.creature === currentCreature.id)
    creatureConditions.forEach(condition => {
      triggers.push({
        key: `condition_turn_${condition.id}_${context.round}`,
        urgency: condition.duration <= 1 ? 'high' : 'medium',
        position: 'creature-card',
        timing: 'delayed-500ms',
        conditions: [
          { type: 'creature_type', value: currentCreature.id, operator: 'eq' }
        ]
      })
    })

    // Low HP warning
    const hpPercent = currentCreature.hp / currentCreature.maxHp
    if (hpPercent <= 0.25) {
      triggers.push({
        key: `low_hp_${currentCreature.id}_${context.round}`,
        urgency: hpPercent <= 0.1 ? 'critical' : 'high',
        position: 'center-alert',
        timing: 'immediate',
        conditions: [
          { type: 'hp_threshold', value: 0.25, operator: 'lte' }
        ]
      })
    }

    // Death save reminder for unconscious PCs
    if (currentCreature.hp <= 0 && currentCreature.isPC) {
      triggers.push({
        key: `death_save_${currentCreature.id}_${context.round}`,
        urgency: 'critical',
        position: 'center-alert',
        timing: 'immediate'
      })
    }

    return triggers
  }

  // Generate round change triggers
  private generateRoundChangeTriggers(change: StateChangeEvent, context: EncounterContext): Trigger[] {
    const triggers: Trigger[] = []

    // Main round start trigger
    triggers.push({
      key: `round_start_${context.round}`,
      urgency: 'medium',
      position: 'round-header',
      timing: 'immediate'
    })

    // Lair actions trigger (initiative 20)
    if (context.lairActions.length > 0) {
      triggers.push({
        key: `lair_actions_${context.round}`,
        urgency: 'critical',
        position: 'center-alert',
        timing: 'immediate'
      })
    }

    // Environmental effects trigger
    if (context.environmentalFactors.length > 0) {
      triggers.push({
        key: `environmental_${context.round}`,
        urgency: 'medium',
        position: 'sidebar',
        timing: 'delayed-1s'
      })
    }

    return triggers
  }

  // Generate HP change triggers
  private generateHPChangeTriggers(change: StateChangeEvent, context: EncounterContext): Trigger[] {
    const triggers: Trigger[] = []

    change.affectedCreatures.forEach(creatureId => {
      const creature = context.creatures.find(c => c.id === creatureId)
      if (!creature) return

      const hpPercent = creature.hp / creature.maxHp

      // Critical HP threshold
      if (hpPercent <= 0.25) {
        triggers.push({
          key: `hp_critical_${creatureId}`,
          urgency: hpPercent <= 0.1 ? 'critical' : 'high',
          position: 'creature-card',
          timing: 'immediate'
        })
      }

      // Bloodied threshold (50% HP)
      if (hpPercent <= 0.5 && hpPercent > 0.25) {
        triggers.push({
          key: `hp_bloodied_${creatureId}`,
          urgency: 'medium',
          position: 'creature-card',
          timing: 'delayed-500ms'
        })
      }

      // Check for concentration spells if damaged
      const concentrationConditions = context.activeConditions.filter(c =>
        c.creature === creatureId && (
          c.name.toLowerCase().includes('concentration') ||
          c.description.toLowerCase().includes('concentration')
        )
      )

      if (concentrationConditions.length > 0) {
        triggers.push({
          key: `concentration_check_${creatureId}`,
          urgency: 'high',
          position: 'creature-card',
          timing: 'immediate'
        })
      }
    })

    return triggers
  }

  // Generate condition change triggers
  private generateConditionChangeTriggers(change: StateChangeEvent, context: EncounterContext): Trigger[] {
    const triggers: Trigger[] = []

    change.affectedCreatures.forEach(creatureId => {
      const newConditions = context.activeConditions.filter(c => c.creature === creatureId)

      newConditions.forEach(condition => {
        triggers.push({
          key: `condition_applied_${condition.id}`,
          urgency: this.getConditionUrgency(condition.name),
          position: 'creature-card',
          timing: 'delayed-500ms'
        })

        // Condition expiring soon
        if (condition.duration > 0 && condition.duration <= 2) {
          triggers.push({
            key: `condition_expiring_${condition.id}`,
            urgency: condition.duration === 1 ? 'high' : 'medium',
            position: 'creature-card',
            timing: 'immediate'
          })
        }
      })
    })

    return triggers
  }

  // Generate death triggers
  private generateDeathTriggers(change: StateChangeEvent, context: EncounterContext): Trigger[] {
    const triggers: Trigger[] = []

    change.affectedCreatures.forEach(creatureId => {
      const creature = context.creatures.find(c => c.id === creatureId)
      if (!creature || creature.hp > 0) return

      triggers.push({
        key: `death_${creatureId}`,
        urgency: 'critical',
        position: 'center-alert',
        timing: 'immediate'
      })

      // Check for death-triggered abilities
      if (creature.specialAbilities) {
        const deathTriggers = creature.specialAbilities.filter(ability =>
          ability.description.toLowerCase().includes('death') ||
          ability.description.toLowerCase().includes('die')
        )

        if (deathTriggers.length > 0) {
          triggers.push({
            key: `death_abilities_${creatureId}`,
            urgency: 'critical',
            position: 'center-alert',
            timing: 'delayed-1s'
          })
        }
      }
    })

    return triggers
  }

  // Generate combat start triggers
  private generateCombatStartTriggers(change: StateChangeEvent, context: EncounterContext): Trigger[] {
    return [{
      key: `combat_start_${context.round}`,
      urgency: 'medium',
      position: 'round-header',
      timing: 'immediate'
    }]
  }

  // Generate predictive triggers based on upcoming events
  private generatePredictiveTriggers(context: EncounterContext): Trigger[] {
    const triggers: Trigger[] = []

    context.upcomingEvents.forEach(event => {
      if (event.probability >= 0.7) { // Only high-probability events
        switch (event.type) {
          case 'potential_death':
            triggers.push({
              key: `predicted_death_${event.creature}`,
              urgency: 'high',
              position: 'sidebar',
              timing: 'delayed-2s'
            })
            break

          case 'condition_ending':
            triggers.push({
              key: `predicted_condition_end_${event.condition}`,
              urgency: 'medium',
              position: 'creature-card',
              timing: 'delayed-1s'
            })
            break

          case 'legendary_action_window':
            triggers.push({
              key: `predicted_legendary_${event.creature}`,
              urgency: 'high',
              position: 'sidebar',
              timing: 'delayed-1s'
            })
            break
        }
      }
    })

    return triggers
  }

  // Process triggers and display reminders
  private async processTriggers(
    triggers: Trigger[],
    context: EncounterContext,
    onDisplayReminder: (reminder: DisplayedReminder) => void
  ): Promise<void> {
    // Group and prioritize triggers if intelligent grouping is enabled
    const processedTriggers = this.config.intelligentGrouping
      ? this.groupAndPrioritizeTriggers(triggers)
      : triggers

    // Queue triggers for processing
    processedTriggers.forEach(trigger => {
      this.queueTrigger(trigger, context, onDisplayReminder)
    })
  }

  // Queue a trigger for processing
  private queueTrigger(
    trigger: Trigger,
    context: EncounterContext,
    onDisplayReminder: (reminder: DisplayedReminder) => void
  ): void {
    const queuedTrigger: QueuedTrigger = {
      trigger,
      context,
      onDisplay: onDisplayReminder,
      queuedAt: Date.now()
    }

    // Insert in priority order
    const insertIndex = this.triggerQueue.findIndex(qt =>
      this.getTriggerPriority(qt.trigger) < this.getTriggerPriority(trigger)
    )

    if (insertIndex === -1) {
      this.triggerQueue.push(queuedTrigger)
    } else {
      this.triggerQueue.splice(insertIndex, 0, queuedTrigger)
    }
  }

  // Start the trigger processor
  private startTriggerProcessor(): void {
    setInterval(async () => {
      if (!this.isProcessingQueue && this.triggerQueue.length > 0) {
        await this.processTriggerQueue()
      }
    }, this.config.triggerDelayMs)
  }

  // Process the trigger queue
  private async processTriggerQueue(): Promise<void> {
    this.isProcessingQueue = true

    try {
      while (this.triggerQueue.length > 0 &&
             this.activeReminders.length < this.config.maxConcurrentReminders) {

        const queuedTrigger = this.triggerQueue.shift()!
        await this.processQueuedTrigger(queuedTrigger)

        // Small delay between processing triggers
        await new Promise(resolve => setTimeout(resolve, 50))
      }
    } catch (error) {
      console.error('Error processing trigger queue:', error)
    } finally {
      this.isProcessingQueue = false
    }
  }

  // Process a single queued trigger
  private async processQueuedTrigger(queuedTrigger: QueuedTrigger): Promise<void> {
    const { trigger, context, onDisplay } = queuedTrigger

    try {
      // Get reminder content from bank or generate dynamically
      let reminder = this.getReminderFromBank(trigger.key)

      if (!reminder) {
        reminder = await this.generateDynamicReminder(trigger, context)
      }

      if (reminder) {
        // Apply trigger timing
        const delay = this.getTimingDelay(trigger.timing)

        setTimeout(() => {
          const displayedReminder: DisplayedReminder = {
            ...reminder!,
            isVisible: true,
            startTime: Date.now(),
            urgency: this.config.contextAwareUrgency
              ? this.adjustUrgencyForContext(reminder!.urgency, context)
              : reminder!.urgency
          }

          this.activeReminders.push(displayedReminder)
          onDisplay(displayedReminder)
        }, delay)
      }
    } catch (error) {
      console.error('Error processing queued trigger:', error)
    }
  }

  // Helper methods
  private detectHPChanges(oldCreatures: any[], newCreatures: any[]): StateChangeEvent[] {
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

  private detectConditionChanges(oldConditions: any[], newConditions: any[]): StateChangeEvent[] {
    const changes: StateChangeEvent[] = []

    // Detect new conditions
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

    return changes
  }

  private detectDeaths(oldCreatures: any[], newCreatures: any[]): StateChangeEvent[] {
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

  private calculateTurnUrgency(creature: any, context: EncounterContext): 'low' | 'medium' | 'high' | 'critical' {
    const hpPercent = creature.hp / creature.maxHp
    const hasConditions = context.activeConditions.some(c => c.creature === creature.id)

    if (hpPercent <= 0.1) return 'critical'
    if (hpPercent <= 0.25 || (creature.isPC && hpPercent <= 0.5)) return 'high'
    if (hasConditions) return 'medium'
    return 'low'
  }

  private getConditionUrgency(conditionName: string): 'low' | 'medium' | 'high' | 'critical' {
    const criticalConditions = ['stunned', 'paralyzed', 'unconscious', 'dying']
    const highConditions = ['restrained', 'frightened', 'charmed', 'poisoned']

    const name = conditionName.toLowerCase()

    if (criticalConditions.some(c => name.includes(c))) return 'critical'
    if (highConditions.some(c => name.includes(c))) return 'high'
    return 'medium'
  }

  private groupAndPrioritizeTriggers(triggers: Trigger[]): Trigger[] {
    // Group similar triggers together and prioritize by urgency
    const grouped = new Map<string, Trigger[]>()

    triggers.forEach(trigger => {
      const group = this.getTriggerGroup(trigger)
      if (!grouped.has(group)) {
        grouped.set(group, [])
      }
      grouped.get(group)!.push(trigger)
    })

    // Flatten and sort by priority
    const result: Trigger[] = []
    grouped.forEach(group => {
      group.sort((a, b) => this.getTriggerPriority(b) - this.getTriggerPriority(a))
      result.push(...group)
    })

    return result
  }

  private getTriggerGroup(trigger: Trigger): string {
    if (trigger.key.includes('turn_start')) return 'turn'
    if (trigger.key.includes('condition')) return 'condition'
    if (trigger.key.includes('death')) return 'death'
    if (trigger.key.includes('hp')) return 'hp'
    return 'other'
  }

  private getTriggerPriority(trigger: Trigger): number {
    const urgencyPriority = { critical: 4, high: 3, medium: 2, low: 1 }
    return urgencyPriority[trigger.urgency]
  }

  private getReminderFromBank(key: string): ReminderContent | null {
    const reminders = this.reminderBank[key]
    return reminders?.[0] || null
  }

  private async generateDynamicReminder(trigger: Trigger, context: EncounterContext): Promise<ReminderContent | null> {
    // Use AI agent to generate reminder based on trigger context
    const reminderType = this.inferReminderType(trigger.key)
    const reminderContext = this.buildReminderContext(trigger, context)

    return await ReminderAIAgent.generateReminder(reminderType, reminderContext, trigger.urgency)
  }

  private inferReminderType(triggerKey: string): any {
    if (triggerKey.includes('turn_start')) return 'turn_start'
    if (triggerKey.includes('condition')) return 'condition_reminder'
    if (triggerKey.includes('death')) return 'death_trigger'
    if (triggerKey.includes('legendary')) return 'legendary_actions'
    if (triggerKey.includes('lair')) return 'lair_actions'
    return 'turn_start'
  }

  private buildReminderContext(trigger: Trigger, context: EncounterContext): Record<string, any> {
    const currentCreature = context.creatures[context.currentTurn]

    return {
      triggerKey: trigger.key,
      currentCreature: currentCreature?.name || 'Unknown',
      round: context.round,
      turn: context.currentTurn,
      activeConditions: context.activeConditions.length,
      environmentalFactors: context.environmentalFactors.join(', ')
    }
  }

  private getTimingDelay(timing: string): number {
    switch (timing) {
      case 'immediate': return 0
      case 'delayed-500ms': return 500
      case 'delayed-1s': return 1000
      case 'delayed-2s': return 2000
      default: return 0
    }
  }

  private adjustUrgencyForContext(
    baseUrgency: 'low' | 'medium' | 'high' | 'critical',
    context: EncounterContext
  ): 'low' | 'medium' | 'high' | 'critical' {
    // Increase urgency if combat is intense (low HP creatures, many conditions)
    const lowHPCount = context.creatures.filter(c => c.hp / c.maxHp <= 0.25).length
    const conditionCount = context.activeConditions.length

    if (lowHPCount >= 2 || conditionCount >= 5) {
      const urgencyMap = { low: 'medium', medium: 'high', high: 'critical', critical: 'critical' }
      return urgencyMap[baseUrgency] as 'low' | 'medium' | 'high' | 'critical'
    }

    return baseUrgency
  }

  // Public API
  public updateReminderBank(bank: ReminderBank): void {
    this.reminderBank = { ...this.reminderBank, ...bank }
  }

  public removeReminder(reminderId: string): void {
    this.activeReminders = this.activeReminders.filter(r => r.id !== reminderId)
  }

  public clearAllReminders(): void {
    this.activeReminders = []
    this.triggerQueue = []
  }

  public getActiveReminders(): DisplayedReminder[] {
    return [...this.activeReminders]
  }

  public getQueueSize(): number {
    return this.triggerQueue.length
  }
}

interface QueuedTrigger {
  trigger: Trigger
  context: EncounterContext
  onDisplay: (reminder: DisplayedReminder) => void
  queuedAt: number
}