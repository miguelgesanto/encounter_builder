import React, { useState, useEffect } from 'react'
import { X, Heart, Shield, Plus, Minus } from 'lucide-react'

interface HPModalProps {
  isOpen: boolean
  onClose: () => void
  combatant: {
    id: string
    name: string
    hp: number
    maxHp: number
    tempHp?: number
  }
  onUpdateHP: (id: string, newHP: number, newMaxHP?: number, newTempHP?: number) => void
}

export const HPModal: React.FC<HPModalProps> = ({ 
  isOpen, 
  onClose, 
  combatant, 
  onUpdateHP 
}) => {
  const [currentHP, setCurrentHP] = useState(combatant.hp)
  const [maxHP, setMaxHP] = useState(combatant.maxHp)
  const [tempHP, setTempHP] = useState(combatant.tempHp || 0)
  const [damageAmount, setDamageAmount] = useState('')
  const [healAmount, setHealAmount] = useState('')

  useEffect(() => {
    if (isOpen) {
      setCurrentHP(combatant.hp)
      setMaxHP(combatant.maxHp)
      setTempHP(combatant.tempHp || 0)
      setDamageAmount('')
      setHealAmount('')
    }
  }, [isOpen, combatant])

  const handleApplyDamage = () => {
    const damage = parseInt(damageAmount) || 0
    if (damage <= 0) return

    let newCurrentHP = currentHP
    let newTempHP = tempHP

    // Apply damage to temp HP first
    if (newTempHP > 0) {
      if (damage >= newTempHP) {
        const remainingDamage = damage - newTempHP
        newTempHP = 0
        newCurrentHP = Math.max(0, newCurrentHP - remainingDamage)
      } else {
        newTempHP = newTempHP - damage
      }
    } else {
      newCurrentHP = Math.max(0, newCurrentHP - damage)
    }

    setCurrentHP(newCurrentHP)
    setTempHP(newTempHP)
    setDamageAmount('')
  }

  const handleApplyHeal = () => {
    const heal = parseInt(healAmount) || 0
    if (heal <= 0) return

    const newCurrentHP = Math.min(maxHP, currentHP + heal)
    setCurrentHP(newCurrentHP)
    setHealAmount('')
  }

  const handleSave = () => {
    onUpdateHP(combatant.id, currentHP, maxHP, tempHP)
    onClose()
  }

  if (!isOpen) return null

  const totalHP = currentHP + tempHP
  const effectiveMaxHP = maxHP + tempHP

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 max-w-full mx-4" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500" />
            {combatant.name} - HP Management
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Current HP Display */}
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {totalHP} / {maxHP}
              {tempHP > 0 && (
                <span className="text-blue-500 text-lg ml-2">
                  (+{tempHP} temp)
                </span>
              )}
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div 
                className="bg-red-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (currentHP / maxHP) * 100)}%` }}
              ></div>
              {tempHP > 0 && (
                <div 
                  className="bg-blue-500 h-3 rounded-full transition-all duration-300 -mt-3"
                  style={{ 
                    width: `${Math.min(100, (tempHP / maxHP) * 100)}%`,
                    marginLeft: `${Math.min(100, (currentHP / maxHP) * 100)}%`
                  }}
                ></div>
              )}
            </div>
          </div>

          {/* HP Inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Current HP
              </label>
              <input
                type="number"
                min="0"
                max={maxHP}
                value={currentHP}
                onChange={(e) => setCurrentHP(Math.max(0, Math.min(maxHP, parseInt(e.target.value) || 0)))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Max HP
              </label>
              <input
                type="number"
                min="1"
                value={maxHP}
                onChange={(e) => setMaxHP(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Temp HP */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Temporary HP
            </label>
            <input
              type="number"
              min="0"
              value={tempHP}
              onChange={(e) => setTempHP(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Damage/Heal Actions */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-red-600 dark:text-red-400 mb-1">
                Apply Damage
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  placeholder="Amount"
                  value={damageAmount}
                  onChange={(e) => setDamageAmount(e.target.value)}
                  className="flex-1 px-3 py-2 border border-red-300 dark:border-red-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  onKeyPress={(e) => e.key === 'Enter' && handleApplyDamage()}
                />
                <button
                  onClick={handleApplyDamage}
                  className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-green-600 dark:text-green-400 mb-1">
                Apply Healing
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  placeholder="Amount"
                  value={healAmount}
                  onChange={(e) => setHealAmount(e.target.value)}
                  className="flex-1 px-3 py-2 border border-green-300 dark:border-green-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  onKeyPress={(e) => e.key === 'Enter' && handleApplyHeal()}
                />
                <button
                  onClick={handleApplyHeal}
                  className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors font-medium"
            >
              Save Changes
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}