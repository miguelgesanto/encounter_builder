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
    } sidebar-dnd border-l border-dnd transition-all duration-300 overflow-hidden`}>
      <div className="p-4 border-b border-dnd">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <h2 className="text-lg font-semibold text-dnd-primary">Details & Notes</h2>
          )}
          <button
            onClick={onToggle}
            className="btn-dnd p-1"
            title={collapsed ? "Expand panel" : "Collapse panel"}
          >
            {collapsed ? (
              <ChevronLeft className="w-5 h-5 text-dnd-secondary" />
            ) : (
              <ChevronRight className="w-5 h-5 text-dnd-secondary" />
            )}
          </button>
        </div>
      </div>
      
      {!collapsed && (
        <div className="p-4 space-y-6 h-full overflow-y-auto scrollbar-dnd">
          {/* Selected Combatant Details */}
          {selectedCombatant ? (
            <div>
              <h3 className="font-medium text-dnd-primary mb-2 flex items-center gap-2">
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
              <div className="card-dnd p-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-lg font-semibold text-dnd-primary">
                    {selectedCombatant.name}
                  </h4>
                  <button
                    onClick={() => onSelectCombatant(null)}
                    className="text-dnd-muted hover:text-dnd-secondary"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="space-y-2 text-sm">
                  {selectedCombatant.isPC ? (
                    <>
                      <div className="flex justify-between">
                        <span className="font-medium text-dnd-secondary">Level:</span> 
                        <span className="text-dnd-primary">{selectedCombatant.level}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-dnd-secondary">HP:</span> 
                        <span className="text-dnd-primary">
                          {selectedCombatant.hp} / {selectedCombatant.maxHp}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-dnd-secondary">AC:</span> 
                        <span className="text-dnd-primary">{selectedCombatant.ac}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-dnd-secondary">Initiative:</span> 
                        <span className="text-dnd-primary">{selectedCombatant.initiative}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      {selectedCombatant.cr && (
                        <div className="flex justify-between">
                          <span className="font-medium text-dnd-secondary">CR:</span> 
                          <span className="text-dnd-primary">{selectedCombatant.cr}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="font-medium text-dnd-secondary">HP:</span> 
                        <span className="text-dnd-primary">
                          {selectedCombatant.hp} / {selectedCombatant.maxHp}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-dnd-secondary">AC:</span> 
                        <span className="text-dnd-primary">{selectedCombatant.ac}</span>
                      </div>
                      {selectedCombatant.type && (
                        <div className="flex justify-between">
                          <span className="font-medium text-dnd-secondary">Type:</span> 
                          <span className="text-dnd-primary capitalize">{selectedCombatant.type}</span>
                        </div>
                      )}
                      {selectedCombatant.environment && (
                        <div className="flex justify-between">
                          <span className="font-medium text-dnd-secondary">Environment:</span> 
                          <span className="text-dnd-primary capitalize">{selectedCombatant.environment}</span>
                        </div>
                      )}
                      {selectedCombatant.xp && (
                        <div className="flex justify-between">
                          <span className="font-medium text-dnd-secondary">XP:</span> 
                          <span className="text-dnd-primary">{selectedCombatant.xp}</span>
                        </div>
                      )}
                    </>
                  )}
                  
                  {selectedCombatant.conditions && selectedCombatant.conditions.length > 0 && (
                    <div>
                      <span className="font-medium text-dnd-secondary">Conditions:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedCombatant.conditions.map((condition, index) => (
                          <span 
                            key={index} 
                            className="badge-dnd badge-condition text-xs px-2 py-1 rounded"
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
            <div className="text-center text-dnd-muted">
              <div className="text-4xl mb-4">👁️</div>
              <div className="text-sm">Click a combatant to view details</div>
            </div>
          )}

          {/* Encounter Notes */}
          <div>
            <h3 className="font-medium text-dnd-primary mb-2">Encounter Notes</h3>
            <textarea
              placeholder="Environment details, special rules, story notes..."
              value={encounterNotes}
              onChange={(e) => onNotesChange(e.target.value)}
              className="input-dnd w-full h-24 p-3 resize-none text-sm"
            />
          </div>

          {/* Quick Reference */}
          <div>
            <h3 className="font-medium text-dnd-primary mb-2">Quick Reference</h3>
            <div className="space-y-2 text-xs">
              <div className="p-2 bg-dnd-card border border-dnd rounded">
                <div className="font-medium text-dnd-primary">Actions in Combat</div>
                <div className="text-dnd-secondary mt-1">
                  • Action • Bonus Action • Reaction • Movement • Free Actions
                </div>
              </div>
              <div className="p-2 bg-dnd-card border border-dnd rounded">
                <div className="font-medium text-dnd-primary">Cover</div>
                <div className="text-dnd-secondary mt-1">
                  Half Cover: +2 AC | Three-Quarters: +5 AC | Total: Can't target
                </div>
              </div>
              <div className="p-2 bg-dnd-card border border-dnd rounded">
                <div className="font-medium text-dnd-primary">Advantage/Disadvantage</div>
                <div className="text-dnd-secondary mt-1">
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