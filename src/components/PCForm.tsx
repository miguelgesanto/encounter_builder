import React, { useState } from 'react'
import { User, Plus, X } from 'lucide-react'

interface PCFormProps {
  onAddPC: (pc: any) => void
}

export const PCForm: React.FC<PCFormProps> = ({ onAddPC }) => {
  const [showForm, setShowForm] = useState(false)
  const [newPC, setNewPC] = useState({
    name: '',
    hp: 25,
    ac: 16,
    level: 5
  })

  const handleSubmit = () => {
    if (!newPC.name.trim()) return
    
    onAddPC({
      name: newPC.name,
      hp: newPC.hp,
      maxHp: newPC.hp,
      ac: newPC.ac,
      level: newPC.level,
      isPC: true
    })
    
    setNewPC({ name: '', hp: 25, ac: 16, level: 5 })
    setShowForm(false)
  }

  if (!showForm) {
    return (
      <div className="card-dnd p-3">
        <h4 className="font-medium text-dnd-primary mb-2 flex items-center gap-2">
          <User className="w-4 h-4" />
          Player Characters
        </h4>
        <button
          onClick={() => setShowForm(true)}
          className="btn-dnd btn-dnd-success w-full px-3 py-2 flex items-center justify-center gap-2 text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Add PC
        </button>
      </div>
    )
  }

  return (
    <div className="card-dnd p-3">
      <h4 className="font-medium text-dnd-primary mb-2 flex items-center gap-2">
        <User className="w-4 h-4" />
        Add Player Character
      </h4>
      
      <div className="space-y-2">
        <input
          type="text"
          placeholder="Character name"
          value={newPC.name}
          onChange={(e) => setNewPC({...newPC, name: e.target.value})}
          className="input-dnd w-full px-2 py-1 text-sm"
          autoFocus
        />
        
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block text-xs text-dnd-muted mb-1">HP</label>
            <input
              type="number"
              value={newPC.hp}
              onChange={(e) => setNewPC({...newPC, hp: parseInt(e.target.value) || 25})}
              className="input-dnd w-full px-2 py-1 text-sm text-center"
            />
          </div>
          <div>
            <label className="block text-xs text-dnd-muted mb-1">AC</label>
            <input
              type="number"
              value={newPC.ac}
              onChange={(e) => setNewPC({...newPC, ac: parseInt(e.target.value) || 16})}
              className="input-dnd w-full px-2 py-1 text-sm text-center"
            />
          </div>
          <div>
            <label className="block text-xs text-dnd-muted mb-1">Level</label>
            <input
              type="number"
              value={newPC.level}
              onChange={(e) => setNewPC({...newPC, level: parseInt(e.target.value) || 5})}
              className="input-dnd w-full px-2 py-1 text-sm text-center"
            />
          </div>
        </div>
        
        <div className="flex gap-2 pt-2">
          <button
            onClick={handleSubmit}
            disabled={!newPC.name.trim()}
            className="btn-dnd btn-dnd-success flex-1 px-3 py-1 text-sm disabled:opacity-50"
          >
            Add PC
          </button>
          <button
            onClick={() => {
              setShowForm(false)
              setNewPC({ name: '', hp: 25, ac: 16, level: 5 })
            }}
            className="btn-dnd px-3 py-1 text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}