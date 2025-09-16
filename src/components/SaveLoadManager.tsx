import React, { useState } from 'react'
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
  onShowSaveDialog: () => void
  onShowLoadDialog: () => void
}

export { SavedEncounter };

export const SaveLoadManager: React.FC<SaveLoadManagerProps> = ({
  combatants,
  round,
  currentTurn,
  encounterNotes,
  encounterName,
  onLoad,
  onEncounterNameChange,
  onShowSaveDialog,
  onShowLoadDialog
}) => {


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
        onLoad(encounter)
      } catch (error) {
        alert('Error importing encounter: Invalid file format')
      }
    }
    reader.readAsText(file)
    
    // Reset the input
    event.target.value = ''
  }

  return (
    <>
      <div className="flex items-center gap-2">
        {/* Encounter Name */}
        <input
          type="text"
          value={encounterName}
          onChange={(e) => onEncounterNameChange(e.target.value)}
          className="input-dnd text-xl font-semibold bg-transparent border-none focus:outline-none px-2 py-1"
          placeholder="Encounter Name"
        />

        {/* Save Button */}
        <button
          onClick={onShowSaveDialog}
          className="btn-dnd btn-dnd-primary flex items-center gap-1"
          title="Save encounter"
        >
          <Save className="w-4 h-4" />
          Save
        </button>

        {/* Load Button */}
        <button
          onClick={onShowLoadDialog}
          className="btn-dnd btn-dnd-primary flex items-center gap-1"
          title="Load saved encounter"
        >
          <FolderOpen className="w-4 h-4" />
          Load
        </button>

        {/* Export Button */}
        <button
          onClick={exportEncounter}
          className="btn-dnd btn-dnd-success flex items-center gap-1"
          title="Export encounter to file"
        >
          <Download className="w-4 h-4" />
          Export
        </button>

        {/* Import Button */}
        <label className="btn-dnd btn-dnd-warning flex items-center gap-1 cursor-pointer">
          <Upload className="w-4 h-4" />
          Import
          <input
            type="file"
            accept=".json"
            onChange={importEncounter}
            className="hidden"
          />
        </label>
      </div>

    </>
  )
}