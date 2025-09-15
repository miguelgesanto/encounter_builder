import React, { useState } from 'react'
import { Plus, Dice1, Play, Heart, Shield, User, Swords } from 'lucide-react'
import { CreatureBrowser } from './components/CreatureBrowser'
import { Sidebar } from './components/Sidebar'
import { ConditionsTracker } from './components/ConditionsTracker'
import { PCForm } from './components/PCForm'
import { RightPanel } from './components/RightPanel'
import { SaveLoadManager } from './components/SaveLoadManager'
import { HPModal } from './components/HPModal'

interface Condition {
  name: string
  duration?: number
}

interface Combatant {
  id: string
  name: string
  hp: number
  maxHp: number
  tempHp?: number
  ac: number
  initiative: number
  isPC: boolean
  level?: number
  conditions: Condition[]
  cr?: string
  type?: string
  environment?: string
  xp?: number
}

interface SavedEncounter {
  id: string
  name: string
  combatants: Combatant[]
  round: number
  currentTurn: number
  notes: string
  savedAt: string
}

const App: React.FC = () => {
  const [combatants, setCombatants] = useState<Combatant[]>([
    { 
      id: '1', 
      name: 'Goblin', 
      hp: 7, 
      maxHp: 7, 
      ac: 15, 
      initiative: 12, 
      isPC: false, 
      conditions: [{ name: 'Poisoned' }],
      cr: '1/4',
      type: 'humanoid',
      environment: 'forest',
      xp: 50
    },
    { 
      id: '2', 
      name: 'Fighter (PC)', 
      hp: 25, 
      maxHp: 25, 
      ac: 18, 
      initiative: 15, 
      isPC: true, 
      level: 5,
      conditions: [] 
    },
  ])
  const [currentTurn, setCurrentTurn] = useState(0)
  const [round, setRound] = useState(1)
  const [newCreatureName, setNewCreatureName] = useState('')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false)
  const [selectedCombatant, setSelectedCombatant] = useState<Combatant | null>(null)
  const [encounterNotes, setEncounterNotes] = useState('')
  const [encounterName, setEncounterName] = useState('Goblin Ambush')
  const [hpModalOpen, setHpModalOpen] = useState(false)
  const [hpModalCombatant, setHpModalCombatant] = useState<Combatant | null>(null)

  const calculateDifficulty = () => {
    const party = combatants.filter(c => c.isPC)
    const enemies = combatants.filter(c => !c.isPC)
    
    if (party.length === 0) return { difficulty: 'No Party', xp: 0 }
    
    const avgLevel = Math.round(party.reduce((sum, pc) => sum + (pc.level || 5), 0) / party.length)
    const totalXP = enemies.reduce((sum, enemy) => sum + (enemy.xp || 0), 0)
    
    const thresholds = {
      easy: 25 * party.length * avgLevel,
      medium: 50 * party.length * avgLevel,
      hard: 75 * party.length * avgLevel,
      deadly: 100 * party.length * avgLevel
    }
    
    let difficulty = 'trivial'
    if (totalXP >= thresholds.deadly) difficulty = 'deadly'
    else if (totalXP >= thresholds.hard) difficulty = 'hard'
    else if (totalXP >= thresholds.medium) difficulty = 'medium'
    else if (totalXP >= thresholds.easy) difficulty = 'easy'
    
    return { difficulty, xp: totalXP }
  }

  const rollInitiative = (id: string) => {
    const roll = Math.floor(Math.random() * 20) + 1
    const modifier = Math.floor(Math.random() * 4) + 1
    setCombatants(prev => prev.map(c => 
      c.id === id ? { ...c, initiative: roll + modifier } : c
    ))
  }

  const rollAllInitiative = () => {
    setCombatants(prev => prev.map(c => {
      const roll = Math.floor(Math.random() * 20) + 1
      const modifier = Math.floor(Math.random() * 4) + 1
      return { ...c, initiative: roll + modifier }
    }))
  }

  const sortByInitiative = () => {
    setCombatants(prev => [...prev].sort((a, b) => b.initiative - a.initiative))
    setCurrentTurn(0)
  }

  const nextTurn = () => {
    if (combatants.length === 0) return
    let nextIndex = currentTurn + 1
    if (nextIndex >= combatants.length) {
      nextIndex = 0
      setRound(prev => prev + 1)
    }
    setCurrentTurn(nextIndex)
  }

  const addCreature = () => {
    if (!newCreatureName.trim()) return
    const newCreature: Combatant = {
      id: Date.now().toString(),
      name: newCreatureName,
      hp: 10,
      maxHp: 10,
      ac: 12,
      initiative: 0,
      isPC: false,
      conditions: []
    }
    setCombatants(prev => [...prev, newCreature])
    setNewCreatureName('')
  }

  const addCreatureFromDatabase = (creature: any) => {
    const newCreature: Combatant = {
      id: Date.now().toString() + Math.random(),
      name: creature.name,
      hp: creature.hp,
      maxHp: creature.hp,
      ac: creature.ac,
      initiative: 0,
      isPC: false,
      conditions: [],
      cr: creature.cr,
      type: creature.type,
      environment: creature.environment,
      xp: creature.xp
    }
    setCombatants(prev => [...prev, newCreature])
  }

  const addPC = (pcData: any) => {
    const newPC: Combatant = {
      id: Date.now().toString() + Math.random(),
      ...pcData,
      initiative: 0,
      conditions: []
    }
    setCombatants(prev => [...prev, newPC])
  }

  const updateCreature = (id: string, field: keyof Combatant, value: any) => {
    setCombatants(prev => prev.map(c =>
      c.id === id ? { ...c, [field]: value } : c
    ))
  }

  const removeCreature = (id: string) => {
    setCombatants(prev => prev.filter(c => c.id !== id))
    if (selectedCombatant?.id === id) {
      setSelectedCombatant(null)
    }
  }

  const addCondition = (combatantId: string, conditionName: string) => {
    setCombatants(prev => prev.map(c =>
      c.id === combatantId 
        ? { ...c, conditions: [...c.conditions, { name: conditionName }] }
        : c
    ))
  }

  const removeCondition = (combatantId: string, conditionIndex: number) => {
    setCombatants(prev => prev.map(c =>
      c.id === combatantId 
        ? { ...c, conditions: c.conditions.filter((_, i) => i !== conditionIndex) }
        : c
    ))
  }

  const handleCombatantClick = (combatant: Combatant) => {
    setSelectedCombatant(selectedCombatant?.id === combatant.id ? null : combatant)
  }

  const loadEncounter = (encounter: SavedEncounter) => {
    setCombatants(encounter.combatants)
    setRound(encounter.round)
    setCurrentTurn(encounter.currentTurn)
    setEncounterNotes(encounter.notes)
    setEncounterName(encounter.name)
    setSelectedCombatant(null)
  }

  const openHPModal = (combatant: Combatant) => {
    setHpModalCombatant(combatant)
    setHpModalOpen(true)
  }

  const updateCombatantHP = (id: string, newHP: number, newMaxHP?: number, newTempHP?: number) => {
    setCombatants(prev => prev.map(c =>
      c.id === id 
        ? { 
            ...c, 
            hp: newHP, 
            maxHp: newMaxHP !== undefined ? newMaxHP : c.maxHp,
            tempHp: newTempHP !== undefined ? newTempHP : c.tempHp
          } 
        : c
    ))
  }

  const difficultyData = calculateDifficulty()

  return (
    <div className="flex h-screen bg-dnd-primary">
      {/* Left Sidebar */}
      <div className={`${sidebarCollapsed ? 'w-12' : 'w-80'} sidebar-dnd flex flex-col transition-all duration-300 overflow-hidden`}>
        <Sidebar title="⚔️ Encounter Builder" collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}>
          <div className="space-y-4">
            {/* Difficulty Display */}
            <div className="card-dnd p-4">
              <div className="text-sm font-medium text-dnd-secondary mb-2 flex items-center gap-2">
                <Swords className="w-4 h-4" />
                Encounter Difficulty
              </div>
              <div className={`text-2xl font-bold mb-1 difficulty-${difficultyData.difficulty}`}>
                {difficultyData.difficulty.charAt(0).toUpperCase() + difficultyData.difficulty.slice(1)}
              </div>
              <div className="text-xs text-dnd-muted">{difficultyData.xp} XP Total</div>
            </div>

            <PCForm onAddPC={addPC} />


            <CreatureBrowser onAddCreature={addCreatureFromDatabase} />
          </div>
        </Sidebar>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="header-dnd p-4">
          <div className="flex items-center justify-between mb-4">
            <SaveLoadManager
              combatants={combatants}
              round={round}
              currentTurn={currentTurn}
              encounterNotes={encounterNotes}
              encounterName={encounterName}
              onLoad={loadEncounter}
              onEncounterNameChange={setEncounterName}
            />
            <div className="text-lg font-semibold text-dnd-primary flex items-center gap-2">
              🎲 Round {round}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button onClick={rollAllInitiative} className="btn-dnd flex items-center gap-2 bg-orange-600 hover:bg-orange-700 border-orange-500">
              <Dice1 className="w-4 h-4" />
              Roll All
            </button>
            <button onClick={sortByInitiative} className="btn-dnd flex items-center gap-2 bg-purple-600 hover:bg-purple-700 border-purple-500">
              Sort Initiative
            </button>
            <button onClick={nextTurn} className="btn-dnd flex items-center gap-2 bg-red-600 hover:bg-red-700 border-red-500" disabled={combatants.length === 0}>
              <Play className="w-4 h-4" />
              Next Turn
            </button>
            <button onClick={() => { setRound(1); setCurrentTurn(0) }} className="btn-dnd flex items-center gap-2">
              Reset
            </button>
          </div>
        </div>


        {/* Initiative List */}
        <div className="flex-1 overflow-y-auto p-4 scrollbar-dnd">
          {/* Add Creature Button */}
          <div className="mb-4 flex justify-center">
            <div className="flex gap-2 items-center bg-gray-800 p-3 rounded-lg border border-gray-600">
              <input
                type="text"
                placeholder="Creature name..."
                value={newCreatureName}
                onChange={(e) => setNewCreatureName(e.target.value)}
                className="input-dnd flex-1 text-sm min-w-48"
                onKeyPress={(e) => e.key === 'Enter' && addCreature()}
              />
              <button 
                onClick={addCreature} 
                className="btn-dnd px-3 py-2 text-sm flex items-center gap-1 bg-green-600 hover:bg-green-700 border-green-500"
                title="Add creature"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {combatants.map((combatant, index) => (
              <div
                key={combatant.id}
                onClick={() => handleCombatantClick(combatant)}
                className={`initiative-card cursor-pointer ${combatant.isPC ? 'player-character' : ''} ${selectedCombatant?.id === combatant.id ? 'selected' : ''}`}
              >
                <div className="flex items-center gap-4 mb-3">
                  {/* Initiative */}
                  <div className="w-16 text-center">
                    <input
                      type="number"
                      value={combatant.initiative}
                      onChange={(e) => updateCreature(combatant.id, 'initiative', parseInt(e.target.value) || 0)}
                      className="input-dnd w-full text-center text-lg font-bold"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <button onClick={(e) => { e.stopPropagation(); rollInitiative(combatant.id) }} className="w-full mt-2 btn-dnd p-2" title="Roll initiative">
                      <Dice1 className="w-4 h-4 mx-auto" />
                    </button>
                  </div>

                  {/* Name and Badges */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <input
                        type="text"
                        value={combatant.name}
                        onChange={(e) => updateCreature(combatant.id, 'name', e.target.value)}
                        className="font-semibold text-xl bg-transparent border-none focus:outline-none text-dnd-primary flex-1"
                        onClick={(e) => e.stopPropagation()}
                      />
                      {combatant.isPC ? (
                        <span className="pc-badge flex items-center gap-1">
                          <User className="w-3 h-3" />
                          PC {combatant.level && `(Lvl ${combatant.level})`}
                        </span>
                      ) : (
                        combatant.cr && <span className="cr-badge">CR {combatant.cr}</span>
                      )}
                    </div>
                  </div>

                  {/* HP */}
                  <div className="text-center">
                    <div className="text-xs text-dnd-muted flex items-center justify-center gap-1 mb-1">
                      <Heart className="w-3 h-3 text-red-500" />
                      HP
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        openHPModal(combatant)
                      }}
                      className="flex items-center gap-1 px-2 py-1 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                      title="Click to manage HP"
                    >
                      <span className="font-medium text-red-800 dark:text-red-200">
                        {combatant.hp + (combatant.tempHp || 0)} / {combatant.maxHp}
                      </span>
                      {combatant.tempHp && combatant.tempHp > 0 && (
                        <span className="text-xs text-blue-600 dark:text-blue-400">
                          (+{combatant.tempHp})
                        </span>
                      )}
                    </button>
                  </div>

                  {/* AC */}
                  <div className="text-center">
                    <div className="text-xs text-dnd-muted flex items-center justify-center gap-1 mb-1">
                      <Shield className="w-3 h-3 text-blue-500" />
                      AC
                    </div>
                    <div className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
                      <span className="font-medium text-blue-800 dark:text-blue-200">
                        {combatant.ac}
                      </span>
                    </div>
                  </div>

                  {/* Remove button */}
                  <button onClick={(e) => { e.stopPropagation(); removeCreature(combatant.id) }} className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded transition-colors" title="Remove combatant">
                    ✕
                  </button>
                </div>

                {/* Conditions */}
                <div className="mt-3" onClick={(e) => e.stopPropagation()}>
                  <ConditionsTracker
                    conditions={combatant.conditions}
                    onAddCondition={(condition) => addCondition(combatant.id, condition)}
                    onRemoveCondition={(index) => removeCondition(combatant.id, index)}
                  />
                </div>
              </div>
            ))}
          </div>

          {combatants.length === 0 && (
            <div className="text-center text-dnd-muted py-16">
              <div className="text-4xl mb-4">⚔️</div>
              <p className="text-lg">No combatants added yet</p>
              <p className="text-sm">Add creatures from the sidebar to start tracking initiative</p>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel */}
      <RightPanel
        collapsed={rightPanelCollapsed}
        onToggle={() => setRightPanelCollapsed(!rightPanelCollapsed)}
        selectedCombatant={selectedCombatant}
        encounterNotes={encounterNotes}
        onNotesChange={setEncounterNotes}
        onSelectCombatant={setSelectedCombatant}
      />

      {/* HP Modal */}
      {hpModalCombatant && (
        <HPModal
          isOpen={hpModalOpen}
          onClose={() => {
            setHpModalOpen(false)
            setHpModalCombatant(null)
          }}
          combatant={hpModalCombatant}
          onUpdateHP={updateCombatantHP}
        />
      )}
    </div>
  )
}

export default App