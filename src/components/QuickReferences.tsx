import React, { useState } from 'react'
import { Shield, Zap, Target, Sword, Eye, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react'

interface QuickReferencesProps {
  compact?: boolean
}

export const QuickReferences: React.FC<QuickReferencesProps> = ({ compact = false }) => {
  const [collapsed, setCollapsed] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({})

  const toggleSection = (index: number) => {
    setExpandedSections(prev => ({
      ...prev,
      [index]: !prev[index]
    }))
  }
  const allReferenceContent = [
    "Action: Attack, Dash, Dodge, Help, Hide, Ready, Search",
    "Bonus Action: Varies by class/spell",
    "Reaction: Opportunity attack, Ready trigger",
    "Half Cover: +2 AC/Dex saves • Three-Quarters: +5 AC/Dex saves",
    "Melee: 5ft • Thrown: 20/60ft • Shortbow: 80/320ft • Longbow: 150/600ft",
    "Advantage: Prone target (within 5ft), unseen attacker, Help action",
    "Conditions: Blinded, Charmed, Deafened, Frightened, Grappled, Incapacitated",
    "Death Saves: 3 successes = stable, 3 failures = dead, nat 1 = 2 failures, nat 20 = 1 HP"
  ]

  if (compact) {
    return (
      <div className="space-y-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-dnd-secondary">Quick References</span>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-dnd-muted hover:text-dnd-secondary"
            title={collapsed ? "Expand references" : "Collapse references"}
          >
            {collapsed ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
          </button>
        </div>
        {!collapsed && (
          <div className="space-y-1">
            {allReferenceContent.map((content, index) => (
              <div key={index} className="p-1.5 bg-dnd-card border border-dnd rounded text-xs">
                <div className="text-dnd-secondary leading-tight text-xs">
                  {content}
                </div>
              </div>
            ))}
            <button className="w-full p-1.5 text-xs text-dnd-muted hover:text-dnd-secondary text-center opacity-50">
              + Add more references
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {allReferenceContent.map((content, index) => (
        <div key={index} className="bg-dnd-card border border-dnd rounded p-2">
          <div className="text-xs text-dnd-secondary flex items-start gap-1">
            <ChevronRight className="w-2 h-2 mt-0.5 flex-shrink-0 text-dnd-muted" />
            <span>{content}</span>
          </div>
        </div>
      ))}
      <button className="w-full p-2 text-xs text-dnd-muted hover:text-dnd-secondary text-center opacity-50">
        + Add more references
      </button>
    </div>
  )
}

export default QuickReferences