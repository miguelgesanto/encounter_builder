import React, { useState } from 'react'
import { CombatTracker } from '../../combat-tracker/components/CombatTracker'
import { useDMReminderEngine } from '../hooks/useDMReminderEngine'
import { useCombatStore } from '../../combat-tracker/store/combatStore'
import { ReminderOverlaySystem } from './ReminderOverlaySystem'
import { ReminderControlPanel, ManualTriggerPanel } from './ReminderControlPanel'
import { Combatant } from '../../combat-tracker/types/combat.types'
import { ReminderPreferences } from '../types/reminder.types'

interface EnhancedCombatTrackerProps {
  onOpenHPModal?: (combatant: Combatant, event: React.MouseEvent) => void
  onSelectCombatant?: (combatant: Combatant) => void
  selectedCombatantId?: string
  className?: string
}

/**
 * Enhanced Combat Tracker with integrated DM Reminder System
 *
 * This component wraps the existing CombatTracker with intelligent DM reminders
 * that provide contextual assistance during combat encounters.
 */
export const EnhancedCombatTracker: React.FC<EnhancedCombatTrackerProps> = ({
  onOpenHPModal,
  onSelectCombatant,
  selectedCombatantId,
  className = ''
}) => {
  const combatState = useCombatStore()
  const [showControls, setShowControls] = useState(true)
  const [reminderPreferences, setReminderPreferences] = useState<Partial<ReminderPreferences>>({})

  // Initialize DM Reminder Engine with user preferences
  const reminderEngine = useDMReminderEngine(reminderPreferences)

  // Handle reminder display
  const handleDisplayReminder = (reminder: any) => {
    // Reminder is automatically handled by the overlay system
    console.log('Displaying reminder:', reminder.type, reminder.content.substring(0, 50) + '...')
  }

  // Handle reminder preferences update
  const handlePreferencesUpdate = (newPreferences: Partial<ReminderPreferences>) => {
    setReminderPreferences(prev => ({
      ...prev,
      ...newPreferences
    }))
    reminderEngine.updatePreferences(newPreferences)
  }

  // Handle manual reminder trigger
  const handleManualTrigger = (reminderType: string, creatureId?: string) => {
    reminderEngine.manualTrigger(reminderType, creatureId)
  }

  // Enhanced creature data with reminder markers
  const creaturesWithReminderData = combatState.combatants.map(creature => ({
    ...creature,
    'data-creature-id': creature.id // For reminder positioning
  }))

  return (
    <div className={`enhanced-combat-tracker relative ${className}`}>
      {/* DM Control Panel */}
      {showControls && (
        <div className="mb-4 space-y-4">
          <div className="flex items-start gap-4">
            {/* Main Control Panel */}
            <div className="flex-1">
              <ReminderControlPanel
                isEngineActive={reminderEngine.isEngineActive}
                engineStatus={reminderEngine.engineStatus}
                activeReminderCount={reminderEngine.activeReminders.length}
                criticalReminderCount={reminderEngine.criticalReminders.length}
                onStartEngine={reminderEngine.startEngine}
                onStopEngine={reminderEngine.stopEngine}
                onPauseEngine={reminderEngine.pauseEngine}
                onResumeEngine={reminderEngine.resumeEngine}
                onDismissAll={reminderEngine.dismissAll}
                onUpdatePreferences={handlePreferencesUpdate}
              />
            </div>

            {/* Manual Trigger Panel */}
            <div className="w-80">
              <ManualTriggerPanel
                onTrigger={handleManualTrigger}
                creatures={creaturesWithReminderData.map(c => ({ id: c.id, name: c.name }))}
              />
            </div>
          </div>

          {/* Toggle Button */}
          <button
            onClick={() => setShowControls(false)}
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
          >
            <span>Hide DM Controls</span>
            <span>↑</span>
          </button>
        </div>
      )}

      {/* Show Controls Toggle (when hidden) */}
      {!showControls && (
        <button
          onClick={() => setShowControls(true)}
          className="mb-4 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded flex items-center gap-2"
        >
          <span>🧠</span>
          <span>Show DM Assistant ({reminderEngine.activeReminders.length} active)</span>
          <span>↓</span>
        </button>
      )}

      {/* Original Combat Tracker */}
      <div className="combat-tracker-container">
        <CombatTracker
          onOpenHPModal={onOpenHPModal}
          onSelectCombatant={onSelectCombatant}
          selectedCombatantId={selectedCombatantId}
        />
      </div>

      {/* Reminder Overlay System */}
      <ReminderOverlaySystem
        reminders={reminderEngine.activeReminders}
        onDismiss={reminderEngine.dismissReminder}
        onDismissAll={reminderEngine.dismissAll}
      />

      {/* Engine Status Indicator */}
      {reminderEngine.engineStatus !== 'inactive' && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className={`
            px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2
            ${reminderEngine.engineStatus === 'active' ? 'bg-green-100 text-green-700' :
              reminderEngine.engineStatus === 'paused' ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'}
          `}>
            <span>
              {reminderEngine.engineStatus === 'active' ? '🟢' :
               reminderEngine.engineStatus === 'paused' ? '🟡' : '🔴'}
            </span>
            <span>DM Assistant {reminderEngine.engineStatus}</span>
            {reminderEngine.activeReminders.length > 0 && (
              <span className="bg-white bg-opacity-50 px-1 rounded">
                {reminderEngine.activeReminders.length}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Predictive Reminders Preview */}
      {reminderEngine.upcomingReminders.length > 0 && (
        <div className="fixed bottom-20 right-4 z-30 max-w-sm">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 shadow-sm">
            <h4 className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-1">
              <span>🔮</span>
              <span>Upcoming Reminders</span>
            </h4>
            <div className="space-y-1">
              {reminderEngine.upcomingReminders.slice(0, 3).map((reminder, index) => (
                <div key={index} className="text-xs text-blue-700">
                  {reminder.type.replace('_', ' ')}: {reminder.content.substring(0, 40)}...
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Context Information (Debug Mode) */}
      {process.env.NODE_ENV === 'development' && reminderEngine.currentContext && (
        <div className="fixed bottom-4 left-4 z-30 max-w-xs bg-gray-100 border border-gray-300 rounded p-2 text-xs">
          <div className="font-medium">Context Debug</div>
          <div>Round: {reminderEngine.currentContext.round}</div>
          <div>Turn: {reminderEngine.currentContext.currentTurn + 1}</div>
          <div>Creatures: {reminderEngine.currentContext.creatures.length}</div>
          <div>Conditions: {reminderEngine.currentContext.activeConditions.length}</div>
          <div>Predictions: {reminderEngine.predictions.length}</div>
          <div>Hash: {reminderEngine.lastContextHash.substring(0, 8)}...</div>
        </div>
      )}
    </div>
  )
}

// Higher-order component to easily add reminder functionality to any combat interface
export const withDMReminders = <P extends object>(
  Component: React.ComponentType<P>
) => {
  return (props: P & { enableReminders?: boolean }) => {
    const { enableReminders = true, ...componentProps } = props

    if (!enableReminders) {
      return <Component {...(componentProps as P)} />
    }

    return (
      <EnhancedCombatTracker>
        <Component {...(componentProps as P)} />
      </EnhancedCombatTracker>
    )
  }
}

// Context provider for reminder system configuration
interface ReminderSystemContextValue {
  isEnabled: boolean
  preferences: ReminderPreferences
  updatePreferences: (preferences: Partial<ReminderPreferences>) => void
}

export const ReminderSystemContext = React.createContext<ReminderSystemContextValue | null>(null)

export const ReminderSystemProvider: React.FC<{
  children: React.ReactNode
  initialPreferences?: Partial<ReminderPreferences>
}> = ({ children, initialPreferences = {} }) => {
  const [isEnabled, setIsEnabled] = useState(true)
  const [preferences, setPreferences] = useState<ReminderPreferences>({
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
      death_trigger: 0,
      legendary_actions: 10000,
      lair_actions: 0,
      concentration_check: 8000,
      environmental: 12000,
      tactical_suggestion: 15000
    },
    enablePredictiveGeneration: true,
    maxCachedReminders: 50,
    enableTacticalSuggestions: true,
    enableEnvironmentalReminders: true,
    ...initialPreferences
  })

  const updatePreferences = (newPreferences: Partial<ReminderPreferences>) => {
    setPreferences(prev => ({ ...prev, ...newPreferences }))
  }

  const contextValue: ReminderSystemContextValue = {
    isEnabled,
    preferences,
    updatePreferences
  }

  return (
    <ReminderSystemContext.Provider value={contextValue}>
      {children}
    </ReminderSystemContext.Provider>
  )
}

// Hook to use reminder system context
export const useReminderSystem = () => {
  const context = React.useContext(ReminderSystemContext)
  if (!context) {
    throw new Error('useReminderSystem must be used within a ReminderSystemProvider')
  }
  return context
}

export default EnhancedCombatTracker