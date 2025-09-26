import React, { useState, useEffect } from 'react'
import { Search, Plus, Filter, Upload, Loader } from 'lucide-react'
import { MonsterImport } from './MonsterImport'
import { dnd5eAPI, MonsterListEntry } from '../utils/dnd5eAPI'

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
  onShowStatBlock?: (creature: any) => void
}

export const CreatureBrowser: React.FC<CreatureBrowserProps> = ({ onAddCreature, onShowStatBlock }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [showImport, setShowImport] = useState(false)
  const [apiResults, setApiResults] = useState<MonsterListEntry[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedMonster, setSelectedMonster] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [searchCache] = useState(new Map<string, MonsterListEntry[]>())
  const [abortController, setAbortController] = useState<AbortController | null>(null)

  // Search API when search term changes with better debouncing
  useEffect(() => {
    // Cancel previous search if still running
    if (abortController) {
      abortController.abort()
    }

    const timeoutId = setTimeout(() => {
      if (searchTerm.trim()) {
        performAPISearch(searchTerm)
      } else {
        setApiResults([])
        setIsSearching(false)
      }
    }, 300) // Reduced debounce time

    return () => {
      clearTimeout(timeoutId)
      if (abortController) {
        abortController.abort()
      }
    }
  }, [searchTerm])

  // Prefetch popular monsters on mount
  useEffect(() => {
    dnd5eAPI.prefetchPopularMonsters()
  }, [])

  const performAPISearch = async (query: string) => {
    const normalizedQuery = query.trim().toLowerCase()

    // Check cache first
    if (searchCache.has(normalizedQuery)) {
      const cachedResults = searchCache.get(normalizedQuery)!
      setApiResults(cachedResults)
      return
    }

    setIsSearching(true)

    // Create new abort controller for this search
    const controller = new AbortController()
    setAbortController(controller)

    try {
      const results = await Promise.race([
        dnd5eAPI.searchMonsters(query),
        new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Search timeout')), 15000) // Increased timeout
        })
      ])

      // Check if this search was cancelled
      if (controller.signal.aborted) {
        return
      }

      setApiResults(results)

      // Cache results (limit cache size)
      if (searchCache.size > 50) {
        const firstKey = searchCache.keys().next().value
        searchCache.delete(firstKey)
      }
      searchCache.set(normalizedQuery, results)

    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Search failed:', error)
        setApiResults([])
      }
    } finally {
      if (!controller.signal.aborted) {
        setIsSearching(false)
        setAbortController(null)
      }
    }
  }

  const filteredCreatures = CREATURES.filter(creature => {
    const matchesSearch = creature.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === 'all' || creature.type === typeFilter
    return matchesSearch && matchesType
  })

  const creatureTypes = [...new Set(CREATURES.map(c => c.type))]

  const handleImportMonster = (monster: any) => {
    onAddCreature(monster)
    setShowImport(false)
    setShowUrlImport(false)
  }

  const handleImportMultiple = (monsters: any[]) => {
    monsters.forEach(monster => onAddCreature(monster))
    setShowImport(false)
    setShowUrlImport(false)
  }

  const handleSelectAPIMonster = async (monsterEntry: MonsterListEntry) => {
    setIsLoading(true)
    const startTime = performance.now()

    try {
      const monsterDetail = await dnd5eAPI.getMonster(monsterEntry.slug)
      const combatant = dnd5eAPI.convertToCombatant(monsterDetail)
      onAddCreature(combatant)

      const loadTime = performance.now() - startTime
      console.log(`⚡ Monster ${monsterEntry.name} loaded in ${loadTime.toFixed(0)}ms`)
    } catch (error) {
      console.error('Failed to load monster:', error)

      // Try to provide fallback data
      const fallbackCombatant = {
        id: Date.now().toString(),
        name: monsterEntry.name,
        hp: 30,
        maxHp: 30,
        ac: 15,
        initiative: 10,
        isPC: false,
        conditions: [],
        tempHp: 0,
        cr: monsterEntry.challenge_rating || '1',
        type: 'unknown',
        importSource: 'fallback'
      }
      onAddCreature(fallbackCombatant)
    } finally {
      setIsLoading(false)
    }
  }

  const handleShowStatBlock = async (monsterEntry: MonsterListEntry) => {
    if (!onShowStatBlock) return

    setIsLoading(true)
    try {
      const monsterDetail = await dnd5eAPI.getMonster(monsterEntry.slug)
      const combatant = dnd5eAPI.convertToCombatant(monsterDetail)
      onShowStatBlock(combatant)
    } catch (error) {
      console.error('Failed to load monster for stat block:', error)

      // Try to provide fallback stat block
      const fallbackCombatant = {
        id: Date.now().toString(),
        name: monsterEntry.name,
        hp: 30,
        maxHp: 30,
        ac: 15,
        initiative: 10,
        isPC: false,
        conditions: [],
        tempHp: 0,
        cr: monsterEntry.challenge_rating || '1',
        type: 'unknown',
        abilities: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
        actions: [{ name: 'Attack', description: 'A basic attack.' }],
        importSource: 'fallback'
      }
      onShowStatBlock(fallbackCombatant)
    } finally {
      setIsLoading(false)
    }
  }

  if (showImport) {
    return (
      <MonsterImport
        onImportMonster={handleImportMonster}
        onImportMultiple={handleImportMultiple}
        onCancel={() => setShowImport(false)}
      />
    )
  }



  return (
    <div className="card-dnd p-4">
      <h3 className="font-medium text-dnd-primary mb-3 flex items-center gap-2">
        <Search className="w-4 h-4" />
        Creature Search
      </h3>

      {/* Import Buttons */}
      <div className="mb-4 space-y-2">
        <button
          onClick={() => setShowImport(true)}
          className="btn-dnd btn-dnd-secondary w-full px-3 py-2 flex items-center justify-center gap-2 text-sm font-medium"
        >
          <Upload className="w-4 h-4" />
          Import from Text
        </button>
      </div>

      {/* Search and Filter */}
      <div className="space-y-2 mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search D&D 5e monsters..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-dnd w-full px-3 py-2 text-sm"
          />
          {(isSearching || isLoading) && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Loader className="w-4 h-4 animate-spin text-dnd-primary" />
            </div>
          )}
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
        {/* Show API results when searching */}
        {searchTerm && apiResults.length > 0 && (
          <>
            <div className="text-xs text-dnd-muted mb-2">
              D&D 5e API ({apiResults.length} found)
            </div>
            {apiResults.map((monster) => {
              const sourceInfo = dnd5eAPI.getSourceDisplay(monster);
              return (
                <div
                  key={monster.slug}
                  className="p-3 border border-dnd rounded-lg hover:bg-dnd-hover hover:border-dnd-focus transition-all cursor-pointer"
                  onClick={() => onShowStatBlock ? handleShowStatBlock(monster) : undefined}
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="font-medium text-dnd-primary">{monster.name}</div>
                    <div className="flex gap-1">
                      <span className="text-xs px-1.5 py-0.5 bg-dnd-primary/10 text-dnd-primary rounded">
                        {sourceInfo.edition}
                      </span>
                      <span className="text-xs text-dnd-muted">{sourceInfo.short}</span>
                    </div>
                  </div>
                  <div className="text-xs text-dnd-secondary mb-2 flex items-center justify-between">
                    <span title={sourceInfo.full}>{sourceInfo.full}</span>
                    <a
                      href={`https://www.aidedd.org/dnd/monstres.php?vo=${monster.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-dnd-muted hover:text-dnd-primary text-xs underline flex items-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      📄
                      Full stat block
                    </a>
                  </div>
                  {onShowStatBlock && (
                    <div className="text-xs text-dnd-muted mb-2">
                      💡 Click to view stat block
                    </div>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectAPIMonster(monster);
                    }}
                    disabled={isLoading}
                    className="btn-dnd btn-dnd-primary w-full px-2 py-1 text-xs flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Add to Encounter
                  </button>
                </div>
              );
            })}
          </>
        )}

        {/* Show local creatures when not searching or as fallback */}
        {(!searchTerm || apiResults.length === 0) && filteredCreatures.map((creature, index) => (
          <div
            key={index}
            className="p-3 border border-dnd rounded-lg hover:bg-dnd-hover hover:border-dnd-focus transition-all cursor-pointer"
            onClick={() => onShowStatBlock ? onShowStatBlock({
              ...creature,
              importSource: 'manual',
              importedAt: new Date().toISOString()
            }) : undefined}
          >
            <div className="flex justify-between items-center mb-2">
              <div className="font-medium text-dnd-primary">{creature.name}</div>
              <div className="flex gap-1">
                <span className="badge-dnd badge-cr text-xs px-2 py-1 rounded">
                  CR {creature.cr}
                </span>
                <span className="text-xs px-1.5 py-0.5 bg-dnd-secondary/10 text-dnd-secondary rounded">
                  Local
                </span>
              </div>
            </div>
            <div className="flex justify-between text-xs text-dnd-secondary mb-2">
              <span>HP: {creature.hp}</span>
              <span>AC: {creature.ac}</span>
              <span className="capitalize">{creature.type}</span>
            </div>
            {onShowStatBlock && (
              <div className="text-xs text-dnd-muted mb-2">
                💡 Click to view stat block
              </div>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddCreature({
                  ...creature,
                  importSource: 'manual',
                  importedAt: new Date().toISOString()
                });
              }}
              className="btn-dnd btn-dnd-primary w-full px-2 py-1 text-xs flex items-center justify-center gap-1"
            >
              <Plus className="w-3 h-3" />
              Add to Encounter
            </button>
          </div>
        ))}
      </div>
      
      {searchTerm && apiResults.length === 0 && !isSearching && (
        <div className="text-center text-dnd-muted py-4">
          <p className="text-sm">No monsters found for "{searchTerm}"</p>
          <p className="text-xs mt-1">Try "dragon", "goblin", or "aboleth"</p>
        </div>
      )}

      {!searchTerm && filteredCreatures.length === 0 && (
        <div className="text-center text-dnd-muted py-4">
          <p className="text-sm">No creatures found</p>
        </div>
      )}

      {!searchTerm && (
        <div className="text-center text-dnd-muted py-2 text-xs">
          <p>💡 Search above to find 334+ official D&D 5e monsters</p>
        </div>
      )}
    </div>
  )
}