import React from 'react'
import { DisplayedReminder } from '../features/dm-reminders/types/reminder.types'
import { X } from 'lucide-react'

interface AIReminderCardProps {
  reminder: DisplayedReminder
  onDismiss: () => void
}

const AIReminderCard: React.FC<AIReminderCardProps> = ({ reminder, onDismiss }) => {
  // Extract creature name and content
  const getCreatureName = (content: string) => {
    const creatureHeaderPattern = /^\*\*([^*]+)\*\*\s+\((PC|NPC)\)/
    const match = content.match(creatureHeaderPattern)
    return match ? match[1] : null
  }

  const getRound = (content: string) => {
    const roundMatch = content.match(/Turn\s+(\d+)/)
    return roundMatch ? roundMatch[1] : '1'
  }

  const parseAbilities = (content: string) => {
    // Remove creature header
    let processedContent = content.replace(/^\*\*([^*]+)\*\*\s+\((PC|NPC)\)\s+-\s+Turn\s+(\d+)\s*/, '').trim()

    // Extract special abilities section
    const specialAbilitiesMatch = processedContent.match(/\*\*Special Abilities:\*\*\s*(.*)/s)
    if (specialAbilitiesMatch) {
      processedContent = specialAbilitiesMatch[1].trim()
    }

    // Split into lines and clean up
    const lines = processedContent.split('\n')
      .map(line => line
        .replace(/(?:🚨|⚔️|🎯|💡|✨)\s?\*\*([A-Z]+)\*\*:\s?/g, '')
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .trim()
      )
      .filter(line => line.length > 0)

    return lines.map(line => {
      // Parse each line into name and description
      const colonIndex = line.indexOf(':')
      if (colonIndex > 0) {
        return {
          name: line.substring(0, colonIndex).trim(),
          description: line.substring(colonIndex + 1).trim(),
          type: 'combat_ability'
        }
      }
      return {
        name: line,
        description: '',
        type: 'combat_ability'
      }
    })
  }

  const getIcon = (abilityName: string) => {
    const name = abilityName.toLowerCase()
    if (name.includes('lair')) return '🏰'
    if (name.includes('legendary')) return '👑'
    if (name.includes('regenerat')) return '💚'
    if (name.includes('breath')) return '🔥'
    if (name.includes('multiattack')) return '⚔️'
    if (name.includes('frightful')) return '😱'
    if (name.includes('resistance')) return '🛡️'
    if (name.includes('spell')) return '✨'
    return '⚡'
  }

  const creatureName = getCreatureName(reminder.content)
  const round = getRound(reminder.content)
  const abilities = parseAbilities(reminder.content)

  if (!creatureName || abilities.length === 0) return null

  return (
    <div className="card-dnd mb-2 border-l-4 border-amber-500 bg-amber-50">
      {/* Header */}
      <div className="flex justify-between items-center px-2 py-1 border-b border-amber-200">
        <h3 className="font-semibold text-amber-900 text-xs flex items-center gap-1">
          {creatureName} - Round {round}
        </h3>
        <button
          onClick={onDismiss}
          className="text-amber-600 hover:text-amber-800 p-0.5 rounded hover:bg-amber-100 transition-colors"
          aria-label="Dismiss reminder"
        >
          <X className="w-3 h-3" />
        </button>
      </div>

      {/* Compact Inline Layout */}
      <div className="px-2 py-1 space-y-0.5">
        {abilities.map((ability, idx) => (
          <div key={idx} className="text-xs flex items-start gap-1">
            <span className="text-sm mt-0.5">{getIcon(ability.name)}</span>
            <div className="flex-1">
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
        ))}
      </div>
    </div>
  )
}

export default AIReminderCard