import {
  DisplayedReminder,
  EncounterContext,
  ReminderType,
  TurnContext,
  ReminderContent
} from '../types/reminder.types'
import { ReminderAIAgent } from '../agents/ReminderAIAgent'
import { ReminderCache } from '../cache/ReminderCache'
import { TriggerEngine } from '../triggers/TriggerEngine'
import { Combatant } from '../../combat-tracker/types/combat.types'

interface ReminderEngineConfig {
  enableCache: boolean
  enablePredictive: boolean
  maxConcurrentGenerations: number
  priorityTypes: ReminderType[]
}

interface GenerationRequest {
  type: ReminderType
  priority: number
  context: any
  urgent: boolean
}

export class ReminderEngine {
  private cache: ReminderCache
  private triggerEngine: TriggerEngine
  private config: ReminderEngineConfig
  private activeGenerations = new Set<string>()

  constructor(config: Partial<ReminderEngineConfig> = {}) {
    this.config = {
      enableCache: true,
      enablePredictive: false,
      maxConcurrentGenerations: 3,
      priorityTypes: ['death_trigger', 'legendary_actions', 'lair_actions', 'turn_start'],
      ...config
    }

    this.cache = new ReminderCache({
      maxSize: 100,
      ttlMs: 5 * 60 * 1000 // 5 minutes
    })

    this.triggerEngine = new TriggerEngine()
  }

  /**
   * Generate all contextual reminders for the current encounter state
   */
  async generateContextualReminders(context: EncounterContext): Promise<DisplayedReminder[]> {
    const requests = this.analyzeContext(context)
    const results = await this.processGenerationRequests(requests)

    return this.consolidateAndPrioritize(results)
  }

  /**
   * Analyze encounter context to determine what reminders are needed
   */
  private analyzeContext(context: EncounterContext): GenerationRequest[] {
    const requests: GenerationRequest[] = []
    const currentCreature = context.creatures[context.currentTurn]

    if (!currentCreature) return requests

    // 1. Death triggers (highest priority)
    if (this.isCreatureCritical(currentCreature)) {
      requests.push({
        type: 'death_trigger',
        priority: 100,
        context: { creature: currentCreature },
        urgent: true
      })
    }

    // 2. Lair actions (initiative 20)
    const maxInitiative = Math.max(...context.creatures.map(c => c.initiative))
    if (currentCreature.initiative === maxInitiative && context.lairActions.length > 0) {
      requests.push({
        type: 'lair_actions',
        priority: 90,
        context: { lairActions: context.lairActions, round: context.round },
        urgent: true
      })
    }

    // 3. Turn start reminders
    requests.push({
      type: 'turn_start',
      priority: 80,
      context: this.buildTurnContext(currentCreature, context),
      urgent: false
    })

    // 4. Legendary actions (for other creatures)
    context.legendaryCreatures
      .filter(lc => lc.isActive && lc.legendaryActionsRemaining > 0)
      .forEach(lc => {
        requests.push({
          type: 'legendary_actions',
          priority: 70,
          context: {
            creature: lc,
            actionsRemaining: lc.legendaryActionsRemaining,
            tacticalContext: this.buildTacticalContext(context)
          },
          urgent: false
        })
      })

    // 5. Condition reminders
    context.activeConditions
      .filter(condition => condition.creature === currentCreature.id)
      .forEach(condition => {
        requests.push({
          type: 'condition_reminder',
          priority: 60,
          context: {
            creatureName: currentCreature.name,
            condition,
            turnType: 'start'
          },
          urgent: condition.duration <= 1
        })
      })

    return requests.sort((a, b) => b.priority - a.priority)
  }

  /**
   * Process generation requests with concurrency control and caching
   */
  private async processGenerationRequests(requests: GenerationRequest[]): Promise<ReminderContent[]> {
    const results: ReminderContent[] = []
    const processing: Promise<ReminderContent | null>[] = []

    for (const request of requests) {
      // Check cache first
      if (this.config.enableCache) {
        const cacheKey = this.generateCacheKey(request)
        const cached = this.cache.get(cacheKey)
        if (cached) {
          results.push(cached)
          continue
        }
      }

      // Limit concurrent generations
      if (this.activeGenerations.size >= this.config.maxConcurrentGenerations) {
        await Promise.race(processing)
      }

      const generation = this.generateSingleReminder(request)
      processing.push(generation)
      this.activeGenerations.add(request.type)

      // Process urgent requests immediately
      if (request.urgent) {
        const result = await generation
        if (result) results.push(result)
        this.activeGenerations.delete(request.type)
      }
    }

    // Wait for remaining non-urgent generations
    const remainingResults = await Promise.allSettled(processing)
    remainingResults.forEach(result => {
      if (result.status === 'fulfilled' && result.value) {
        results.push(result.value)
      }
    })

    this.activeGenerations.clear()
    return results
  }

