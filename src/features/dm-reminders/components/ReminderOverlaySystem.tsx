import React, { useState, useEffect, useRef } from 'react'
import { DisplayedReminder, DisplayPosition, ReminderContent } from '../types/reminder.types'

interface ReminderOverlaySystemProps {
  reminders: DisplayedReminder[]
  onDismiss: (reminderId: string) => void
  onDismissAll: () => void
  className?: string
}

export const ReminderOverlaySystem: React.FC<ReminderOverlaySystemProps> = ({
  reminders,
  onDismiss,
  onDismissAll,
  className = ''
}) => {
  // Group reminders by position
  const remindersByPosition = groupRemindersByPosition(reminders)

  return (
    <div className={`reminder-overlay-system ${className}`}>
      {/* Turn Panel Reminders */}
      {remindersByPosition['turn-panel'].length > 0 && (
        <TurnPanelReminders
          reminders={remindersByPosition['turn-panel']}
          onDismiss={onDismiss}
        />
      )}

      {/* Center Alert Reminders */}
      {remindersByPosition['center-alert'].length > 0 && (
        <CenterAlertReminders
          reminders={remindersByPosition['center-alert']}
          onDismiss={onDismiss}
        />
      )}

      {/* Sidebar Reminders */}
      {remindersByPosition['sidebar'].length > 0 && (
        <SidebarReminders
          reminders={remindersByPosition['sidebar']}
          onDismiss={onDismiss}
          onDismissAll={onDismissAll}
        />
      )}

      {/* Creature Card Reminders */}
      {remindersByPosition['creature-card'].length > 0 && (
        <CreatureCardReminders
          reminders={remindersByPosition['creature-card']}
          onDismiss={onDismiss}
        />
      )}

      {/* Round Header Reminders */}
      {remindersByPosition['round-header'].length > 0 && (
        <RoundHeaderReminders
          reminders={remindersByPosition['round-header']}
          onDismiss={onDismiss}
        />
      )}

      {/* Floating Reminders */}
      {remindersByPosition['floating'].length > 0 && (
        <FloatingReminders
          reminders={remindersByPosition['floating']}
          onDismiss={onDismiss}
        />
      )}
    </div>
  )
}

// Turn Panel Reminders Component
const TurnPanelReminders: React.FC<{
  reminders: DisplayedReminder[]
  onDismiss: (id: string) => void
}> = ({ reminders, onDismiss }) => {
  return (
    <div className="fixed top-4 left-4 z-40 max-w-md">
      {reminders.map(reminder => (
        <ReminderCard
          key={reminder.id}
          reminder={reminder}
          onDismiss={onDismiss}
          className="mb-2 bg-blue-50 border-blue-200"
        />
      ))}
    </div>
  )
}

// Center Alert Reminders Component
const CenterAlertReminders: React.FC<{
  reminders: DisplayedReminder[]
  onDismiss: (id: string) => void
}> = ({ reminders, onDismiss }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="max-w-2xl w-full mx-4">
        {reminders.map(reminder => (
          <ReminderCard
            key={reminder.id}
            reminder={reminder}
            onDismiss={onDismiss}
            className="mb-4 bg-red-50 border-red-300 shadow-2xl"
            showCloseButton
          />
        ))}
      </div>
    </div>
  )
}

