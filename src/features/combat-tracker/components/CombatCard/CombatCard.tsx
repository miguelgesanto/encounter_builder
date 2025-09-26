import React, { createContext, useContext } from 'react'
import { Combatant } from '../../types/combat.types'
import { useCombatCard, UseCombatCardReturn } from '../../hooks/useCombatCard'

interface CombatCardContextValue extends UseCombatCardReturn {
  combatant: Combatant
  isActive: boolean
}

const CombatCardContext = createContext<CombatCardContextValue | null>(null)

export const useCombatCardContext = () => {
  const context = useContext(CombatCardContext)
  if (!context) {
    throw new Error('CombatCard compound components must be used within a CombatCard')
  }
  return context
}

interface CombatCardProps {
  combatant: Combatant
  isActive?: boolean
  children: React.ReactNode
  onClick?: (combatant: Combatant) => void
}

/**
 * Main CombatCard component using compound component pattern
 * Provides context and styling for all sub-components
 */
export const CombatCard: React.FC<CombatCardProps> & {
  Header: typeof CombatCardHeader
  Stats: typeof CombatCardStats
  Conditions: typeof CombatCardConditions
  Actions: typeof CombatCardActions
} = ({ combatant, isActive = false, children, onClick }) => {
  const cardLogic = useCombatCard(combatant)

  const contextValue: CombatCardContextValue = {
    combatant,
    isActive,
    ...cardLogic
  }

  const cardClasses = `
    relative flex flex-col rounded-lg px-3 py-2 font-sans gap-1 mb-2 border transition-all duration-200
    ${combatant.isPC
      ? 'bg-blue-50 text-gray-900 border-blue-200'
      : 'bg-gray-50 text-gray-900 border-gray-200'
    }
    ${isActive ? 'ring-2 ring-orange-400 bg-orange-50' : ''}
    ${cardLogic.isDead ? 'opacity-60 grayscale' : ''}
    hover:shadow-sm cursor-pointer
  `.trim()

  return (
    <CombatCardContext.Provider value={contextValue}>
      <div
        className={cardClasses}
        onClick={() => onClick?.(combatant)}
      >
        {children}
      </div>
    </CombatCardContext.Provider>
  )
}

/**
 * Header section with initiative and name
 */
const CombatCardHeader: React.FC = () => {
  const { combatant, rollInitiative, updateCombatant, validationErrors } = useCombatCardContext()

  return (
    <div className="flex items-center gap-2">
      {/* Initiative */}
      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={rollInitiative}
          className="text-sm hover:text-base transition-all duration-200 cursor-pointer"
          title="Roll initiative"
          type="button"
        >
          🎲
        </button>
        <input
          type="number"
          value={combatant.initiative}
          onChange={(e) => updateCombatant({ initiative: parseInt(e.target.value) || 0 })}
          className={`bg-white border border-gray-300 text-gray-900 font-bold text-center w-12 text-xs focus:outline-none rounded px-1 py-0.5 ${
            validationErrors.some(error => error.includes('Initiative')) ? 'border-red-500 text-red-600' : ''
          }`}
          onClick={(e) => e.stopPropagation()}
          title={validationErrors.find(error => error.includes('Initiative')) || ''}
          min="-10"
          max="50"
        />
      </div>

      {/* Name */}
      <div className="flex-1 min-w-0">
        <input
          type="text"
          value={combatant.name}
          onChange={(e) => updateCombatant({ name: e.target.value })}
          className={`bg-transparent border-none text-gray-900 font-semibold text-sm focus:outline-none w-full ${
            validationErrors.some(error => error.includes('Name')) ? 'text-red-600' : ''
          }`}
          onClick={(e) => e.stopPropagation()}
          title={validationErrors.find(error => error.includes('Name')) || ''}
        />
      </div>
    </div>
  )
}

/**
 * Stats section with HP, AC, and other combat stats
 */