  /**
   * Generate a single reminder with error handling and caching
   */
  private async generateSingleReminder(request: GenerationRequest): Promise<ReminderContent | null> {
    try {
      const reminder = await ReminderAIAgent.generateReminder(
        request.type,
        request.context,
        request.urgent ? 'critical' : 'medium'
      )

      if (reminder && this.config.enableCache) {
        const cacheKey = this.generateCacheKey(request)
        this.cache.set(cacheKey, reminder)
      }

      return reminder
    } catch (error) {
      console.error(`Failed to generate ${request.type} reminder:`, error)
      return null
    }
  }

  /**
   * Consolidate similar reminders and prioritize by urgency
   */
  private consolidateAndPrioritize(reminders: ReminderContent[]): DisplayedReminder[] {
    // Group by type for potential consolidation
    const grouped = reminders.reduce((acc, reminder) => {
      if (!acc[reminder.type]) acc[reminder.type] = []
      acc[reminder.type].push(reminder)
      return acc
    }, {} as Record<ReminderType, ReminderContent[]>)

    const consolidated: DisplayedReminder[] = []

    // Process each type
    Object.entries(grouped).forEach(([type, typeReminders]) => {
      if (typeReminders.length === 1) {
        // Single reminder - convert directly
        consolidated.push(this.toDisplayedReminder(typeReminders[0]))
      } else {
        // Multiple reminders of same type - consolidate or separate based on type
        if (this.shouldConsolidate(type as ReminderType)) {
          const consolidatedReminder = this.consolidateReminders(typeReminders)
          consolidated.push(this.toDisplayedReminder(consolidatedReminder))
        } else {
          // Keep separate (e.g., legendary actions for different creatures)
          typeReminders.forEach(reminder => {
            consolidated.push(this.toDisplayedReminder(reminder))
          })
        }
      }
    })

    // Sort by urgency and timing
    return consolidated.sort((a, b) => {
      const urgencyOrder = { critical: 4, high: 3, medium: 2, low: 1 }
      const urgencyDiff = urgencyOrder[b.urgency] - urgencyOrder[a.urgency]
      if (urgencyDiff !== 0) return urgencyDiff

      // Secondary sort by type priority
      const typePriority = this.config.priorityTypes.indexOf(a.type)
      const bTypePriority = this.config.priorityTypes.indexOf(b.type)
      return typePriority - bTypePriority
    })
  }

  /**
   * Helper methods
   */
  private isCreatureCritical(creature: Combatant): boolean {
    return (creature.hp / creature.maxHp) <= 0.25 || creature.hp <= 0
  }

  private buildTurnContext(creature: Combatant, context: EncounterContext): TurnContext {
    return {
      creature,
      isPC: creature.isPC,
      turnNumber: context.currentTurn,
      round: context.round,
      conditions: context.activeConditions.filter(c => c.creature === creature.id),
      recentActions: [],
      upcomingThreats: [],
      tacticalSituation: {
        nearbyEnemies: context.creatures.filter(c => c.id !== creature.id && !c.isPC).map(c => c.name),
        nearbyAllies: context.creatures.filter(c => c.id !== creature.id && c.isPC).map(c => c.name),
        environmentalHazards: context.environmentalFactors,
        availableActions: creature.actions || [],
        recommendedActions: [],
        strategicNotes: []
      }
    }
  }

  private buildTacticalContext(context: EncounterContext): any {
    return {
      description: `Round ${context.round} combat situation`,
      lastPlayerAction: 'Unknown',
      threatLevel: 'medium'
    }
  }

  private generateCacheKey(request: GenerationRequest): string {
    return `${request.type}_${JSON.stringify(request.context)}`
  }

  private shouldConsolidate(type: ReminderType): boolean {
    return ['condition_reminder', 'environmental'].includes(type)
  }

  private consolidateReminders(reminders: ReminderContent[]): ReminderContent {
    const combined = {
      ...reminders[0],
      id: `consolidated_${Date.now()}`,
      content: reminders.map(r => r.content).join('\n\n'),
      urgency: reminders.reduce((max, r) => {
        const urgencyOrder = { critical: 4, high: 3, medium: 2, low: 1 }
        return urgencyOrder[r.urgency] > urgencyOrder[max] ? r.urgency : max
      }, 'low' as any)
    }
    return combined
  }

  private toDisplayedReminder(reminder: ReminderContent): DisplayedReminder {
    return {
      ...reminder,
      isVisible: true,
      startTime: Date.now(),
      autoHideTimer: reminder.displayDuration > 0 ?
        setTimeout(() => {}, reminder.displayDuration) : undefined
    }
  }
}