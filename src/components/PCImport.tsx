import React, { useState } from 'react'
import { Upload, AlertCircle, CheckCircle, X, FileText } from 'lucide-react'
import { detectFormat, FormatDetectionResult } from '../utils/importUtils'
import { parsePC, parseDnDBeyondURL, importDataToCombatant, PCImportData } from '../utils/characterParser'
import { Combatant } from '../types/combatant'

interface PCImportProps {
  onImportPC: (pc: Combatant) => void
  onCancel: () => void
}

export const PCImport: React.FC<PCImportProps> = ({ onImportPC, onCancel }) => {
  const [importText, setImportText] = useState('')
  const [detection, setDetection] = useState<FormatDetectionResult | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [importResult, setImportResult] = useState<any>(null)
  const [showPreview, setShowPreview] = useState(false)

  const handleTextChange = (text: string) => {
    setImportText(text)
    setImportResult(null)

    if (text.trim()) {
      const detected = detectFormat(text)
      setDetection(detected)

      // Warn if looks like monster
      if (detected.type === 'monster') {
        setImportResult({
          success: false,
          warnings: ['This looks like a monster stat block. Use "Import Homebrew" in the creature browser instead.'],
          errors: []
        })
      }
    } else {
      setDetection(null)
    }
  }

  const handleImport = async () => {
    if (!importText.trim()) {
      setImportResult({
        success: false,
        errors: ['Please enter some text or a D&D Beyond URL to import'],
        warnings: []
      })
      return
    }

    setIsImporting(true)
    setImportResult(null)

    try {
      let result

      // Check if it's a D&D Beyond URL
      if (importText.includes('dndbeyond.com/characters')) {
        result = await parseDnDBeyondURL(importText)
      } else {
        result = parsePC(importText)
      }

      setImportResult(result)

      if (result.success) {
        const combatant = importDataToCombatant(result.data as PCImportData)
        setShowPreview(true)
      }
    } catch (error) {
      console.error('PC Import error:', error)
      setImportResult({
        success: false,
        errors: [`Import failed: ${error instanceof Error ? error.message : 'An unexpected error occurred. Please check your input and try again.'}`],
        warnings: []
      })
    } finally {
      setIsImporting(false)
    }
  }

  const handleConfirmImport = () => {
    if (importResult?.success) {
      const combatant = importDataToCombatant(importResult.data as PCImportData)
      // Override import source if it was from D&D Beyond
      if (importResult.source === 'dndbeyond') {
        combatant.importSource = 'dndbeyond'
      }
      onImportPC(combatant)
    }
  }

  const getDetectionIcon = () => {
    if (!detection) return null

    if (detection.confidence === 'high' && detection.type === 'pc') {
      return <CheckCircle className="w-4 h-4 text-green-500" />
    } else if (detection.type === 'monster') {
      return <AlertCircle className="w-4 h-4 text-orange-500" />
    } else {
      return <AlertCircle className="w-4 h-4 text-yellow-500" />
    }
  }

  const getDetectionMessage = () => {
    if (!detection) return ''

    if (detection.type === 'pc' && detection.confidence === 'high') {
      return `Detected PC format (${detection.source === 'dndbeyond' ? 'D&D Beyond' : 'text'})`
    } else if (detection.type === 'monster') {
      return 'Detected monster format - use monster import instead'
    } else if (detection.confidence === 'low') {
      return 'Format unclear - please verify import type'
    } else {
      return `Detected ${detection.type} with ${detection.confidence} confidence`
    }
  }

  if (showPreview && importResult?.success) {
    const pc = importResult.data as PCImportData
    return (
      <div className="bg-dnd-card border border-dnd rounded-lg p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-dnd-primary flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Import Preview
          </h3>
          <button
            onClick={() => setShowPreview(false)}
            className="text-dnd-muted hover:text-dnd-secondary"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-dnd-primary/10 rounded p-3 space-y-2">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-dnd-secondary">Name:</span>
              <span className="text-dnd-primary ml-2">{pc.name}</span>
            </div>
            <div>
              <span className="font-medium text-dnd-secondary">Level:</span>
              <span className="text-dnd-primary ml-2">{pc.level}</span>
            </div>
            <div>
              <span className="font-medium text-dnd-secondary">HP:</span>
              <span className="text-dnd-primary ml-2">{pc.hp}</span>
            </div>
            <div>
              <span className="font-medium text-dnd-secondary">AC:</span>
              <span className="text-dnd-primary ml-2">{pc.ac}</span>
            </div>
            {pc.class && (
              <div>
                <span className="font-medium text-dnd-secondary">Class:</span>
                <span className="text-dnd-primary ml-2">{pc.class}</span>
              </div>
            )}
            {pc.race && (
              <div>
                <span className="font-medium text-dnd-secondary">Race:</span>
                <span className="text-dnd-primary ml-2">{pc.race}</span>
              </div>
            )}
          </div>
        </div>

        {importResult.warnings.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
              <div className="text-sm">
                <div className="font-medium text-yellow-800">Warnings:</div>
                <ul className="list-disc list-inside text-yellow-700">
                  {importResult.warnings.map((warning: string, index: number) => (
                    <li key={index}>{warning}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2 justify-end">
          <button
            onClick={() => setShowPreview(false)}
            className="btn-dnd btn-dnd-secondary px-4 py-2"
          >
            Edit
          </button>
          <button
            onClick={handleConfirmImport}
            className="btn-dnd btn-dnd-primary px-4 py-2"
          >
            Add to Encounter
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-dnd-card border border-dnd rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-dnd-primary flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Import PC
        </h3>
        <button
          onClick={onCancel}
          className="text-dnd-muted hover:text-dnd-secondary"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3">
        <textarea
          value={importText}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder="Paste D&D Beyond URL, character sheet text, or character details...

Examples:
• https://dndbeyond.com/characters/12345
• Name: Aragorn, Level: 5, HP: 58, AC: 18
• Character Name: Legolas
  Class: Ranger
  Level: 4
  HP: 32
  AC: 16"
          className="input-dnd w-full h-32 p-3 resize-none text-sm"
          disabled={isImporting}
        />

        {detection && (
          <div className="flex items-center gap-2 text-sm">
            {getDetectionIcon()}
            <span className={`${
              detection.type === 'monster' ? 'text-orange-600' :
              detection.confidence === 'high' ? 'text-green-600' :
              'text-yellow-600'
            }`}>
              {getDetectionMessage()}
            </span>
          </div>
        )}

        {importResult && !importResult.success && (
          <div className="space-y-2">
            {importResult.warnings?.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                  <div className="text-sm">
                    <div className="font-medium text-yellow-800">Warnings:</div>
                    <ul className="list-disc list-inside text-yellow-700">
                      {importResult.warnings.map((warning: string, index: number) => (
                        <li key={index}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {importResult.errors?.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" />
                  <div className="text-sm">
                    <div className="font-medium text-red-800">Errors:</div>
                    <ul className="list-disc list-inside text-red-700">
                      {importResult.errors.map((error: string, index: number) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-2 justify-end">
        <button
          onClick={onCancel}
          className="btn-dnd btn-dnd-secondary px-4 py-2"
          disabled={isImporting}
        >
          Cancel
        </button>
        <button
          onClick={handleImport}
          disabled={!importText.trim() || isImporting || (detection?.type === 'monster')}
          className="btn-dnd btn-dnd-primary px-4 py-2 flex items-center gap-2"
        >
          {isImporting && <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />}
          Import
        </button>
      </div>
    </div>
  )
}