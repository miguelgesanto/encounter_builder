import React, { useState } from 'react'
import { Search, Plus, Filter } from 'lucide-react'

// Simple creature data with CR information
const CREATURES = [
  { name: "Goblin", cr: "1/4", hp: 7, ac: 15, type: "humanoid", environment: "forest", xp: 50 },
  { name: "Orc", cr: "1/2", hp: 15, ac: 13, type: "humanoid", environment: "any", xp: 100 },
  { name: "Hobgoblin", cr: "1/2", hp: 11, ac: 18, type: "humanoid", environment: "any", xp: 100 },
  { name: "Skeleton", cr: "1/4", hp: 13, ac: 13, type: "undead", environment: "any", xp: 50 },
  { name: "Zombie", cr: "1/4", hp: 22, ac: 8, type: "undead", environment: "any", xp: 50 },
  { name: "Wolf", cr: "1/4", hp: 11, ac: 13, type: "beast", environment: "forest", xp: 50 },
  { name: "Ogre", cr: "2", hp: 59, ac: 11, type: "giant", environment: "hill", xp: 450 },
  { name: "Bandit", cr: "1/8", hp: 11, ac: 12, type: "humanoid", environment: "any", xp: 25 },
  { name: "Troll", cr: "5", hp: 84, ac: 15, type: "giant", environment: "swamp", xp: 1800 },
  { name: "Dragon Wyrmling (Red)", cr: "4", hp: 75, ac: 17, type: "dragon", environment: "mountain", xp: 1100 },
]

interface CreatureBrowserProps {
  onAddCreature: (creature: any) => void
}

export const CreatureBrowser: React.FC<CreatureBrowserProps> = ({ onAddCreature }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')

  const filteredCreatures = CREATURES.filter(creature => {
    const matchesSearch = creature.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === 'all' || creature.type === typeFilter
    return matchesSearch && matchesType
  })

  const creatureTypes = [...new Set(CREATURES.map(c => c.type))]

  return (
    <div className="card-dnd p-4">
      <h3 className="font-medium text-dnd-primary mb-3 flex items-center gap-2">
        <Search className="w-4 h-4" />
        Creature Database
      </h3>

      {/* Search and Filter */}
      <div className="space-y-2 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dnd-muted w-4 h-4" />
          <input
            type="text"
            placeholder="Search creatures..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-dnd w-full pl-10 pr-4 py-2"
          />
        </div>
        
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="select-dnd w-full px-2 py-1 text-sm"
        >
          <option value="all">All Types</option>
          {creatureTypes.map(type => (
            <option key={type} value={type}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Creatures List */}
      <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-dnd">
        {filteredCreatures.map((creature, index) => (
          <div
            key={index}
            className="p-3 border border-dnd rounded-lg hover:bg-dnd-hover hover:border-dnd-focus transition-all"
          >
            <div className="flex justify-between items-center mb-2">
              <div className="font-medium text-dnd-primary">{creature.name}</div>
              <span className="badge-dnd badge-cr text-xs px-2 py-1 rounded">
                CR {creature.cr}
              </span>
            </div>
            <div className="flex justify-between text-xs text-dnd-secondary mb-2">
              <span>HP: {creature.hp}</span>
              <span>AC: {creature.ac}</span>
              <span className="capitalize">{creature.type}</span>
            </div>
            <button
              onClick={() => onAddCreature(creature)}
              className="btn-dnd btn-dnd-primary w-full px-2 py-1 text-xs flex items-center justify-center gap-1"
            >
              <Plus className="w-3 h-3" />
              Add to Encounter
            </button>
          </div>
        ))}
      </div>
      
      {filteredCreatures.length === 0 && (
        <div className="text-center text-dnd-muted py-4">
          <p className="text-sm">No creatures found</p>
        </div>
      )}
    </div>
  )
}