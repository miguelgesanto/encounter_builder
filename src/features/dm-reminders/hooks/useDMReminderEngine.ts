import { useEffect, useState, useCallback, useRef } from 'react'
import { useCombatStore } from '../../combat-tracker/store/combatStore'
import {
  EncounterContext,
  DisplayedReminder,
  ReminderContent,
  StateChangeEvent,
  PredictedEvent,
  ReminderBank,
  ReminderPreferences,
  ContextSnapshot
} from '../types/reminder.types'
import { ContextAnalyzer } from '../utils/ContextAnalyzer'

interface DMReminderEngineState {
  currentContext: EncounterContext | null
  activeReminders: DisplayedReminder[]
  reminderBank: ReminderBank
  isEngineActive: boolean
  lastContextHash: string
  predictions: PredictedEvent[]
}

interface DMReminderEngineActions {
  startEngine: () => void
  stopEngine: () => void
  pauseEngine: () => void
  resumeEngine: () => void
  dismissReminder: (reminderId: string) => void
  dismissAll: () => void
  manualTrigger: (reminderType: string, creatureId?: string) => void
  updatePreferences: (preferences: Partial<ReminderPreferences>) => void
}

export interface DMReminderEngineHook extends DMReminderEngineState, DMReminderEngineActions {
  // Computed values
  criticalReminders: DisplayedReminder[]
  upcomingReminders: ReminderContent[]
  engineStatus: 'inactive' | 'active' | 'paused' | 'error'
}

const defaultPreferences: ReminderPreferences = {
  enabledReminderTypes: [
    'turn_start',
    'condition_reminder',
    'death_trigger',
    'legendary_actions',
    'lair_actions'
  ],
  displayPositions: {
    turn_start: 'turn-panel',
    turn_end: 'turn-panel',
    round_start: 'round-header',
    condition_reminder: 'creature-card',
    death_trigger: 'center-alert',
    legendary_actions: 'sidebar',
    lair_actions: 'center-alert',
    concentration_check: 'creature-card',
    environmental: 'sidebar',
    tactical_suggestion: 'floating'
  },
  urgencyThresholds: {
    turn_start: 'medium',
    turn_end: 'low',
    round_start: 'high',
    condition_reminder: 'medium',
    death_trigger: 'critical',
    legendary_actions: 'high',
    lair_actions: 'critical',
    concentration_check: 'high',
    environmental: 'medium',
    tactical_suggestion: 'low'
  },
  autoHideDurations: {
    turn_start: 8000,
    turn_end: 3000,
    round_start: 5000,
    condition_reminder: 6000,
    death_trigger: 0, // Don't auto-hide
    legendary_actions: 10000,
    lair_actions: 0, // Don't auto-hide
    concentration_check: 8000,
    environmental: 12000,
    tactical_suggestion: 15000
  },
  enablePredictiveGeneration: true,
  maxCachedReminders: 50,
  enableTacticalSuggestions: true,
  enableEnvironmentalReminders: true
}

