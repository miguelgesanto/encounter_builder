import { useState, useEffect, useCallback, useMemo } from 'react'
import { useDebounce } from '../../../shared/hooks/useDebounce'
import { useAsync } from '../../../shared/hooks/useAsync'
import { DisplayedReminder, ReminderType, EncounterContext } from '../types/reminder.types'
import { ReminderAIAgent } from '../agents/ReminderAIAgent'
import { ReminderEngine } from '../engine/ReminderEngine'
import { ReminderCache } from '../cache/ReminderCache'
import { Combatant } from '../../combat-tracker/types/combat.types'

interface UseAIRemindersConfig {
  enabled: boolean
  debounceMs?: number
  maxReminders?: number
  enableCache?: boolean
  enablePredictive?: boolean
}

interface UseAIRemindersResult {
  reminders: DisplayedReminder[]
  isGenerating: boolean
  error: Error | null
  stats: {
    cacheHitRate: number
    avgGenerationTime: number
    totalGenerated: number
  }
  actions: {
    generateReminders: (context: EncounterContext) => Promise<void>
    dismissReminder: (id: string) => void
    clearAll: () => void
    regenerate: () => void
  }
}

export const useAIReminders = (
  combatants: Combatant[],
  currentTurn: number,
  round: number,
  config: UseAIRemindersConfig = { enabled: true }
): UseAIRemindersResult => {
  const [reminders, setReminders] = useState<DisplayedReminder[]>([])
  const [stats, setStats] = useState({
    cacheHitRate: 0,
    avgGenerationTime: 0,
    totalGenerated: 0
  })

  // Debounce context changes to prevent excessive regeneration
  const debouncedContext = useDebounce(
    useMemo(() => ({ combatants, currentTurn, round }), [combatants, currentTurn, round]),
    config.debounceMs || 300
  )

  // Create stable encounter context
  const encounterContext = useMemo((): EncounterContext => {
    const currentCreature = combatants[currentTurn]

    return {
      currentTurn,
      round,
      creatures: combatants,
      activeConditions: combatants.flatMap(c =>
        c.conditions?.map(condition => ({
          id: `${c.id}_${condition.name}`,
          name: condition.name,
          creature: c.id,
          duration: 1, // TODO: Track actual duration
          description: condition.name
        })) || []
      ),
      legendaryCreatures: combatants
        .filter(c => c.legendaryActions && c.legendaryActions.length > 0)
        .map(c => ({
          id: c.id,
          name: c.name,
          legendaryActionsTotal: 3,
          legendaryActionsRemaining: c.legendaryActionsRemaining || 3,
          actions: c.legendaryActions || [],
          isActive: c.id !== currentCreature?.id
        })),
      lairActions: combatants
        .filter(c => c.lairActions && c.lairActions.length > 0)
        .flatMap(c => c.lairActions!.map(action => ({
          id: `${c.id}_${action.name}`,
          name: action.name,
          description: action.description,
          initiative: 20, // Standard lair action initiative
          environmentEffect: `${c.name}'s lair effect`
        }))),
      environmentalFactors: [],
      recentEvents: [],
      upcomingEvents: []
    }
  }, [combatants, currentTurn, round])

  // Async reminder generation with proper error handling
  const {
    execute: generateReminders,
    loading: isGenerating,
    error
  } = useAsync(
    useCallback(async (context: EncounterContext) => {
      if (!config.enabled) return []

      try {
        const startTime = performance.now()

        // Use ReminderEngine for intelligent generation
        const engine = new ReminderEngine({
          enableCache: config.enableCache ?? true,
          enablePredictive: config.enablePredictive ?? false,
          maxConcurrentGenerations: 3
        })

        const newReminders = await engine.generateContextualReminders(context)

        // Apply max reminders limit
        const limitedReminders = config.maxReminders
          ? newReminders.slice(0, config.maxReminders)
          : newReminders

        // Update stats
        const generationTime = performance.now() - startTime
        setStats(prev => ({
          cacheHitRate: ReminderCache.getHitRate(),
          avgGenerationTime: (prev.avgGenerationTime + generationTime) / 2,
          totalGenerated: prev.totalGenerated + limitedReminders.length
        }))

        setReminders(limitedReminders)
        return limitedReminders
      } catch (err) {
        console.error('Failed to generate AI reminders:', err)

        // Fallback to basic reminders if AI fails
        const basicReminders = await generateBasicReminders(context)
        setReminders(basicReminders)
        return basicReminders
      }
    }, [config])
  )

  // Auto-generate when context changes
  useEffect(() => {
    if (config.enabled && debouncedContext) {
      generateReminders(encounterContext)
    }
  }, [debouncedContext, encounterContext, generateReminders, config.enabled])

  // Auto-dismiss expired reminders
  useEffect(() => {
    const timer = setInterval(() => {
      setReminders(prev => prev.filter(reminder => {
        if (!reminder.displayDuration) return true
        const elapsed = Date.now() - reminder.startTime
        return elapsed < reminder.displayDuration
      }))
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Action handlers
  const dismissReminder = useCallback((id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id))
  }, [])

  const clearAll = useCallback(() => {
    setReminders([])
  }, [])

  const regenerate = useCallback(() => {
    generateReminders(encounterContext)
  }, [generateReminders, encounterContext])

  return {
    reminders,
    isGenerating,
    error,
    stats,
    actions: {
      generateReminders,
      dismissReminder,
      clearAll,
      regenerate
    }
  }
}

// Fallback basic reminder generation
async function generateBasicReminders(context: EncounterContext): Promise<DisplayedReminder[]> {
  const reminders: DisplayedReminder[] = []
  const currentCreature = context.creatures[context.currentTurn]

  if (!currentCreature) return reminders

  // Basic turn start reminder
  const turnContent = [`**${currentCreature.name}** - Turn ${context.currentTurn + 1}`]

  if (currentCreature.conditions && currentCreature.conditions.length > 0) {
    turnContent.push(`Conditions: ${currentCreature.conditions.map(c => c.name).join(', ')}`)
  }

  if (currentCreature.legendaryActions && currentCreature.legendaryActions.length > 0) {
    turnContent.push(`Legendary Actions: ${currentCreature.legendaryActionsRemaining || 3} remaining`)
  }

  reminders.push({
    id: `basic_turn_${Date.now()}`,
    content: turnContent.join('\n'),
    type: 'turn_start',
    urgency: 'medium',
    displayDuration: 8000,
    position: 'turn-panel',
    timing: 'immediate',
    dismissible: true,
    isVisible: true,
    startTime: Date.now()
  })

  return reminders
}