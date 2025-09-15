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

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Existing Conditions */}
      {conditions.map((condition, index) => (
        <div
          key={index}
          className="relative group flex items-center gap-1 text-xs px-2 py-1 bg-red-100 text-red-800 rounded cursor-pointer hover:bg-red-200 transition-colors"
          title={CONDITIONS[condition.name as keyof typeof CONDITIONS] || 'Unknown condition'}
        >
          <AlertCircle className="w-3 h-3" />
          <span>{condition.name}</span>
          {condition.duration && (
            <span className="text-red-600">({condition.duration})</span>
          )}
          <button
            onClick={() => onRemoveCondition(index)}
            className="ml-1 hover:text-red-900 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}

      {/* Add Condition Dropdown */}
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="text-xs px-2 py-1 bg-yellow-50 border border-yellow-300 rounded text-yellow-800 hover:bg-yellow-100 transition-colors flex items-center gap-1"
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
            <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-48 overflow-y-auto">
              {Object.entries(CONDITIONS).map(([conditionName, description]) => (
                <button
                  key={conditionName}
                  onClick={() => {
                    onAddCondition(conditionName)
                    setShowDropdown(false)
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 transition-colors border-b border-gray-100 last:border-b-0"
                  title={description}
                >
                  <div className="font-medium text-sm">{conditionName}</div>
                  <div className="text-xs text-gray-500 truncate">{description}</div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}