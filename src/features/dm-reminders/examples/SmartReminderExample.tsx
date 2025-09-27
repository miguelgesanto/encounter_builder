import React, { useEffect, useState } from 'react'
import { useCombatStore } from '../../combat-tracker/store/combatStore'
import { SmartReminderEngine, SmartReminderOptions } from '../engine/SmartReminderEngine'
import { InitiativeTimingEngine } from '../utils/InitiativeTimingEngine'
import { CreatureAbilityParser } from '../utils/CreatureAbilityParser'
import { ContextAnalyzer } from '../utils/ContextAnalyzer'
import { ReminderContent, EncounterContext } from '../types/reminder.types'

/**
 * Example component showing how to properly integrate the new AI reminder system
 *
 * This demonstrates:
 * 1. Proper creature data parsing
 * 2. Correct D&D initiative timing
 * 3. Generalizable reminder generation
 * 4. Proper card grouping and display
 */
export const SmartReminderExample: React.FC = () => {
  const combatState = useCombatStore()
  const [reminders, setReminders] = useState<ReminderContent[]>([])
  const [context, setContext] = useState<EncounterContext | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // Smart reminder options
  const [options, setOptions] = useState<SmartReminderOptions>({
    useAI: true,
    enablePredictive: true,
    reminderTypes: ['turn_start', 'legendary_actions', 'lair_actions', 'condition_reminder', 'death_trigger'],
    groupByType: true
  })

  // Update context when combat state changes
  useEffect(() => {
    if (combatState.isActive) {
      try {
        const newContext = ContextAnalyzer.combatStateToContext(combatState)
        setContext(newContext)
      } catch (error) {
        console.error('Failed to update context:', error)
      }
    }
  }, [combatState])

  // Generate reminders when context changes
  useEffect(() => {
    if (context && !isProcessing) {
      generateReminders()
    }
  }, [context, options])

  const generateReminders = async () => {
    if (!context) return

    setIsProcessing(true)
    try {
      // Generate reminders using the smart engine
      const newReminders = await SmartReminderEngine.generateReminders(context, options)

      // Sort by priority
      const sortedReminders = SmartReminderEngine.sortRemindersByPriority(newReminders)

      setReminders(sortedReminders)
    } catch (error) {
      console.error('Failed to generate reminders:', error)
      // Fallback to basic reminders
      setReminders(generateFallbackReminders())
    } finally {
      setIsProcessing(false)
    }
  }

  const generateFallbackReminders = (): ReminderContent[] => {
    if (!context) return []

    const currentCreature = context.creatures[context.currentTurn]
    if (!currentCreature) return []

    return [{
      id: `fallback_${Date.now()}`,
      content: `🎯 **${currentCreature.name}'s Turn** - HP: ${currentCreature.hp}/${currentCreature.maxHp}`,
      type: 'turn_start',
      urgency: 'medium',
      displayDuration: 5000,
      position: 'turn-panel',
      timing: 'immediate',
      dismissible: true
    }]
  }

  // Example: Generate reminders for specific initiative
  const generateForInitiative = async (initiative: number) => {
    if (!context) return

    setIsProcessing(true)
    try {
      const initiativeReminders = await SmartReminderEngine.generateRemindersForInitiative(
        context,
        initiative,
        options
      )

      console.log(`Reminders for initiative ${initiative}:`, initiativeReminders)
      setReminders(initiativeReminders)
    } catch (error) {
      console.error('Failed to generate initiative reminders:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  // Example: Show creature ability parsing
  const showCreatureAbilities = (creatureId: string) => {
    if (!context) return

    const creature = context.creatures.find(c => c.id === creatureId)
    if (!creature) return

    const parsedAbilities = CreatureAbilityParser.parseCreatureAbilities(creature)
    console.log(`Parsed abilities for ${creature.name}:`, parsedAbilities)

    // Show what abilities would trigger at different times
    console.log('Turn Start Abilities:', parsedAbilities.turnStartAbilities)
    console.log('Legendary Actions:', parsedAbilities.legendaryActions)
    console.log('Lair Actions:', parsedAbilities.lairActions)
    console.log('Death Triggers:', parsedAbilities.deathTriggers)
  }

  // Example: Check initiative timing
  const checkInitiativeTiming = () => {
    if (!context) return

    const initiativeOrder = InitiativeTimingEngine.generateInitiativeOrder(context)
    console.log('Initiative Order:', initiativeOrder)

    // Check for lair actions
    const isLairActionTime = InitiativeTimingEngine.isLairActionTime(context, 20)
    console.log('Is Lair Action Time (initiative 20):', isLairActionTime)

    // Check for legendary actions
    const currentCreature = context.creatures[context.currentTurn]
    if (currentCreature) {
      const isLegendaryTime = InitiativeTimingEngine.isLegendaryActionTime(context, currentCreature.id)
      console.log('Is Legendary Action Time:', isLegendaryTime)
    }
  }

  // Group reminders by type for display
  const groupedReminders = options.groupByType
    ? SmartReminderEngine.groupRemindersByType(reminders)
    : { all: reminders }

  return (
    <div className="smart-reminder-example p-4 space-y-4">
      <div className="header">
        <h2 className="text-xl font-bold">Smart AI Reminder System Example</h2>
        <p className="text-sm text-gray-600">
          Demonstrates proper D&D initiative timing and creature ability parsing
        </p>
      </div>

      {/* Options Panel */}
      <div className="options-panel bg-gray-100 p-3 rounded">
        <h3 className="font-semibold mb-2">Reminder Options</h3>
        <div className="grid grid-cols-2 gap-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={options.useAI}
              onChange={e => setOptions(prev => ({ ...prev, useAI: e.target.checked }))}
              className="mr-2"
            />
            Use AI Generation
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={options.enablePredictive}
              onChange={e => setOptions(prev => ({ ...prev, enablePredictive: e.target.checked }))}
              className="mr-2"
            />
            Enable Predictive
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={options.groupByType}
              onChange={e => setOptions(prev => ({ ...prev, groupByType: e.target.checked }))}
              className="mr-2"
            />
            Group by Type
          </label>
        </div>
      </div>

      {/* Debug Panel */}
      <div className="debug-panel bg-blue-50 p-3 rounded">
        <h3 className="font-semibold mb-2">Debug Tools</h3>
        <div className="space-x-2">
          <button
            onClick={checkInitiativeTiming}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
          >
            Check Initiative Timing
          </button>
          <button
            onClick={() => generateForInitiative(20)}
            className="px-3 py-1 bg-green-500 text-white rounded text-sm"
          >
            Generate for Initiative 20
          </button>
          {context?.creatures.map(creature => (
            <button
              key={creature.id}
              onClick={() => showCreatureAbilities(creature.id)}
              className="px-3 py-1 bg-purple-500 text-white rounded text-sm"
            >
              Parse {creature.name}
            </button>
          ))}
        </div>
      </div>

      {/* Context Info */}
      {context && (
        <div className="context-info bg-gray-50 p-3 rounded">
          <h3 className="font-semibold mb-2">Current Context</h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <strong>Round:</strong> {context.round}
            </div>
            <div>
              <strong>Turn:</strong> {context.currentTurn}
            </div>
            <div>
              <strong>Current Creature:</strong> {context.creatures[context.currentTurn]?.name || 'None'}
            </div>
            <div>
              <strong>Active Conditions:</strong> {context.activeConditions.length}
            </div>
            <div>
              <strong>Legendary Creatures:</strong> {context.legendaryCreatures.length}
            </div>
            <div>
              <strong>Lair Actions:</strong> {context.lairActions.length}
            </div>
          </div>
        </div>
      )}

      {/* Reminders Display */}
      <div className="reminders-display space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">
            Generated Reminders ({reminders.length})
          </h3>
          {isProcessing && (
            <div className="text-sm text-blue-600">Processing...</div>
          )}
        </div>

        {options.groupByType ? (
          // Grouped display
          Object.entries(groupedReminders).map(([type, typeReminders]) => (
            <div key={type} className="reminder-group">
              <h4 className="font-medium text-sm uppercase tracking-wider text-gray-600 mb-2">
                {type.replace('_', ' ')} ({typeReminders.length})
              </h4>
              <div className="space-y-2">
                {typeReminders.map(reminder => (
                  <ReminderCard key={reminder.id} reminder={reminder} />
                ))}
              </div>
            </div>
          ))
        ) : (
          // Flat display
          <div className="space-y-2">
            {reminders.map(reminder => (
              <ReminderCard key={reminder.id} reminder={reminder} />
            ))}
          </div>
        )}
      </div>

      {/* Example Usage Code */}
      <div className="example-code bg-gray-900 text-green-400 p-4 rounded text-sm">
        <h3 className="font-semibold mb-2 text-white">Example Usage</h3>
        <pre>{`
// Generate reminders for current context
const reminders = await SmartReminderEngine.generateReminders(context, {
  useAI: true,
  enablePredictive: true,
  reminderTypes: ['turn_start', 'legendary_actions', 'lair_actions'],
  groupByType: true
})

// Generate reminders for specific initiative
const initiativeReminders = await SmartReminderEngine.generateRemindersForInitiative(
  context,
  20, // Initiative 20 for lair actions
  options
)

// Parse creature abilities
const parsedAbilities = CreatureAbilityParser.parseCreatureAbilities(creature)

// Check proper D&D timing
const isLairActionTime = InitiativeTimingEngine.isLairActionTime(context, 20)
const isLegendaryTime = InitiativeTimingEngine.isLegendaryActionTime(context, creatureId)
        `}</pre>
      </div>
    </div>
  )
}

// Individual reminder card component
const ReminderCard: React.FC<{ reminder: ReminderContent }> = ({ reminder }) => {
  const urgencyColors = {
    critical: 'border-red-500 bg-red-50',
    high: 'border-orange-500 bg-orange-50',
    medium: 'border-yellow-500 bg-yellow-50',
    low: 'border-blue-500 bg-blue-50'
  }

  const positionIcons = {
    'turn-panel': '🎯',
    'center-alert': '⚠️',
    'sidebar': '📋',
    'creature-card': '🧙',
    'round-header': '🔄',
    'floating': '✨'
  }

  return (
    <div className={`reminder-card border-l-4 p-3 rounded ${urgencyColors[reminder.urgency]}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{positionIcons[reminder.position]}</span>
          <span className="font-medium text-sm">
            {reminder.type.replace('_', ' ').toUpperCase()}
          </span>
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            reminder.urgency === 'critical' ? 'bg-red-200 text-red-800' :
            reminder.urgency === 'high' ? 'bg-orange-200 text-orange-800' :
            reminder.urgency === 'medium' ? 'bg-yellow-200 text-yellow-800' :
            'bg-blue-200 text-blue-800'
          }`}>
            {reminder.urgency}
          </span>
        </div>
        <div className="text-xs text-gray-500">
          {reminder.position}
        </div>
      </div>

      <div className="reminder-content whitespace-pre-line text-sm">
        {reminder.content}
      </div>

      {reminder.context && (
        <div className="mt-2 pt-2 border-t border-gray-200">
          <details className="text-xs text-gray-600">
            <summary className="cursor-pointer font-medium">Context Data</summary>
            <pre className="mt-1 whitespace-pre-wrap">
              {JSON.stringify(reminder.context, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  )
}

export default SmartReminderExample