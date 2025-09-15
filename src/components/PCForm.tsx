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
      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
        <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
          <User className="w-4 h-4" />
          Player Characters
        </h4>
        <button
          onClick={() => setShowForm(true)}
          className="w-full px-3 py-2 border border-green-300 rounded-lg hover:border-green-400 hover:bg-green-100 text-green-600 hover:text-green-700 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Add PC
        </button>
      </div>
    )
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
      <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
        <User className="w-4 h-4" />
        Add Player Character
      </h4>
      
      <div className="space-y-2">
        <input
          type="text"
          placeholder="Character name"
          value={newPC.name}
          onChange={(e) => setNewPC({...newPC, name: e.target.value})}
          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
          autoFocus
        />
        
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block text-xs text-gray-600 mb-1">HP</label>
            <input
              type="number"
              value={newPC.hp}
              onChange={(e) => setNewPC({...newPC, hp: parseInt(e.target.value) || 25})}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-center focus:outline-none focus:ring-1 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">AC</label>
            <input
              type="number"
              value={newPC.ac}
              onChange={(e) => setNewPC({...newPC, ac: parseInt(e.target.value) || 16})}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-center focus:outline-none focus:ring-1 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Level</label>
            <input
              type="number"
              value={newPC.level}
              onChange={(e) => setNewPC({...newPC, level: parseInt(e.target.value) || 5})}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-center focus:outline-none focus:ring-1 focus:ring-green-500"
            />
          </div>
        </div>
        
        <div className="flex gap-2 pt-2">
          <button
            onClick={handleSubmit}
            disabled={!newPC.name.trim()}
            className="flex-1 px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded text-sm transition-colors"
          >
            Add PC
          </button>
          <button
            onClick={() => {
              setShowForm(false)
              setNewPC({ name: '', hp: 25, ac: 16, level: 5 })
            }}
            className="px-3 py-1 text-gray-500 hover:text-gray-700 text-sm transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}