export const useDMReminderEngine = (preferences: Partial<ReminderPreferences> = {}): DMReminderEngineHook => {
  // Get combat store state
  const combatState = useCombatStore()

  // Engine state
  const [state, setState] = useState<DMReminderEngineState>({
    currentContext: null,
    activeReminders: [],
    reminderBank: {},
    isEngineActive: false,
    lastContextHash: '',
    predictions: []
  })

  // Engine preferences
  const [enginePreferences] = useState<ReminderPreferences>({
    ...defaultPreferences,
    ...preferences
  })

  // Refs for cleanup and performance
  const contextAnalysisTimer = useRef<NodeJS.Timeout>()
  const reminderDisplayTimers = useRef<Map<string, NodeJS.Timeout>>(new Map())
  const previousContext = useRef<EncounterContext | null>(null)

  // Convert combat state to encounter context
  const updateContext = useCallback(() => {
    if (!state.isEngineActive) return

    try {
      const newContext = ContextAnalyzer.combatStateToContext(combatState)
      const newContextHash = ContextAnalyzer.generateContextHash(newContext)

      // Only update if context actually changed
      if (newContextHash !== state.lastContextHash) {
        const oldContext = previousContext.current

        setState(prevState => ({
          ...prevState,
          currentContext: newContext,
          lastContextHash: newContextHash,
          predictions: newContext.upcomingEvents
        }))

        // Analyze state changes if we have a previous context
        if (oldContext) {
          const changes = ContextAnalyzer.analyzeStateChange(oldContext, newContext)
          handleStateChanges(changes, newContext)
        }

        previousContext.current = newContext
      }
    } catch (error) {
      console.error('Error updating reminder context:', error)
    }
  }, [combatState, state.isEngineActive, state.lastContextHash])

  // Handle state changes and trigger reminders
  const handleStateChanges = useCallback((changes: StateChangeEvent[], context: EncounterContext) => {
    const triggers = ContextAnalyzer.generateTriggersFromChanges(changes)

    triggers.forEach(trigger => {
      const reminders = state.reminderBank[trigger.key] || []
      reminders.forEach(reminder => {
        if (enginePreferences.enabledReminderTypes.includes(reminder.type)) {
          displayReminder(reminder, trigger.timing)
        }
      })
    })
  }, [state.reminderBank, enginePreferences])

  // Display a reminder with proper timing
  const displayReminder = useCallback((reminder: ReminderContent, timing: string) => {
    const delay = timing === 'immediate' ? 0 :
                  timing === 'delayed-500ms' ? 500 :
                  timing === 'delayed-1s' ? 1000 :
                  timing === 'delayed-2s' ? 2000 : 0

    setTimeout(() => {
      const displayedReminder: DisplayedReminder = {
        ...reminder,
        isVisible: true,
        startTime: Date.now()
      }

      setState(prevState => ({
        ...prevState,
        activeReminders: [...prevState.activeReminders, displayedReminder]
      }))

      // Set auto-hide timer if configured
      const autoHideDuration = enginePreferences.autoHideDurations[reminder.type]
      if (autoHideDuration > 0) {
        const hideTimer = setTimeout(() => {
          dismissReminder(reminder.id)
        }, autoHideDuration)

        reminderDisplayTimers.current.set(reminder.id, hideTimer)
      }
    }, delay)
  }, [enginePreferences])

  // Actions
  const startEngine = useCallback(() => {
    setState(prevState => ({
      ...prevState,
      isEngineActive: true
    }))
  }, [])

  const stopEngine = useCallback(() => {
    setState(prevState => ({
      ...prevState,
      isEngineActive: false,
      activeReminders: [],
      currentContext: null
    }))

    // Clear all timers
    reminderDisplayTimers.current.forEach(timer => clearTimeout(timer))
    reminderDisplayTimers.current.clear()

    if (contextAnalysisTimer.current) {
      clearInterval(contextAnalysisTimer.current)
    }
  }, [])

  const pauseEngine = useCallback(() => {
    setState(prevState => ({
      ...prevState,
      isEngineActive: false
    }))
  }, [])

  const resumeEngine = useCallback(() => {
    setState(prevState => ({
      ...prevState,
      isEngineActive: true
    }))
  }, [])

  const dismissReminder = useCallback((reminderId: string) => {
    setState(prevState => ({
      ...prevState,
      activeReminders: prevState.activeReminders.filter(r => r.id !== reminderId)
    }))

    // Clear associated timer
    const timer = reminderDisplayTimers.current.get(reminderId)
    if (timer) {
      clearTimeout(timer)
      reminderDisplayTimers.current.delete(reminderId)
    }
  }, [])

  const dismissAll = useCallback(() => {
    setState(prevState => ({
      ...prevState,
      activeReminders: []
    }))

    // Clear all timers
    reminderDisplayTimers.current.forEach(timer => clearTimeout(timer))
    reminderDisplayTimers.current.clear()
  }, [])

  const manualTrigger = useCallback((reminderType: string, creatureId?: string) => {
    // TODO: Implement manual reminder triggering
    console.log('Manual trigger requested:', { reminderType, creatureId })
  }, [])

  const updatePreferences = useCallback((newPreferences: Partial<ReminderPreferences>) => {
    // TODO: Update preferences and persist them
    console.log('Updating preferences:', newPreferences)
  }, [])

  // Effects

  // Monitor combat state changes
  useEffect(() => {
    if (state.isEngineActive) {
      updateContext()
    }
  }, [
    combatState.currentTurn,
    combatState.round,
    combatState.combatants,
    combatState.isActive,
    updateContext
  ])

  // Set up context analysis interval
  useEffect(() => {
    if (state.isEngineActive) {
      contextAnalysisTimer.current = setInterval(updateContext, 1000)
      return () => {
        if (contextAnalysisTimer.current) {
          clearInterval(contextAnalysisTimer.current)
        }
      }
    }
  }, [state.isEngineActive, updateContext])

  // Auto-start engine when combat starts
  useEffect(() => {
    if (combatState.isActive && !state.isEngineActive) {
      startEngine()
    } else if (!combatState.isActive && state.isEngineActive) {
      stopEngine()
    }
  }, [combatState.isActive, state.isEngineActive, startEngine, stopEngine])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopEngine()
    }
  }, [stopEngine])

  // Computed values
  const criticalReminders = state.activeReminders.filter(r => r.urgency === 'critical')
  const upcomingReminders: ReminderContent[] = [] // TODO: Implement based on predictions

  const engineStatus = !state.isEngineActive ? 'inactive' :
                      combatState.isPaused ? 'paused' :
                      'active'

  return {
    // State
    currentContext: state.currentContext,
    activeReminders: state.activeReminders,
    reminderBank: state.reminderBank,
    isEngineActive: state.isEngineActive,
    lastContextHash: state.lastContextHash,
    predictions: state.predictions,

    // Actions
    startEngine,
    stopEngine,
    pauseEngine,
    resumeEngine,
    dismissReminder,
    dismissAll,
    manualTrigger,
    updatePreferences,

    // Computed
    criticalReminders,
    upcomingReminders,
    engineStatus
  }
}