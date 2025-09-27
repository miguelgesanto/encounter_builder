import React, { memo, useMemo, useCallback, useEffect, useState } from 'react'
import { X, AlertTriangle, Clock } from 'lucide-react'
import { DisplayedReminder } from '../../types/reminder.types'

interface AIReminderCardProps {
  reminder: DisplayedReminder
  onDismiss: (id: string) => void
  className?: string
  compact?: boolean
}

interface ParsedReminder {
  creatureName: string | null
  round: string
  abilities: Array<{
    name: string
    description: string
    type: string
    icon: string
  }>
  urgencyColor: string
  borderColor: string
}

const AIReminderCard: React.FC<AIReminderCardProps> = memo(({
  reminder,
  onDismiss,
  className = '',
  compact = false
}) => {
  const [isVisible, setIsVisible] = useState(true)
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)

  // Parse reminder content efficiently with memoization
  const parsedContent = useMemo((): ParsedReminder => {
    try {
      const creatureName = extractCreatureName(reminder.content)
      const round = extractRound(reminder.content)
      const abilities = parseAbilities(reminder.content)

      return {
        creatureName,
        round,
        abilities,
        urgencyColor: getUrgencyColor(reminder.urgency),
        borderColor: getBorderColor(reminder.type)
      }
    } catch (error) {
      console.error('Error parsing reminder content:', error)
      return {
        creatureName: 'Unknown',
        round: '1',
        abilities: [{ name: 'Parse Error', description: 'Could not parse reminder', type: 'error', icon: '⚠️' }],
        urgencyColor: 'text-red-600',
        borderColor: 'border-red-500'
      }
    }
  }, [reminder.content, reminder.urgency, reminder.type])

  // Auto-dismiss timer
  useEffect(() => {
    if (!reminder.displayDuration || reminder.displayDuration <= 0) return

    const startTime = reminder.startTime || Date.now()
    const endTime = startTime + reminder.displayDuration

    const updateTimer = () => {
      const now = Date.now()
      const remaining = endTime - now

      if (remaining <= 0) {
        setIsVisible(false)
        setTimeout(() => onDismiss(reminder.id), 300) // Allow fade animation
      } else {
        setTimeRemaining(remaining)
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [reminder.displayDuration, reminder.startTime, reminder.id, onDismiss])

  // Optimized dismiss handler
  const handleDismiss = useCallback(() => {
    setIsVisible(false)
    setTimeout(() => onDismiss(reminder.id), 300)
  }, [onDismiss, reminder.id])

  // Don't render if no creature name or abilities
  if (!parsedContent.creatureName || parsedContent.abilities.length === 0) {
    return null
  }

  return (
    <div
      className={`
        card-dnd mb-2 border-l-4 bg-opacity-95 backdrop-blur-sm
        transition-all duration-300 ease-in-out
        ${parsedContent.borderColor}
        ${isVisible ? 'opacity-100 transform-none' : 'opacity-0 transform scale-95'}
        ${compact ? 'text-xs' : 'text-sm'}
        ${className}
      `}
      role="alert"
      aria-live="polite"
    >
      {/* Header with creature info and dismiss button */}
      <div className="flex justify-between items-center px-3 py-2 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <h3 className={`font-semibold ${parsedContent.urgencyColor} ${compact ? 'text-xs' : 'text-sm'} flex items-center gap-1`}>
            {getTypeIcon(reminder.type)}
            {parsedContent.creatureName} - Round {parsedContent.round}
          </h3>

          {/* Time remaining indicator */}
          {timeRemaining && timeRemaining > 0 && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              {Math.ceil(timeRemaining / 1000)}s
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          {/* Urgency indicator */}
          {reminder.urgency === 'critical' && (
            <AlertTriangle className="w-4 h-4 text-red-500" aria-label="Critical urgency" />
          )}

          {/* Dismiss button */}
          <button
            onClick={handleDismiss}
            className="text-gray-500 hover:text-gray-700 p-1 rounded hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label={`Dismiss ${parsedContent.creatureName} reminder`}
            type="button"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content with abilities */}
      <div className={`px-3 py-2 space-y-1 ${compact ? 'space-y-0.5' : ''}`}>
        {parsedContent.abilities.map((ability, idx) => (
          <AbilityItem
            key={`${ability.name}-${idx}`}
            ability={ability}
            compact={compact}
          />
        ))}
      </div>

      {/* Footer with reminder type and context */}
      {!compact && (
        <div className="px-3 py-1 text-xs text-gray-500 border-t border-gray-100 bg-gray-50">
          {getReminderTypeLabel(reminder.type)} • {reminder.position}
        </div>
      )}
    </div>
  )
})

// Memoized ability item component
const AbilityItem = memo<{
  ability: { name: string; description: string; type: string; icon: string }
  compact: boolean
}>(({ ability, compact }) => (
  <div className={`flex items-start gap-2 ${compact ? 'text-xs' : 'text-sm'}`}>
    <span className="text-lg mt-0.5 flex-shrink-0" role="img" aria-label={ability.type}>
      {ability.icon}
    </span>
    <div className="flex-1 min-w-0">
      {ability.description ? (
        <>
          <span className="font-medium text-gray-800">{ability.name}:</span>{' '}
          <span className="text-gray-700">{ability.description}</span>
        </>
      ) : (
        <span className="text-gray-800">{ability.name}</span>
      )}
    </div>
  </div>
))

// Utility functions
function extractCreatureName(content: string): string | null {
  const patterns = [
    /^\*\*([^*]+)\*\*\s+\((PC|NPC)\)/,
    /^\*\*([^*]+)\*\*\s+-/,
    /^([A-Za-z\s]+)\s+-\s+/
  ]

  for (const pattern of patterns) {
    const match = content.match(pattern)
    if (match) return match[1].trim()
  }

  return null
}

function extractRound(content: string): string {
  const match = content.match(/(?:Round|Turn)\s+(\d+)/)
  return match ? match[1] : '1'
}

function parseAbilities(content: string): Array<{
  name: string
  description: string
  type: string
  icon: string
}> {
  // Remove headers and extract ability lines
  let processedContent = content
    .replace(/^\*\*([^*]+)\*\*\s+\((PC|NPC)\)\s+-\s+(?:Turn|Round)\s+\d+\s*/i, '')
    .replace(/^\*\*([^*]+)\*\*\s*/i, '')

  // Extract lines that look like abilities
  const lines = processedContent
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .filter(line => !line.match(/^(round|turn|initiative|hp|ac|cr):/i))

  return lines.map(line => {
    // Remove emoji prefixes and markdown
    const cleanLine = line
      .replace(/^[🚨⚔️🎯💡✨🦁🏰⚠️💀🔥💚⚡👑😱🛡️]+\s*/g, '')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .trim()

    const colonIndex = cleanLine.indexOf(':')

    if (colonIndex > 0) {
      const name = cleanLine.substring(0, colonIndex).trim()
      const description = cleanLine.substring(colonIndex + 1).trim()

      return {
        name,
        description,
        type: inferAbilityType(name, description),
        icon: getAbilityIcon(name, description)
      }
    }

    return {
      name: cleanLine,
      description: '',
      type: inferAbilityType(cleanLine, ''),
      icon: getAbilityIcon(cleanLine, '')
    }
  })
}

function inferAbilityType(name: string, description: string): string {
  const combined = `${name} ${description}`.toLowerCase()

  if (combined.includes('legendary')) return 'legendary'
  if (combined.includes('lair')) return 'lair'
  if (combined.includes('breath')) return 'breath_weapon'
  if (combined.includes('regenerat')) return 'regeneration'
  if (combined.includes('condition')) return 'condition'
  if (combined.includes('critical') || combined.includes('death')) return 'critical'
  if (combined.includes('multiattack')) return 'multiattack'

  return 'combat_ability'
}

function getAbilityIcon(name: string, description: string): string {
  const combined = `${name} ${description}`.toLowerCase()

  if (combined.includes('lair')) return '🏰'
  if (combined.includes('legendary')) return '👑'
  if (combined.includes('regenerat')) return '💚'
  if (combined.includes('breath')) return '🔥'
  if (combined.includes('multiattack')) return '⚔️'
  if (combined.includes('frightful') || combined.includes('fear')) return '😱'
  if (combined.includes('resistance') || combined.includes('immunity')) return '🛡️'
  if (combined.includes('spell') || combined.includes('magic')) return '✨'
  if (combined.includes('critical') || combined.includes('death')) return '💀'
  if (combined.includes('condition')) return '⚠️'

  return '⚡'
}

function getUrgencyColor(urgency: string): string {
  switch (urgency) {
    case 'critical': return 'text-red-700'
    case 'high': return 'text-orange-700'
    case 'medium': return 'text-amber-700'
    case 'low': return 'text-blue-700'
    default: return 'text-gray-700'
  }
}

function getBorderColor(type: string): string {
  switch (type) {
    case 'death_trigger': return 'border-red-500 bg-red-50'
    case 'legendary_actions': return 'border-purple-500 bg-purple-50'
    case 'lair_actions': return 'border-blue-500 bg-blue-50'
    case 'turn_start': return 'border-amber-500 bg-amber-50'
    case 'condition_reminder': return 'border-orange-500 bg-orange-50'
    case 'concentration_check': return 'border-indigo-500 bg-indigo-50'
    default: return 'border-gray-500 bg-gray-50'
  }
}

function getTypeIcon(type: string): string {
  switch (type) {
    case 'death_trigger': return '💀'
    case 'legendary_actions': return '👑'
    case 'lair_actions': return '🏰'
    case 'turn_start': return '🎯'
    case 'condition_reminder': return '⚠️'
    case 'concentration_check': return '🧠'
    case 'environmental': return '🌪️'
    case 'tactical_suggestion': return '💡'
    default: return '⚡'
  }
}

function getReminderTypeLabel(type: string): string {
  switch (type) {
    case 'death_trigger': return 'Death Event'
    case 'legendary_actions': return 'Legendary Actions'
    case 'lair_actions': return 'Lair Actions'
    case 'turn_start': return 'Turn Start'
    case 'condition_reminder': return 'Condition'
    case 'concentration_check': return 'Concentration'
    case 'environmental': return 'Environmental'
    case 'tactical_suggestion': return 'Tactical'
    default: return 'Reminder'
  }
}

AIReminderCard.displayName = 'AIReminderCard'

export default AIReminderCard