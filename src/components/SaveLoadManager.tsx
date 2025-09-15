import React, { useState, useEffect } from 'react'
import { Save, FolderOpen, Trash2, Download, Upload } from 'lucide-react'

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

interface SavedEncounter {
  id: string
  name: string
  combatants: Combatant[]
  round: number
  currentTurn: number
  notes: string
  savedAt: string
}

interface SaveLoadManagerProps {
  combatants: Combatant[]
  round: number
  currentTurn: number
  encounterNotes: string
  encounterName: string
  onLoad: (encounter: SavedEncounter) => void
  onEncounterNameChange: (name: string) => void
}

export const SaveLoadManager: React.FC<SaveLoadManagerProps> = ({
  combatants,
  round,
  currentTurn,
  encounterNotes,
  encounterName,
  onLoad,
  onEncounterNameChange
}) => {
  const [savedEncounters, setSavedEncounters] = useState<SavedEncounter[]>([])
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [showLoadDialog, setShowLoadDialog] = useState(false)
  const [saveEncounterName, setSaveEncounterName] = useState('')

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

  const loadEncounter = (encounter: SavedEncounter) => {
    onLoad(encounter)
    setShowLoadDialog(false)
  }

  const deleteEncounter = (encounterId: string) => {
    setSavedEncounters(prev => prev.filter(enc => enc.id !== encounterId))
  }

  const exportEncounter = () => {
    const currentEncounter = {
      name: encounterName,
      combatants,
      round,
      currentTurn,
      notes: encounterNotes,
      exportedAt: new Date().toISOString()
    }
    
    const dataStr = JSON.stringify(currentEncounter, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `${encounterName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`
    link.click()
    
    URL.revokeObjectURL(url)
  }

  const importEncounter = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string)
        const encounter: SavedEncounter = {
          id: Date.now().toString(),
          name: imported.name || 'Imported Encounter',
          combatants: imported.combatants || [],
          round: imported.round || 1,
          currentTurn: imported.currentTurn || 0,
          notes: imported.notes || '',
          savedAt: new Date().toISOString()
        }
        loadEncounter(encounter)
      } catch (error) {
        alert('Error importing encounter: Invalid file format')
      }
    }
    reader.readAsText(file)
    
    // Reset the input
    event.target.value = ''
  }

  return (
    <div className="flex items-center gap-2">
      {/* Encounter Name */}
      <input
        type="text"
        value={encounterName}
        onChange={(e) => onEncounterNameChange(e.target.value)}
        className="text-xl font-semibold bg-transparent border-none focus:outline-none focus:bg-white focus:border focus:border-gray-300 rounded px-2 py-1"
        placeholder="Encounter Name"
      />

      {/* Save Button */}
      <button
        onClick={() => {
          setSaveEncounterName(encounterName)
          setShowSaveDialog(true)
        }}
        className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1 transition-colors"
        title="Save encounter"
      >
        <Save className="w-4 h-4" />
        Save
      </button>

      {/* Load Button */}
      <button
        onClick={() => setShowLoadDialog(true)}
        className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-1 transition-colors"
        title="Load saved encounter"
      >
        <FolderOpen className="w-4 h-4" />
        Load
      </button>

      {/* Export Button */}
      <button
        onClick={exportEncounter}
        className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-1 transition-colors"
        title="Export encounter to file"
      >
        <Download className="w-4 h-4" />
        Export
      </button>

      {/* Import Button */}
      <label className="px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-1 transition-colors cursor-pointer">
        <Upload className="w-4 h-4" />
        Import
        <input
          type="file"
          accept=".json"
          onChange={importEncounter}
          className="hidden"
        />
      </label>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Save Encounter</h3>
            <input
              type="text"
              placeholder="Enter encounter name..."
              value={saveEncounterName}
              onChange={(e) => setSaveEncounterName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowSaveDialog(false)
                  setSaveEncounterName('')
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveEncounter}
                disabled={!saveEncounterName.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Load Dialog */}
      {showLoadDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-h-96 overflow-hidden">
            <h3 className="text-lg font-semibold mb-4">Load Encounter</h3>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {savedEncounters.length === 0 ? (
                <div className="text-gray-500 text-center py-8">No saved encounters</div>
              ) : (
                savedEncounters.map((encounter) => (
                  <div key={encounter.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <div className="font-medium">{encounter.name}</div>
                      <div className="text-sm text-gray-500">
                        {encounter.combatants.length} combatants • Round {encounter.round} • {new Date(encounter.savedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => loadEncounter(encounter)}
                        className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm transition-colors"
                      >
                        Load
                      </button>
                      <button
                        onClick={() => deleteEncounter(encounter.id)}
                        className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm transition-colors"
                        title="Delete encounter"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowLoadDialog(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
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