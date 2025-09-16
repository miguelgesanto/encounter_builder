import React, { useState } from 'react'
import { Plus, Dice1, Play, Heart, Shield, User, Swords } from 'lucide-react'
import { CreatureBrowser } from './components/CreatureBrowser'
import { Sidebar } from './components/Sidebar'
import { ConditionsTracker } from './components/ConditionsTracker'
import { PCForm } from './components/PCForm'
import { RightPanel } from './components/RightPanel'
import { SaveLoadManager } from './components/SaveLoadManager'
import { HPModal } from './components/HPModal'
import { QuickAddModal } from './components/QuickAddModal'

interface Condition {
  name: string
  duration?: number
}

interface Combatant {
  id: string
  name: string
  hp: number
  maxHp: number
  ac: number
  initiative: number
  isPC: boolean
  level?: number
  conditions: Condition[]
  cr?: string
  type?: string
  environment?: string
  xp?: number
  tempHp?: number
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
      xp: 50,
      tempHp: 0
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
      conditions: [],
      tempHp: 0
    },
  ])
  const [currentTurn, setCurrentTurn] = useState(0)
  const [round, setRound] = useState(1)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false)
  const [selectedCombatant, setSelectedCombatant] = useState<Combatant | null>(null)
  const [encounterNotes, setEncounterNotes] = useState('')
  const [encounterName, setEncounterName] = useState('Goblin Ambush')
  const [showQuickAddModal, setShowQuickAddModal] = useState(false)
  const [showHPModal, setShowHPModal] = useState(false)
  const [hpModalCombatant, setHpModalCombatant] = useState<Combatant | null>(null)
  const [modalPosition, setModalPosition] = useState<{ x: number; y: number } | null>(null)

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

  const openHPModal = (combatant: Combatant, event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect()
    setModalPosition({
      x: rect.left,
      y: rect.bottom
    })
    setHpModalCombatant(combatant)
    setShowHPModal(true)
  }

  const updateCombatantHP = (id: string, newHp: number, newMaxHp: number, newTempHp?: number) => {
    setCombatants(prev => prev.map(c =>
      c.id === id ? { ...c, hp: newHp, maxHp: newMaxHp, tempHp: newTempHp || 0 } : c
    ))
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
      xp: creature.xp,
      tempHp: 0
    }
    setCombatants(prev => [...prev, newCreature])
  }

  const addPC = (pcData: any) => {
    const newPC: Combatant = {
      id: Date.now().toString() + Math.random(),
      ...pcData,
      initiative: 0,
      conditions: [],
      tempHp: 0
    }
    setCombatants(prev => [...prev, newPC])
  }

  const addCreatureFromModal = (creatureData: any) => {
    const newCreature: Combatant = {
      id: Date.now().toString() + Math.random(),
      ...creatureData,
      conditions: [],
      tempHp: creatureData.tempHp || 0
    }
    setCombatants(prev => [...prev, newCreature])
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
            <button onClick={rollAllInitiative} className="btn-dnd btn-dnd-warning flex items-center gap-2">
              <Dice1 className="w-4 h-4" />
              Roll All
            </button>
            <button onClick={sortByInitiative} className="btn-dnd btn-dnd-primary flex items-center gap-2">
              Sort Initiative
            </button>
            <button onClick={nextTurn} className="btn-dnd btn-dnd-danger flex items-center gap-2" disabled={combatants.length === 0}>
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
          <div className="space-y-2">
            {combatants.map((combatant, index) => (
              <div
                key={combatant.id}
                onClick={() => handleCombatantClick(combatant)}
                className={`initiative-card cursor-pointer p-2 ${index === currentTurn ? 'current-turn' : ''} ${combatant.isPC ? 'player-character' : ''} ${selectedCombatant?.id === combatant.id ? 'selected' : ''}`}
              >
                <div className="flex items-center gap-3 mb-2">
                  {/* Initiative */}
                  <div className="w-20 text-center">
                    <div className="text-xs text-dnd-muted mb-1">Initiative</div>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={combatant.initiative}
                        onChange={(e) => updateCreature(combatant.id, 'initiative', parseInt(e.target.value) || 0)}
                        className="input-dnd w-12 text-center text-sm font-bold p-1"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <button onClick={(e) => { e.stopPropagation(); rollInitiative(combatant.id) }} className="btn-dnd p-1" title="Roll initiative">
                        <Dice1 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Name and Badges */}
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2 mb-1">
                      <input
                        type="text"
                        value={combatant.name}
                        onChange={(e) => updateCreature(combatant.id, 'name', e.target.value)}
                        className="font-medium text-base bg-transparent border-none focus:outline-none text-dnd-primary flex-1"
                        onClick={(e) => e.stopPropagation()}
                      />
                      {combatant.isPC ? (
                        <span className="pc-badge flex items-center gap-1 text-xs">
                          <User className="w-3 h-3" />
                          PC {combatant.level && `${combatant.level}`}
                        </span>
                      ) : (
                        combatant.cr && <span className="cr-badge text-xs">CR {combatant.cr}</span>
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
                        e.stopPropagation();
                        openHPModal(combatant, e);
                      }}
                      className="btn-dnd px-2 py-1 text-xs hover:bg-dnd-hover transition-colors"
                      title="Manage HP"
                    >
                      <div className="font-medium text-sm">
                        {combatant.hp + (combatant.tempHp || 0)} / {combatant.maxHp}
                      </div>
                      {combatant.tempHp && combatant.tempHp > 0 && (
                        <div className="text-xs text-blue-400">+{combatant.tempHp}</div>
                      )}
                    </button>
                  </div>

                  {/* AC */}
                  <div className="text-center">
                    <div className="text-xs text-dnd-muted flex items-center justify-center gap-1 mb-1">
                      <Shield className="w-3 h-3 text-blue-500" />
                      AC
                    </div>
                    <input
                      type="number"
                      value={combatant.ac}
                      onChange={(e) => updateCreature(combatant.id, 'ac', parseInt(e.target.value) || 0)}
                      className="input-dnd w-10 text-center text-sm p-1"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>

                  {/* Remove button */}
                  <button onClick={(e) => { e.stopPropagation(); removeCreature(combatant.id) }} className="btn-dnd btn-dnd-danger p-2" title="Remove combatant">
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
              <p className="text-sm">Click the + button below to add combatants</p>
            </div>
          )}

          {/* Add Combatant Button */}
          <div className="text-center pt-4">
            <button
              onClick={() => setShowQuickAddModal(true)}
              className="btn-dnd btn-dnd-primary px-6 py-3 text-lg flex items-center gap-2 mx-auto"
              title="Add new combatant"
            >
              <Plus className="w-5 h-5" />
              Add Combatant
            </button>
          </div>
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

      {/* Modals */}
      <QuickAddModal
        isOpen={showQuickAddModal}
        onClose={() => setShowQuickAddModal(false)}
        onAddCreature={addCreatureFromModal}
      />

      {hpModalCombatant && (
        <HPModal
          isOpen={showHPModal}
          onClose={() => {
            setShowHPModal(false)
            setHpModalCombatant(null)
            setModalPosition(null)
          }}
          combatant={hpModalCombatant}
          onUpdateHP={updateCombatantHP}
          position={modalPosition}
        />
      )}
    </div>
  )
}

export default App