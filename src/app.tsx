import React, { useState, useEffect } from 'react'
import { Plus, Dice1, Play, Heart, Shield, User, Swords } from 'lucide-react'
import { CreatureBrowser } from './components/CreatureBrowser'
import { Sidebar } from './components/Sidebar'
import { ConditionsTracker } from './components/ConditionsTracker'
import { PCForm } from './components/PCForm'
import { RightPanel } from './components/RightPanel'
import { SaveLoadManager, SavedEncounter } from './components/SaveLoadManager'
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


const App: React.FC = () => {
  const [combatants, setCombatants] = useState<Combatant[]>([
    {
      id: '1',
      name: 'Goblin',
      hp: parseInt('7'),
      maxHp: parseInt('7'),
      ac: parseInt('15'),
      initiative: parseInt('12'),
      isPC: false,
      conditions: [{ name: 'Poisoned' }],
      cr: '1/4',
      type: 'humanoid',
      environment: 'forest',
      xp: parseInt('50'),
      tempHp: parseInt('0')
    },
    {
      id: '2',
      name: 'Fighter (PC)',
      hp: parseInt('25'),
      maxHp: parseInt('25'),
      ac: parseInt('18'),
      initiative: parseInt('15'),
      isPC: true,
      level: parseInt('5'),
      conditions: [],
      tempHp: parseInt('0')
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
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [showLoadDialog, setShowLoadDialog] = useState(false)
  const [saveEncounterName, setSaveEncounterName] = useState('')
  const [savedEncounters, setSavedEncounters] = useState<SavedEncounter[]>([])

  // Load saved encounters from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('dnd-saved-encounters')
    if (saved) {
      try {
        setSavedEncounters(JSON.parse(saved))
      } catch (e) {
        console.error('Error loading saved encounters:', e)
      }
    }
  }, [])

  // Save encounters to localStorage whenever the list changes
  useEffect(() => {
    localStorage.setItem('dnd-saved-encounters', JSON.stringify(savedEncounters))
  }, [savedEncounters])

  const saveEncounter = () => {
    if (!saveEncounterName.trim()) return

    const savedEncounter: SavedEncounter = {
      id: Date.now().toString(),
      name: saveEncounterName.trim(),
      combatants,
      round,
      currentTurn,
      notes: encounterNotes,
      savedAt: new Date().toISOString()
    }

    setSavedEncounters(prev => [...prev, savedEncounter])
    setShowSaveDialog(false)
    setSaveEncounterName('')
  }

  const loadSavedEncounter = (encounter: SavedEncounter) => {
    loadEncounter(encounter)
    setShowLoadDialog(false)
  }

  const deleteEncounter = (encounterId: string) => {
    setSavedEncounters(prev => prev.filter(enc => enc.id !== encounterId))
  }

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
      c.id === id ? {
        ...c,
        hp: parseInt(String(newHp)) || 0,
        maxHp: parseInt(String(newMaxHp)) || 0,
        tempHp: parseInt(String(newTempHp)) || 0
      } : c
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
    // Ensure all numeric values are properly parsed when loading
    const fixedCombatants = encounter.combatants.map(c => ({
      ...c,
      hp: parseInt(String(c.hp)) || 0,
      maxHp: parseInt(String(c.maxHp)) || 0,
      ac: parseInt(String(c.ac)) || 0,
      initiative: parseInt(String(c.initiative)) || 0,
      tempHp: parseInt(String(c.tempHp)) || 0,
      level: c.level ? parseInt(String(c.level)) : undefined,
      xp: c.xp ? parseInt(String(c.xp)) : undefined
    }))

    setCombatants(fixedCombatants)
    setRound(parseInt(String(encounter.round)) || 1)
    setCurrentTurn(parseInt(String(encounter.currentTurn)) || 0)
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
              onShowSaveDialog={() => {
                setSaveEncounterName(encounterName)
                setShowSaveDialog(true)
              }}
              onShowLoadDialog={() => setShowLoadDialog(true)}
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
                className={`
                  flex items-center rounded-2xl px-4 py-2 text-white font-sans gap-3 mb-2 transition-all duration-200 cursor-pointer hover:shadow-lg
                  ${index === currentTurn
                    ? 'bg-gray-900 border-2 border-red-400'
                    : 'bg-gray-900 hover:bg-gray-800 border-2 border-transparent'
                  }
                  ${selectedCombatant?.id === combatant.id ? 'ring-2 ring-blue-500' : ''}
                `}
              >
                {/* Initiative - Dice emoji + input without box */}
                <div className="flex items-center gap-2">
                  <span className="text-xl">🎲</span>
                  <input
                    type="number"
                    value={combatant.initiative}
                    onChange={(e) => updateCreature(combatant.id, 'initiative', parseInt(e.target.value) || 0)}
                    className="bg-gray-800 border-none text-white font-bold text-center w-12 text-sm focus:outline-none rounded px-2 py-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>

                {/* Combatant Info - Compact name with CR chip at end */}
                <div className="flex-1 min-w-0">
                  {/* Name row with CR chip at end */}
                  <div className="flex items-center justify-between mb-1">
                    <input
                      type="text"
                      value={combatant.name}
                      onChange={(e) => updateCreature(combatant.id, 'name', e.target.value)}
                      className="bg-transparent border-none text-white font-bold text-sm focus:outline-none flex-1 min-w-0 mr-1"
                      onClick={(e) => e.stopPropagation()}
                    />
                    {combatant.isPC ? (
                      combatant.level && (
                        <span className="bg-green-900 text-green-300 px-2 py-1 rounded text-xs font-medium whitespace-nowrap ml-1">
                          Lvl {combatant.level}
                        </span>
                      )
                    ) : (
                      combatant.cr && (
                        <span className="bg-amber-900 text-amber-300 px-2 py-1 rounded text-xs font-medium whitespace-nowrap ml-1">
                          CR {combatant.cr}
                        </span>
                      )
                    )}
                  </div>

                  {/* Conditions immediately below name */}
                  <div className="flex flex-wrap gap-1" onClick={(e) => e.stopPropagation()}>
                    <ConditionsTracker
                      conditions={combatant.conditions}
                      onAddCondition={(condition) => addCondition(combatant.id, condition)}
                      onRemoveCondition={(index) => removeCondition(combatant.id, index)}
                    />
                  </div>
                </div>

                {/* HP and AC - Compact boxes like in image */}
                <div className="flex items-center gap-3">
                  {/* HP */}
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-1 text-xs text-red-400 mb-1">
                      <span>❤️</span>
                      <span>HP</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openHPModal(combatant, e);
                      }}
                      className="bg-gray-800 hover:bg-gray-700 rounded px-2 py-1 text-center min-w-[60px] transition-colors"
                      title="Manage HP"
                    >
                      <div className="text-white font-bold text-sm whitespace-nowrap">
                        {parseInt(String(combatant.hp)) || 0}/{parseInt(String(combatant.maxHp)) || 0}
                        {(parseInt(String(combatant.tempHp)) || 0) > 0 && (
                          <span className="text-blue-400 ml-3"> +{parseInt(String(combatant.tempHp)) || 0}</span>
                        )}
                      </div>
                    </button>
                  </div>

                  {/* AC */}
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-1 text-xs text-blue-400 mb-1">
                      <span>🛡️</span>
                      <span>AC</span>
                    </div>
                    <div className="bg-gray-800 rounded px-2 py-1 w-10">
                      <input
                        type="number"
                        value={combatant.ac}
                        onChange={(e) => updateCreature(combatant.id, 'ac', parseInt(e.target.value) || 0)}
                        className="bg-transparent border-none text-white font-bold text-center w-full text-sm focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                </div>

                {/* Close Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeCreature(combatant.id);
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white rounded px-2 py-1 text-sm font-bold transition-colors"
                >
                  ×
                </button>
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

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 flex items-center justify-center z-[9999] bg-black bg-opacity-70 backdrop-blur-sm">
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 w-96 mx-4 shadow-2xl">
            <h3 className="text-lg font-semibold mb-4 text-white">Save Encounter</h3>
            <input
              type="text"
              placeholder="Enter encounter name..."
              value={saveEncounterName}
              onChange={(e) => setSaveEncounterName(e.target.value)}
              className="w-full bg-gray-700 text-white px-3 py-2 mb-4 rounded border-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowSaveDialog(false)
                  setSaveEncounterName('')
                }}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveEncounter}
                disabled={!saveEncounterName.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Load Dialog */}
      {showLoadDialog && (
        <div className="fixed inset-0 flex items-center justify-center z-[9999] bg-black bg-opacity-70 backdrop-blur-sm">
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 w-96 max-h-96 overflow-hidden mx-4 shadow-2xl">
            <h3 className="text-lg font-semibold mb-4 text-white">Load Encounter</h3>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {savedEncounters.length === 0 ? (
                <div className="text-gray-400 text-center py-8">No saved encounters</div>
              ) : (
                savedEncounters.map((encounter) => (
                  <div key={encounter.id} className="flex items-center justify-between p-3 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors">
                    <div className="flex-1">
                      <div className="font-medium text-white">{encounter.name}</div>
                      <div className="text-sm text-gray-400">
                        {encounter.combatants.length} combatants • Round {encounter.round} • {new Date(encounter.savedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => loadSavedEncounter(encounter)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 text-sm rounded transition-colors"
                      >
                        Load
                      </button>
                      <button
                        onClick={() => deleteEncounter(encounter.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 text-sm rounded transition-colors"
                        title="Delete encounter"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowLoadDialog(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App