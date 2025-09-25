import React, { useState } from 'react'
import { Upload, AlertCircle, CheckCircle, X, FileText, Users, Link } from 'lucide-react'
import { detectFormat, FormatDetectionResult, detectBulkImport } from '../utils/importUtils'
import { parseMonster, parseBulkMonsters, importDataToCombatant, MonsterImportData } from '../utils/monsterParser'
// Enhanced stat block parser removed - functionality integrated into monsterParser
import { parseMonsterFromUrl, convertUrlParsedToCombatant, detectUrlSource } from '../utils/urlStatBlockParser'

interface MonsterImportProps {
  onImportMonster: (monster: any) => void
  onImportMultiple?: (monsters: any[]) => void
  onCancel: () => void
}

export const MonsterImport: React.FC<MonsterImportProps> = ({
  onImportMonster,
  onImportMultiple,
  onCancel
}) => {
  const [importText, setImportText] = useState('')
  const [detection, setDetection] = useState<FormatDetectionResult | null>(null)
  const [isBulkImport, setIsBulkImport] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [importResult, setImportResult] = useState<any>(null)
  const [bulkResults, setBulkResults] = useState<any[]>([])
  const [showPreview, setShowPreview] = useState(false)
  const [importMode, setImportMode] = useState<'text' | 'url'>('text')
  const [urlInput, setUrlInput] = useState('')

  const handleTextChange = (text: string) => {
    setImportText(text)
    setImportResult(null)
    setBulkResults([])

    if (text.trim()) {
      const detected = detectFormat(text)
      console.log('🔍 FORMAT DETECTION:', detected)
      setDetection(detected)

      // Check for bulk import
      const bulkSections = detectBulkImport(text)
      console.log('🔍 BULK SECTIONS COUNT:', bulkSections.length)
      console.log('🔍 IS BULK IMPORT:', bulkSections.length > 1)
      setIsBulkImport(bulkSections.length > 1)

      // Warn if looks like PC
      if (detected.type === 'pc') {
        setImportResult({
          success: false,
          warnings: ['This looks like a player character. Use "Import PC" in the PC section instead.'],
          errors: []
        })
      }
    } else {
      setDetection(null)
      setIsBulkImport(false)
    }
  }

  const handleImport = async () => {
    if (!importText.trim()) {
      setImportResult({
        success: false,
        errors: ['Please enter some text to import'],
        warnings: []
      })
      return
    }

    setIsImporting(true)
    setImportResult(null)
    setBulkResults([])

    try {
      if (isBulkImport) {
        console.log('🔍 BULK IMPORT: Using parseBulkMonsters')
        const results = parseBulkMonsters(importText)
        console.log('🔍 BULK RESULTS:', results)

        // Filter out failed results and collect their errors
        const successfulResults = results.filter(r => r.success)
        const failedResults = results.filter(r => !r.success)

        setBulkResults(successfulResults)

        if (successfulResults.length > 0) {
          setShowPreview(true)

          // Show warnings if some imports failed
          if (failedResults.length > 0) {
            const allErrors = failedResults.flatMap(r => r.errors || [])
            setImportResult({
              success: true,
              warnings: [`${failedResults.length} of ${results.length} creatures failed to import`, ...allErrors.slice(0, 5)],
              errors: []
            })
          }
        } else {
          const allErrors = failedResults.flatMap(r => r.errors || [])
          setImportResult({
            success: false,
            errors: ['No valid monsters found in the text', ...allErrors.slice(0, 3)],
            warnings: []
          })
        }
      } else {
        console.log('🧹 Starting text cleanup...')

        let finalText = importText;
        let cleanupWarnings: string[] = [];

        try {
          console.log('🚀 Using basic stat block parser...')

          // Use basic parser
          const convertedData = parseMonster(importText);

          const result = {
            success: true,
            data: convertedData,
            errors: [],
            warnings: ['Parsed using basic parser - please verify imported data']
          };

          setImportResult(result);
        } catch (error) {
          console.error('Text cleanup failed:', error);

          // Final fallback - set error result
          setImportResult({
            success: false,
            errors: ['Failed to parse stat block. Please check the format and try again.'],
            warnings: ['Enhanced parser failed - text may be corrupted or in unsupported format']
          });
        }

        if (importResult?.success) {
          setShowPreview(true)
        }
      }
    } catch (error) {
      console.error('Import error:', error)
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
    if (isBulkImport && bulkResults.length > 0) {
      if (onImportMultiple) {
        const monsters = bulkResults.map(result => ({
          ...importDataToCombatant(result.data as MonsterImportData),
          importSource: 'text',
          importedAt: new Date().toISOString()
        }))
        onImportMultiple(monsters)
      }
    } else if (importResult?.success) {
      // Convert the parsed data to proper Combatant format
      console.log('🔍 CONVERTING TO COMBATANT:', importResult.data)
      console.log('🔍 Source HP:', importResult.data.hp)
      console.log('🔍 Source Speed:', importResult.data.speed)
      console.log('🔍 Source Skills:', importResult.data.skills)
      const id = Date.now().toString() + Math.random();
      const monster = {
        id,
        name: importResult.data.name,
        hp: importResult.data.hp,
        maxHp: importResult.data.maxHp,
        ac: importResult.data.ac,
        initiative: importResult.data.initiative,
        isPC: importResult.data.isPC,
        conditions: importResult.data.conditions || [],
        tempHp: importResult.data.tempHp || 0,
        cr: importResult.data.cr,
        type: importResult.data.type,
        size: importResult.data.size,
        alignment: importResult.data.alignment,
        speed: importResult.data.speed,
        abilities: importResult.data.abilities,
        saves: importResult.data.saves,
        skills: importResult.data.skills,
        damageResistances: importResult.data.damageResistances,
        damageImmunities: importResult.data.damageImmunities,
        conditionImmunities: importResult.data.conditionImmunities,
        senses: importResult.data.senses,
        languages: importResult.data.languages,
        actions: importResult.data.actions,
        legendaryActions: importResult.data.legendaryActions,
        legendaryResistances: importResult.data.legendaryResistances,
        lairActions: importResult.data.lairActions,
        regionalEffects: importResult.data.regionalEffects,
        specialAbilities: importResult.data.specialAbilities,
        xp: importResult.data.xp,
        importSource: 'text',
        importedAt: new Date().toISOString()
      }
      console.log('🔍 FINAL MONSTER OBJECT:', monster)
      console.log('🔍 Final HP:', monster.hp)
      console.log('🔍 Final Speed:', monster.speed)
      console.log('🔍 Final Skills:', monster.skills)
      console.log('🔍 Legendary Actions:', monster.legendaryActions?.length || 0)
      console.log('🔍 Lair Actions:', monster.lairActions?.length || 0)
      onImportMonster(monster)
    }
  }

  const getDetectionIcon = () => {
    if (!detection) return null

    if (detection.confidence === 'high' && detection.type === 'monster') {
      return <CheckCircle className="w-4 h-4 text-green-500" />
    } else if (detection.type === 'pc') {
      return <AlertCircle className="w-4 h-4 text-orange-500" />
    } else {
      return <AlertCircle className="w-4 h-4 text-yellow-500" />
    }
  }

  const getDetectionMessage = () => {
    if (!detection) return ''

    if (detection.type === 'monster' && detection.confidence === 'high') {
      const bulkText = isBulkImport ? ` (${detectBulkImport(importText).length} creatures detected)` : ''
      return `Detected monster format${bulkText}`
    } else if (detection.type === 'pc') {
      return 'Detected PC format - use PC import instead'
    } else if (detection.confidence === 'low') {
      return 'Format unclear - please verify import type'
    } else {
      return `Detected ${detection.type} with ${detection.confidence} confidence`
    }
  }

  if (showPreview) {
    if (isBulkImport && bulkResults.length > 0) {
      return (
        <div className="bg-dnd-card border border-dnd rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-dnd-primary flex items-center gap-2">
              <Users className="w-5 h-5" />
              Bulk Import Preview ({bulkResults.length} monsters)
            </h3>
            <button
              onClick={() => setShowPreview(false)}
              className="text-dnd-muted hover:text-dnd-secondary"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="max-h-64 overflow-y-auto space-y-2">
            {bulkResults.map((result, index) => {
              const monster = result.data as MonsterImportData
              return (
                <div key={index} className="bg-dnd-primary/10 rounded p-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-dnd-secondary">Name:</span>
                      <span className="text-dnd-primary ml-2">{monster.name}</span>
                    </div>
                    <div>
                      <span className="font-medium text-dnd-secondary">CR:</span>
                      <span className="text-dnd-primary ml-2">{monster.cr}</span>
                    </div>
                    <div>
                      <span className="font-medium text-dnd-secondary">HP:</span>
                      <span className="text-dnd-primary ml-2">{monster.hp}</span>
                    </div>
                    <div>
                      <span className="font-medium text-dnd-secondary">AC:</span>
                      <span className="text-dnd-primary ml-2">{monster.ac}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

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
              Add All to Creature List
            </button>
          </div>
        </div>
      )
    } else if (importResult?.success) {
      const monster = importResult.data as MonsterImportData
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
                <span className="text-dnd-primary ml-2">{monster.name}</span>
              </div>
              <div>
                <span className="font-medium text-dnd-secondary">CR:</span>
                <span className="text-dnd-primary ml-2">{monster.cr} ({monster.xp} XP)</span>
              </div>
              <div>
                <span className="font-medium text-dnd-secondary">HP:</span>
                <span className="text-dnd-primary ml-2">{monster.hp}</span>
              </div>
              <div>
                <span className="font-medium text-dnd-secondary">AC:</span>
                <span className="text-dnd-primary ml-2">{monster.ac}</span>
              </div>
              {monster.type && (
                <div>
                  <span className="font-medium text-dnd-secondary">Type:</span>
                  <span className="text-dnd-primary ml-2 capitalize">{monster.type}</span>
                </div>
              )}
              {monster.environment && (
                <div>
                  <span className="font-medium text-dnd-secondary">Environment:</span>
                  <span className="text-dnd-primary ml-2 capitalize">{monster.environment}</span>
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
              Add to Creature List
            </button>
          </div>
        </div>
      )
    }
  }

  return (
    <div className="bg-dnd-card border border-dnd rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-dnd-primary flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Import Monster
          </h3>
          <p className="text-xs text-dnd-muted mt-1">
            💡 For complete stat blocks with lair actions and regional effects, visit{' '}
            <a
              href="https://www.aidedd.org/dnd/monstres.php"
              target="_blank"
              rel="noopener noreferrer"
              className="text-dnd-primary hover:underline"
            >
              aidedd.org
            </a>
            {' '}and copy the stat block text
          </p>
        </div>
        <button
          onClick={onCancel}
          className="text-dnd-muted hover:text-dnd-secondary"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-dnd-secondary">
            Paste stat block text
          </label>
          <textarea
            value={importText}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder="Paste stat block text like:

Zombie
Medium Undead, Neutral Evil
Armor Class 8
Hit Points 22 (3d8 + 9)
Speed 20 ft.
STR 13 (+1) DEX 6 (-2) CON 16 (+3) INT 3 (-4) WIS 6 (-2) CHA 5 (-3)

Or paste multiple creatures at once for bulk import."
            className="input-dnd w-full p-3 text-sm resize-none"
            rows={6}
            disabled={isImporting}
          />
        </div>

        {detection && (
          <div className="flex items-center gap-2 text-sm">
            {getDetectionIcon()}
            <span className={`${
              detection.type === 'pc' ? 'text-orange-600' :
              detection.confidence === 'high' ? 'text-green-600' :
              'text-yellow-600'
            }`}>
              {getDetectionMessage()}
            </span>
            {isBulkImport && (
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                Bulk Import
              </span>
            )}
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
          disabled={!importText.trim() || isImporting || (detection?.type === 'pc')}
          className="btn-dnd btn-dnd-primary px-4 py-2 flex items-center gap-2"
        >
          {isImporting && <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />}
          {isBulkImport ? 'Import Multiple' : 'Import'}
        </button>
      </div>
    </div>
  )
}