// Sidebar Reminders Component
const SidebarReminders: React.FC<{
  reminders: DisplayedReminder[]
  onDismiss: (id: string) => void
  onDismissAll: () => void
}> = ({ reminders, onDismiss, onDismissAll }) => {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div className="fixed top-4 right-4 z-40 max-w-sm">
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-3 bg-gray-50 border-b border-gray-200 rounded-t-lg">
          <h3 className="text-sm font-semibold text-gray-700 flex items-center">
            <span className="mr-2">🧠</span>
            DM Reminders ({reminders.length})
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="text-gray-500 hover:text-gray-700 text-sm"
              title={isCollapsed ? 'Expand' : 'Collapse'}
            >
              {isCollapsed ? '📖' : '📕'}
            </button>
            <button
              onClick={onDismissAll}
              className="text-red-500 hover:text-red-700 text-sm"
              title="Dismiss All"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        {!isCollapsed && (
          <div className="max-h-96 overflow-y-auto">
            {reminders.map(reminder => (
              <div key={reminder.id} className="border-b border-gray-100 last:border-b-0">
                <ReminderCard
                  reminder={reminder}
                  onDismiss={onDismiss}
                  className="border-0 rounded-none shadow-none"
                  compact
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Creature Card Reminders Component
const CreatureCardReminders: React.FC<{
  reminders: DisplayedReminder[]
  onDismiss: (id: string) => void
}> = ({ reminders, onDismiss }) => {
  // Group by target creature
  const remindersByCreature = groupRemindersByCreature(reminders)

  return (
    <div className="reminder-creature-overlays">
      {Object.entries(remindersByCreature).map(([creatureId, creatureReminders]) => (
        <CreatureReminderOverlay
          key={creatureId}
          creatureId={creatureId}
          reminders={creatureReminders}
          onDismiss={onDismiss}
        />
      ))}
    </div>
  )
}

// Creature Reminder Overlay Component
const CreatureReminderOverlay: React.FC<{
  creatureId: string
  reminders: DisplayedReminder[]
  onDismiss: (id: string) => void
}> = ({ creatureId, reminders, onDismiss }) => {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null)

  useEffect(() => {
    // Find the creature card element and position reminder near it
    const creatureCard = document.querySelector(`[data-creature-id="${creatureId}"]`)
    if (creatureCard) {
      const rect = creatureCard.getBoundingClientRect()
      setPosition({
        x: rect.right + 10,
        y: rect.top
      })
    }
  }, [creatureId])

  if (!position) return null

  return (
    <div
      className="fixed z-30 max-w-xs"
      style={{
        left: position.x,
        top: position.y,
        transform: 'translateY(-50%)'
      }}
    >
      {reminders.map(reminder => (
        <ReminderCard
          key={reminder.id}
          reminder={reminder}
          onDismiss={onDismiss}
          className="mb-2 bg-yellow-50 border-yellow-200"
          compact
        />
      ))}
    </div>
  )
}

// Round Header Reminders Component
const RoundHeaderReminders: React.FC<{
  reminders: DisplayedReminder[]
  onDismiss: (id: string) => void
}> = ({ reminders, onDismiss }) => {
  return (
    <div className="fixed top-0 left-1/2 transform -translate-x-1/2 z-40 mt-4">
      {reminders.map(reminder => (
        <ReminderCard
          key={reminder.id}
          reminder={reminder}
          onDismiss={onDismiss}
          className="mb-2 bg-purple-50 border-purple-200"
          compact
        />
      ))}
    </div>
  )
}

// Floating Reminders Component
const FloatingReminders: React.FC<{
  reminders: DisplayedReminder[]
  onDismiss: (id: string) => void
}> = ({ reminders, onDismiss }) => {
  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40">
      <div className="flex flex-col items-center space-y-2">
        {reminders.map(reminder => (
          <ReminderCard
            key={reminder.id}
            reminder={reminder}
            onDismiss={onDismiss}
            className="bg-gray-50 border-gray-200"
            compact
          />
        ))}
      </div>
    </div>
  )
}

// Base Reminder Card Component
interface ReminderCardProps {
  reminder: DisplayedReminder
  onDismiss: (id: string) => void
  className?: string
  compact?: boolean
  showCloseButton?: boolean
}

const ReminderCard: React.FC<ReminderCardProps> = ({
  reminder,
  onDismiss,
  className = '',
  compact = false,
  showCloseButton = false
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Animate in
    setIsVisible(true)

    // Auto-hide timer
    if (reminder.displayDuration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(() => onDismiss(reminder.id), 200) // Wait for animation
      }, reminder.displayDuration)

      return () => clearTimeout(timer)
    }
  }, [reminder.displayDuration, reminder.id, onDismiss])

  const handleDismiss = () => {
    setIsVisible(false)
    setTimeout(() => onDismiss(reminder.id), 200)
  }

  const urgencyStyles = {
    low: 'border-gray-300 bg-gray-50',
    medium: 'border-blue-300 bg-blue-50',
    high: 'border-orange-300 bg-orange-50',
    critical: 'border-red-500 bg-red-100 shadow-lg'
  }

  const urgencyIcons = {
    low: 'ℹ️',
    medium: '⚠️',
    high: '🚨',
    critical: '🔥'
  }

  return (
    <div
      ref={cardRef}
      className={`
        reminder-card
        border rounded-lg p-3 shadow-sm
        transition-all duration-200 ease-in-out
        ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
        ${urgencyStyles[reminder.urgency]}
        ${compact ? 'text-sm' : 'text-base'}
        ${className}
      `}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-center mb-2">
            <span className="text-lg mr-2">
              {urgencyIcons[reminder.urgency]}
            </span>
            <span className="font-semibold text-gray-700 capitalize">
              {reminder.type.replace('_', ' ')}
            </span>
            {!compact && (
              <span className="ml-2 text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                {reminder.urgency}
              </span>
            )}
          </div>

          {/* Content */}
          <div className="text-gray-800 leading-relaxed">
            <ReminderContent content={reminder.content} />
          </div>
        </div>

        {/* Controls */}
        <div className="ml-3 flex items-center space-x-2">
          {(reminder.dismissible || showCloseButton) && (
            <button
              onClick={handleDismiss}
              className="text-gray-400 hover:text-gray-600 text-sm"
              title="Dismiss"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Progress bar for timed reminders */}
      {reminder.displayDuration > 0 && !compact && (
        <ReminderProgressBar
          duration={reminder.displayDuration}
          startTime={reminder.startTime}
        />
      )}
    </div>
  )
}

// Reminder Content Component (renders markdown-style content)
const ReminderContent: React.FC<{ content: string }> = ({ content }) => {
  // Simple markdown-like parsing for reminder content
  const parseContent = (text: string) => {
    return text
      .split('\n')
      .map((line, index) => {
        // Bold text
        const boldRegex = /\*\*(.*?)\*\*/g
        const parsedLine = line.replace(boldRegex, '<strong>$1</strong>')

        return (
          <div
            key={index}
            className={index > 0 ? 'mt-1' : ''}
            dangerouslySetInnerHTML={{ __html: parsedLine }}
          />
        )
      })
  }

  return <div>{parseContent(content)}</div>
}

// Progress Bar Component
const ReminderProgressBar: React.FC<{
  duration: number
  startTime: number
}> = ({ duration, startTime }) => {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const newProgress = Math.min((elapsed / duration) * 100, 100)
      setProgress(newProgress)

      if (newProgress >= 100) {
        clearInterval(interval)
      }
    }, 100)

    return () => clearInterval(interval)
  }, [duration, startTime])

  return (
    <div className="mt-2 w-full bg-gray-200 rounded-full h-1">
      <div
        className="bg-blue-500 h-1 rounded-full transition-all duration-100 ease-linear"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}

// Utility Functions
function groupRemindersByPosition(reminders: DisplayedReminder[]): Record<DisplayPosition, DisplayedReminder[]> {
  const groups: Record<DisplayPosition, DisplayedReminder[]> = {
    'turn-panel': [],
    'center-alert': [],
    'sidebar': [],
    'creature-card': [],
    'round-header': [],
    'floating': []
  }

  reminders.forEach(reminder => {
    const position = reminder.position as DisplayPosition
    if (groups[position]) {
      groups[position].push(reminder)
    }
  })

  return groups
}

function groupRemindersByCreature(reminders: DisplayedReminder[]): Record<string, DisplayedReminder[]> {
  const groups: Record<string, DisplayedReminder[]> = {}

  reminders.forEach(reminder => {
    const creatureId = reminder.targetCreature || 'unknown'
    if (!groups[creatureId]) {
      groups[creatureId] = []
    }
    groups[creatureId].push(reminder)
  })

  return groups
}

export default ReminderOverlaySystem