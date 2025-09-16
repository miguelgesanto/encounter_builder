import React, { useState } from 'react'
import { AlertCircle, X, Plus } from 'lucide-react'

// D&D 5e conditions with descriptions
export const CONDITIONS = {
  'Blinded': "Can't see. Attacks against you have Advantage; your attacks have Disadvantage.",
  'Charmed': "Can't attack the charmer or target them with harmful abilities.",
  'Deafened': "Can't hear. Automatically fail ability checks that require hearing.",
  'Frightened': "Disadvantage on ability checks and attacks while source is in sight.",
  'Grappled': "Speed becomes 0. Can't benefit from speed bonuses.",
  'Incapacitated': "Can't take actions or reactions.",
  'Invisible': "Attacks have Advantage; attacks against have Disadvantage.",
  'Paralyzed': "Incapacitated, can't move or speak. Attacks auto-crit within 5ft.",
  'Petrified': "Transformed to stone. Resistant to all damage.",
  'Poisoned': "Disadvantage on attack rolls and ability checks.",
  'Prone': "Disadvantage on attacks. Attacks against: Advantage if within 5ft.",
  'Restrained': "Speed 0. Attacks: Disadvantage. Attacks against: Advantage.",
  'Stunned': "Incapacitated, can't move. Attacks have Advantage.",
  'Unconscious': "Incapacitated, can't move/speak, unaware of surroundings.",
  'Exhaustion': "Levels 1-6: Disadvantage on rolls, speed reduction, death.",
  'Concentration': "Maintaining a spell. Can be broken by damage."
}

interface Condition {
  name: string
  duration?: number
}

interface ConditionsTrackerProps {
  conditions: Condition[]
  onAddCondition: (condition: string) => void
  onRemoveCondition: (index: number) => void
  onUpdateDuration?: (index: number, duration: number) => void
}

export const ConditionsTracker: React.FC<ConditionsTrackerProps> = ({
  conditions,
  onAddCondition,
  onRemoveCondition,
  onUpdateDuration
}) => {
  const [showDropdown, setShowDropdown] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredConditions = Object.entries(CONDITIONS).filter(([conditionName]) =>
    conditionName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Existing Conditions */}
      {conditions.map((condition, index) => (
        <div
          key={index}
          className="bg-red-900 text-red-300 px-2 py-1 rounded text-xs cursor-pointer hover:bg-red-800 transition-colors flex items-center gap-1"
          title={CONDITIONS[condition.name as keyof typeof CONDITIONS] || 'Unknown condition'}
          onClick={() => onRemoveCondition(index)}
        >
          <span>⚠️</span>
          <span>{condition.name}</span>
          {condition.duration && (
            <span className="opacity-75">({condition.duration})</span>
          )}
          <span className="ml-1">×</span>
        </div>
      ))}

      {/* Add Condition Dropdown */}
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="bg-transparent border border-gray-600 text-gray-400 px-2 py-1 rounded text-xs flex items-center gap-1 hover:border-gray-500 transition-colors"
        >
          <Plus className="w-3 h-3" />
          Condition
        </button>

        {showDropdown && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowDropdown(false)}
            />

            {/* Dropdown Menu */}
            <div className="absolute top-full left-0 mt-1 w-64 bg-gray-800 border border-gray-600 rounded-lg z-20 shadow-lg">
              {/* Search Input */}
              <div className="p-2 border-b border-gray-600">
                <input
                  type="text"
                  placeholder="Search conditions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-gray-700 text-white text-sm px-3 py-1 rounded border-none focus:outline-none focus:ring-1 focus:ring-gray-500"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>

              {/* Conditions List */}
              <div className="max-h-48 overflow-y-auto">
                {filteredConditions.length > 0 ? (
                  filteredConditions.map(([conditionName, description]) => (
                    <button
                      key={conditionName}
                      onClick={() => {
                        onAddCondition(conditionName)
                        setShowDropdown(false)
                        setSearchTerm('')
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-gray-700 transition-colors border-none"
                      title={description}
                    >
                      <div className="font-medium text-sm text-white">{conditionName}</div>
                      <div className="text-xs text-gray-400 truncate">{description}</div>
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-2 text-gray-500 text-sm">No conditions found</div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}