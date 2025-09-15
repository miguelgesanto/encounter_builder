import React from 'react'
import { ChevronLeft, ChevronRight, FileText, User, Heart, Shield, Zap } from 'lucide-react'

interface Combatant {
  id: string
  name: string
  hp: number
  maxHp: number
  ac: number
  initiative: number
  isPC: boolean
  level?: number
  conditions: Array<{ name: string; duration?: number }>
  cr?: string
  type?: string
  environment?: string
  xp?: number
}

interface RightPanelProps {
  collapsed: boolean
  onToggle: () => void
  selectedCombatant: Combatant | null
  encounterNotes: string
  onNotesChange: (notes: string) => void
  onSelectCombatant: (combatant: Combatant | null) => void
}

export const RightPanel: React.FC<RightPanelProps> = ({
  collapsed,
  onToggle,
  selectedCombatant,
  encounterNotes,
  onNotesChange,
  onSelectCombatant
}) => {
  return (
    <div className={`${
      collapsed ? 'w-12' : 'w-80'
    } bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 transition-all duration-300 overflow-hidden`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Details & Notes</h2>
          )}
          <button
            onClick={onToggle}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            title={collapsed ? "Expand panel" : "Collapse panel"}
          >
            {collapsed ? (
              <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            )}
          </button>
        </div>
      </div>
      
      {!collapsed && (
        <div className="p-4 space-y-6 h-full overflow-y-auto">
          {/* Selected Combatant Details */}
          {selectedCombatant ? (
            <div>
              <h3 className="font-medium text-gray-700 dark:text-gray-200 mb-2 flex items-center gap-2">
                {selectedCombatant.isPC ? (
                  <>
                    <User className="w-4 h-4" />
                    Player Character
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    Selected Creature
                  </>
                )}
              </h3>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {selectedCombatant.name}
                  </h4>
                  <button
                    onClick={() => onSelectCombatant(null)}
                    className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="space-y-2 text-sm">
                  {selectedCombatant.isPC ? (
                    <>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600 dark:text-gray-300">Level:</span> 
                        <span className="text-gray-900 dark:text-gray-100">{selectedCombatant.level}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600 dark:text-gray-300">HP:</span> 
                        <span className="text-gray-900 dark:text-gray-100">
                          {selectedCombatant.hp} / {selectedCombatant.maxHp}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600 dark:text-gray-300">AC:</span> 
                        <span className="text-gray-900 dark:text-gray-100">{selectedCombatant.ac}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600 dark:text-gray-300">Initiative:</span> 
                        <span className="text-gray-900 dark:text-gray-100">{selectedCombatant.initiative}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      {selectedCombatant.cr && (
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-600 dark:text-gray-300">CR:</span> 
                          <span className="text-gray-900 dark:text-gray-100">{selectedCombatant.cr}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600 dark:text-gray-300">HP:</span> 
                        <span className="text-gray-900 dark:text-gray-100">
                          {selectedCombatant.hp} / {selectedCombatant.maxHp}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600 dark:text-gray-300">AC:</span> 
                        <span className="text-gray-900 dark:text-gray-100">{selectedCombatant.ac}</span>
                      </div>
                      {selectedCombatant.type && (
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-600 dark:text-gray-300">Type:</span> 
                          <span className="text-gray-900 dark:text-gray-100 capitalize">{selectedCombatant.type}</span>
                        </div>
                      )}
                      {selectedCombatant.environment && (
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-600 dark:text-gray-300">Environment:</span> 
                          <span className="text-gray-900 dark:text-gray-100 capitalize">{selectedCombatant.environment}</span>
                        </div>
                      )}
                      {selectedCombatant.xp && (
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-600 dark:text-gray-300">XP:</span> 
                          <span className="text-gray-900 dark:text-gray-100">{selectedCombatant.xp}</span>
                        </div>
                      )}
                    </>
                  )}
                  
                  {selectedCombatant.conditions && selectedCombatant.conditions.length > 0 && (
                    <div>
                      <span className="font-medium text-gray-600 dark:text-gray-300">Conditions:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedCombatant.conditions.map((condition, index) => (
                          <span 
                            key={index} 
                            className="text-xs px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded"
                          >
                            {condition.name}
                            {condition.duration && ` (${condition.duration})`}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400">
              <div className="text-4xl mb-4">👁️</div>
              <div className="text-sm">Click a combatant to view details</div>
            </div>
          )}

          {/* Encounter Notes */}
          <div>
            <h3 className="font-medium text-gray-700 dark:text-gray-200 mb-2">Encounter Notes</h3>
            <textarea
              placeholder="Environment details, special rules, story notes..."
              value={encounterNotes}
              onChange={(e) => onNotesChange(e.target.value)}
              className="w-full h-24 p-3 border border-gray-300 dark:border-gray-700 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100"
            />
          </div>

          {/* Quick Reference */}
          <div>
            <h3 className="font-medium text-gray-700 dark:text-gray-200 mb-2">Quick Reference</h3>
            <div className="space-y-2 text-xs">
              <div className="p-2 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded">
                <div className="font-medium text-blue-800 dark:text-blue-200">Actions in Combat</div>
                <div className="text-blue-600 dark:text-blue-300 mt-1">
                  • Action • Bonus Action • Reaction • Movement • Free Actions
                </div>
              </div>
              <div className="p-2 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded">
                <div className="font-medium text-green-800 dark:text-green-200">Cover</div>
                <div className="text-green-600 dark:text-green-300 mt-1">
                  Half Cover: +2 AC | Three-Quarters: +5 AC | Total: Can't target
                </div>
              </div>
              <div className="p-2 bg-purple-50 dark:bg-gray-800 border border-purple-200 dark:border-gray-700 rounded">
                <div className="font-medium text-purple-800 dark:text-gray-100">Advantage/Disadvantage</div>
                <div className="text-purple-600 dark:text-gray-300 mt-1">
                  Roll twice, take higher/lower. Don't stack.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}