const CombatCardStats: React.FC<{ onOpenHPModal?: (combatant: Combatant, event: React.MouseEvent) => void }> = ({
  onOpenHPModal
}) => {
  const { combatant, updateCombatant, hpStatus, validationErrors } = useCombatCardContext()

  const getHPStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600'
      case 'wounded': return 'text-yellow-600'
      case 'bloodied': return 'text-orange-600'
      case 'critical': return 'text-red-600 animate-pulse'
      case 'unconscious': return 'text-red-800'
      default: return 'text-gray-600'
    }
  }

  return (
    <div className="flex items-center gap-2 ml-auto">
      {/* HP */}
      <div className="flex items-center gap-1 bg-white border border-gray-300 rounded px-2 py-1 min-w-[70px]" onClick={(e) => e.stopPropagation()}>
        <span className="text-red-500">❤️</span>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onOpenHPModal?.(combatant, e)
          }}
          className={`font-semibold text-xs whitespace-nowrap hover:bg-gray-50 transition-colors bg-transparent border-none focus:outline-none ${getHPStatusColor(hpStatus)}`}
          title="Manage HP"
          type="button"
        >
          HP {combatant.hp}/{combatant.maxHp}
          {combatant.tempHp > 0 && (
            <span className="text-cyan-600"> +{combatant.tempHp}</span>
          )}
        </button>
      </div>

      {/* AC */}
      <div className="flex items-center gap-1 bg-white border border-gray-300 rounded px-2 py-1 min-w-[50px]" onClick={(e) => e.stopPropagation()}>
        <span className="text-blue-500">🛡️</span>
        <span className="font-semibold text-xs">AC</span>
        <input
          type="number"
          value={combatant.ac}
          onChange={(e) => updateCombatant({ ac: parseInt(e.target.value) || 0 })}
          className={`bg-transparent border-none text-gray-900 font-bold text-center w-5 text-xs focus:outline-none ${
            validationErrors.some(error => error.includes('AC')) ? 'text-red-600' : ''
          }`}
          onClick={(e) => e.stopPropagation()}
          title={validationErrors.find(error => error.includes('AC')) || ''}
          min="0"
          max="30"
        />
      </div>

      {/* Remove Button */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          removeCombatant()
        }}
        className="bg-red-500 hover:bg-red-600 text-white rounded px-1.5 py-1 text-xs font-bold transition-colors"
        title="Remove combatant"
        type="button"
      >
        ×
      </button>
    </div>
  )
}

/**
 * Conditions section - both tracker and display
 */
const CombatCardConditions: React.FC = () => {
  const { combatant, addCondition, removeCondition, hasConditions } = useCombatCardContext()

  return (
    <>
      {/* Conditions Tracker */}
      <div className="flex items-center gap-2 ml-10" onClick={(e) => e.stopPropagation()}>
        {/* This would integrate with your existing ConditionsTracker component */}
        <button
          onClick={() => {
            // Example: add a simple condition
            addCondition({ name: 'Poisoned', description: 'Disadvantage on attack rolls and ability checks' })
          }}
          className="bg-white border border-gray-300 text-gray-600 px-2 py-1 rounded text-xs flex items-center gap-1 hover:border-gray-400 transition-colors"
          type="button"
        >
          + Condition
        </button>
      </div>

      {/* Active Conditions Display */}
      {hasConditions && (
        <div className="flex flex-wrap gap-1 ml-10" onClick={(e) => e.stopPropagation()}>
          {combatant.conditions.map((condition) => (
            <span
              key={condition.id}
              className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium flex items-center gap-1 cursor-pointer hover:bg-red-200 transition-colors"
              onClick={() => removeCondition(condition.id)}
              title={`Remove ${condition.name}`}
            >
              ⚠️ {condition.name}
              {condition.duration && ` (${condition.duration})`}
              <span className="text-red-600 hover:text-red-800 font-bold">×</span>
            </span>
          ))}
        </div>
      )}
    </>
  )
}

/**
 * Actions section for combat actions
 */
const CombatCardActions: React.FC = () => {
  const { combatant, applyDamage, applyHealing, duplicateCombatant, isCurrentTurn } = useCombatCardContext()

  if (!isCurrentTurn) return null

  return (
    <div className="flex items-center gap-1 mt-1 ml-10" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => applyDamage(5)}
        className="bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded text-xs transition-colors"
        title="Apply 5 damage"
        type="button"
      >
        -5 HP
      </button>
      <button
        onClick={() => applyHealing(5)}
        className="bg-green-100 hover:bg-green-200 text-green-700 px-2 py-1 rounded text-xs transition-colors"
        title="Apply 5 healing"
        type="button"
      >
        +5 HP
      </button>
      <button
        onClick={duplicateCombatant}
        className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded text-xs transition-colors"
        title="Duplicate combatant"
        type="button"
      >
        📋
      </button>
    </div>
  )
}

// Attach sub-components
CombatCard.Header = CombatCardHeader
CombatCard.Stats = CombatCardStats
CombatCard.Conditions = CombatCardConditions
CombatCard.Actions = CombatCardActions

export default CombatCard