import React, { useState, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight, FileText, Target } from 'lucide-react'
import { StatBlock } from './StatBlock'
import { QuickReferences } from './QuickReferences'

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
  tempHp?: number
}

interface EnhancedRightPanelProps {
  collapsed: boolean
  onToggle: () => void
  selectedCombatant: Combatant | null
  encounterNotes: string
  onNotesChange: (notes: string) => void
  onSelectCombatant: (combatant: Combatant | null) => void
}

export const EnhancedRightPanel: React.FC<EnhancedRightPanelProps> = ({
  collapsed,
  onToggle,
  selectedCombatant,
  encounterNotes,
  onNotesChange,
  onSelectCombatant
}) => {
  const [panelWidth, setPanelWidth] = useState(33) // Default 1/3 of screen
  const [isResizing, setIsResizing] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  // Load panel width from localStorage on mount
  useEffect(() => {
    const savedWidth = localStorage.getItem('rightPanelWidth')
    if (savedWidth) {
      const width = parseInt(savedWidth)
      if (width >= 20 && width <= 50) {
        setPanelWidth(width)
      }
    }
  }, [])

  // Save panel width to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('rightPanelWidth', panelWidth.toString())
  }, [panelWidth])

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !panelRef.current) return

      const containerWidth = window.innerWidth
      const mouseX = e.clientX
      const newWidth = ((containerWidth - mouseX) / containerWidth) * 100

      // Constrain between 20% and 50%
      const constrainedWidth = Math.max(20, Math.min(50, newWidth))
      setPanelWidth(constrainedWidth)
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing])

  return (
    <div
      ref={panelRef}
      className={`sidebar-dnd border-l border-dnd transition-all duration-300 overflow-hidden flex-shrink-0`}
      style={{ width: collapsed ? '48px' : `${panelWidth}%` }}
    >
      {/* Resize Handle */}
      {!collapsed && (
        <div
          className={`absolute left-0 top-0 bottom-0 w-1 bg-gray-400 dark:bg-gray-600 cursor-ew-resize hover:bg-blue-500 transition-colors z-10 ${
            isResizing ? 'bg-blue-500' : ''
          }`}
          onMouseDown={handleMouseDown}
          style={{ marginLeft: '-2px' }}
        />
      )}

      <div className="p-4 border-b border-dnd">
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
          {!collapsed && (
            <h2 className="text-lg font-semibold text-dnd-primary">
              {selectedCombatant ? 'Creature Details' : 'Combat Reference'}
            </h2>
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
        <div className="flex-1 overflow-y-auto scrollbar-dnd max-h-full">
          {/* State 1: Creature Selected - Show Stat Block */}
          {selectedCombatant ? (
            <div className="p-4 space-y-4">
              <StatBlock
                combatant={selectedCombatant}
                onCollapse={() => onSelectCombatant(null)}
              />

              {/* Quick References (compressed when creature selected) */}
              <div>
                <h3 className="font-medium text-dnd-primary mb-2 text-sm">Quick Reference</h3>
                <QuickReferences compact={true} />
              </div>

            </div>
          ) : (
            /* State 2: No Creature Selected - Show References */
            <div className="p-4 space-y-6">
              {/* Quick References (expanded) */}
              <div>
                <h3 className="font-medium text-dnd-primary mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Combat Reference
                </h3>
                <QuickReferences compact={false} />
              </div>


              {/* Hint */}
              <div className="text-center text-dnd-muted py-8">
                <div className="text-4xl mb-2">👁️</div>
                <div className="text-sm">Click a combatant to view detailed stat block</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default EnhancedRightPanel