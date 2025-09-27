import React, { useState } from 'react'
import { ReminderPreferences, ReminderType, DisplayPosition } from '../types/reminder.types'

interface ReminderControlPanelProps {
  isEngineActive: boolean
  engineStatus: 'inactive' | 'active' | 'paused' | 'error'
  activeReminderCount: number
  criticalReminderCount: number
  onStartEngine: () => void
  onStopEngine: () => void
  onPauseEngine: () => void
  onResumeEngine: () => void
  onDismissAll: () => void
  onUpdatePreferences?: (preferences: Partial<ReminderPreferences>) => void
  className?: string
}

export const ReminderControlPanel: React.FC<ReminderControlPanelProps> = ({
  isEngineActive,
  engineStatus,
  activeReminderCount,
  criticalReminderCount,
  onStartEngine,
  onStopEngine,
  onPauseEngine,
  onResumeEngine,
  onDismissAll,
  onUpdatePreferences,
  className = ''
}) => {
  const [showSettings, setShowSettings] = useState(false)
  const [preferences, setPreferences] = useState<Partial<ReminderPreferences>>({
    enabledReminderTypes: [
      'turn_start',
      'condition_reminder',
      'death_trigger',
      'legendary_actions',
      'lair_actions'
    ],
    enablePredictiveGeneration: true,
    enableTacticalSuggestions: true,
    enableEnvironmentalReminders: true
  })

  const getStatusIcon = () => {
    switch (engineStatus) {
      case 'active': return '🟢'
      case 'paused': return '🟡'
      case 'error': return '🔴'
      case 'inactive': return '⚪'
      default: return '❓'
    }
  }

  const getStatusText = () => {
    switch (engineStatus) {
      case 'active': return 'Active'
      case 'paused': return 'Paused'
      case 'error': return 'Error'
      case 'inactive': return 'Inactive'
      default: return 'Unknown'
    }
  }

  const handlePreferenceChange = (key: keyof ReminderPreferences, value: any) => {
    const newPreferences = { ...preferences, [key]: value }
    setPreferences(newPreferences)
    onUpdatePreferences?.(newPreferences)
  }

  const handleReminderTypeToggle = (reminderType: ReminderType, enabled: boolean) => {
    const currentTypes = preferences.enabledReminderTypes || []
    const newTypes = enabled
      ? [...currentTypes, reminderType]
      : currentTypes.filter(type => type !== reminderType)

    handlePreferenceChange('enabledReminderTypes', newTypes)
  }

  return (
    <div className={`reminder-control-panel bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      {/* Main Control Header */}
      <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200 rounded-t-lg">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{getStatusIcon()}</span>
            <h3 className="text-sm font-semibold text-gray-700">
              DM Assistant
            </h3>
            <span className="text-xs text-gray-500">
              ({getStatusText()})
            </span>
          </div>

          {activeReminderCount > 0 && (
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-gray-600">
                {activeReminderCount} active
              </span>
              {criticalReminderCount > 0 && (
                <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-medium">
                  {criticalReminderCount} critical
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="text-gray-500 hover:text-gray-700 p-1 rounded"
            title="Settings"
          >
            ⚙️
          </button>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="p-4 space-y-3">
        <div className="flex items-center space-x-2">
          {!isEngineActive ? (
            <button
              onClick={onStartEngine}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded text-sm font-medium transition-colors"
            >
              🚀 Start Assistant
            </button>
          ) : (
            <>
              {engineStatus === 'paused' ? (
                <button
                  onClick={onResumeEngine}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded text-sm font-medium transition-colors"
                >
                  ▶️ Resume
                </button>
              ) : (
                <button
                  onClick={onPauseEngine}
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded text-sm font-medium transition-colors"
                >
                  ⏸️ Pause
                </button>
              )}
              <button
                onClick={onStopEngine}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded text-sm font-medium transition-colors"
              >
                ⏹️ Stop
              </button>
            </>
          )}
        </div>

        {activeReminderCount > 0 && (
          <button
            onClick={onDismissAll}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded text-sm font-medium transition-colors"
          >
            ✕ Dismiss All ({activeReminderCount})
          </button>
        )}
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Reminder Settings</h4>

          {/* Reminder Types */}
          <div className="mb-4">
            <h5 className="text-xs font-medium text-gray-600 mb-2">Active Reminder Types</h5>
            <div className="space-y-2">
              {REMINDER_TYPE_OPTIONS.map(option => (
                <label key={option.type} className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={preferences.enabledReminderTypes?.includes(option.type) || false}
                    onChange={(e) => handleReminderTypeToggle(option.type, e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-gray-700">{option.label}</span>
                  <span className="text-xs text-gray-500">({option.description})</span>
                </label>
              ))}
            </div>
          </div>

          {/* General Options */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={preferences.enablePredictiveGeneration || false}
                onChange={(e) => handlePreferenceChange('enablePredictiveGeneration', e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-gray-700">Predictive Generation</span>
              <span className="text-xs text-gray-500">(Generate reminders before needed)</span>
            </label>

            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={preferences.enableTacticalSuggestions || false}
                onChange={(e) => handlePreferenceChange('enableTacticalSuggestions', e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-gray-700">Tactical Suggestions</span>
              <span className="text-xs text-gray-500">(Combat strategy hints)</span>
            </label>

            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={preferences.enableEnvironmentalReminders || false}
                onChange={(e) => handlePreferenceChange('enableEnvironmentalReminders', e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-gray-700">Environmental Reminders</span>
              <span className="text-xs text-gray-500">(Hazards, terrain effects)</span>
            </label>
          </div>

          {/* Quick Actions */}
          <div className="mt-4 pt-3 border-t border-gray-200">
            <h5 className="text-xs font-medium text-gray-600 mb-2">Quick Actions</h5>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handlePreferenceChange('enabledReminderTypes', [])}
                className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 px-2 py-1 rounded"
              >
                Disable All
              </button>
              <button
                onClick={() => handlePreferenceChange('enabledReminderTypes', REMINDER_TYPE_OPTIONS.map(o => o.type))}
                className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded"
              >
                Enable All
              </button>
              <button
                onClick={() => handlePreferenceChange('enabledReminderTypes', ['turn_start', 'death_trigger', 'legendary_actions'])}
                className="text-xs bg-green-100 hover:bg-green-200 text-green-700 px-2 py-1 rounded"
              >
                Essential Only
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Manual Reminder Trigger Component
interface ManualTriggerPanelProps {
  onTrigger: (reminderType: string, creatureId?: string) => void
  creatures: Array<{ id: string; name: string }>
  className?: string
}

export const ManualTriggerPanel: React.FC<ManualTriggerPanelProps> = ({
  onTrigger,
  creatures,
  className = ''
}) => {
  const [selectedReminderType, setSelectedReminderType] = useState<string>('turn_start')
  const [selectedCreature, setSelectedCreature] = useState<string>('')

  const handleManualTrigger = () => {
    onTrigger(selectedReminderType, selectedCreature || undefined)
  }

  return (
    <div className={`manual-trigger-panel bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
      <h4 className="text-sm font-semibold text-gray-700 mb-3">Manual Reminder Trigger</h4>

      <div className="space-y-3">
        {/* Reminder Type Selection */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Reminder Type
          </label>
          <select
            value={selectedReminderType}
            onChange={(e) => setSelectedReminderType(e.target.value)}
            className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
          >
            {REMINDER_TYPE_OPTIONS.map(option => (
              <option key={option.type} value={option.type}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Creature Selection (Optional) */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Target Creature (Optional)
          </label>
          <select
            value={selectedCreature}
            onChange={(e) => setSelectedCreature(e.target.value)}
            className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
          >
            <option value="">All/General</option>
            {creatures.map(creature => (
              <option key={creature.id} value={creature.id}>
                {creature.name}
              </option>
            ))}
          </select>
        </div>

        {/* Trigger Button */}
        <button
          onClick={handleManualTrigger}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded text-sm font-medium transition-colors"
        >
          🔔 Trigger Reminder
        </button>
      </div>
    </div>
  )
}

// Reminder Type Options
const REMINDER_TYPE_OPTIONS: Array<{
  type: ReminderType
  label: string
  description: string
}> = [
  {
    type: 'turn_start',
    label: 'Turn Start',
    description: 'Beginning of creature turns'
  },
  {
    type: 'turn_end',
    label: 'Turn End',
    description: 'End of creature turns'
  },
  {
    type: 'round_start',
    label: 'Round Start',
    description: 'Beginning of combat rounds'
  },
  {
    type: 'condition_reminder',
    label: 'Conditions',
    description: 'Active condition effects'
  },
  {
    type: 'death_trigger',
    label: 'Death Events',
    description: 'Creature deaths and saves'
  },
  {
    type: 'legendary_actions',
    label: 'Legendary Actions',
    description: 'Legendary creature abilities'
  },
  {
    type: 'lair_actions',
    label: 'Lair Actions',
    description: 'Environment-based actions'
  },
  {
    type: 'concentration_check',
    label: 'Concentration',
    description: 'Spell concentration checks'
  },
  {
    type: 'environmental',
    label: 'Environmental',
    description: 'Hazards and terrain'
  },
  {
    type: 'tactical_suggestion',
    label: 'Tactical',
    description: 'Combat strategy hints'
  }
]

export default ReminderControlPanel