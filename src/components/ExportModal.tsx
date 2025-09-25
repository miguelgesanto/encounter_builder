import React, { useState } from 'react'
import { Download, X, FileText, Database, FileSpreadsheet, Check } from 'lucide-react'
import { Combatant } from '../types/combatant'
import { ExportFormat, ExportOptions, exportCombatants, downloadExport, generateExportFilename } from '../utils/exportUtils'

interface ExportModalProps {
  combatants: Combatant[]
  isOpen: boolean
  onClose: () => void
  title?: string
}

export const ExportModal: React.FC<ExportModalProps> = ({
  combatants,
  isOpen,
  onClose,
  title = 'Export Data'
}) => {
  const [format, setFormat] = useState<ExportFormat>('json')
  const [includeStats, setIncludeStats] = useState(true)
  const [includeConditions, setIncludeConditions] = useState(true)
  const [includeImportSource, setIncludeImportSource] = useState(false)
  const [customFilename, setCustomFilename] = useState('')
  const [isExporting, setIsExporting] = useState(false)
  const [exportSuccess, setExportSuccess] = useState(false)

  if (!isOpen) return null

  const suggestedFilename = generateExportFilename(combatants)

  const handleExport = async () => {
    if (combatants.length === 0) return

    setIsExporting(true)
    setExportSuccess(false)

    try {
      const options: ExportOptions = {
        format,
        includeStats,
        includeConditions,
        includeImportSource
      }

      const exportData = exportCombatants(combatants, options)
      const filename = customFilename.trim() || suggestedFilename

      downloadExport(exportData, filename, format)

      setExportSuccess(true)
      setTimeout(() => {
        setExportSuccess(false)
        onClose()
      }, 2000)
    } catch (error) {
      console.error('Export failed:', error)
      alert('Export failed. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  const formatOptions = [
    {
      value: 'json' as ExportFormat,
      label: 'JSON',
      description: 'Structured data format, good for importing back',
      icon: <Database className="w-4 h-4" />
    },
    {
      value: 'text' as ExportFormat,
      label: 'Text',
      description: 'Human-readable stat blocks',
      icon: <FileText className="w-4 h-4" />
    },
    {
      value: 'csv' as ExportFormat,
      label: 'CSV',
      description: 'Spreadsheet format for analysis',
      icon: <FileSpreadsheet className="w-4 h-4" />
    }
  ]

  const pcCount = combatants.filter(c => c.isPC).length
  const monsterCount = combatants.filter(c => !c.isPC).length

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-dnd-card border border-dnd rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b border-dnd">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-dnd-primary flex items-center gap-2">
              <Download className="w-5 h-5" />
              {title}
            </h3>
            <button
              onClick={onClose}
              className="text-dnd-muted hover:text-dnd-secondary"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Export Summary */}
          <div className="bg-dnd-primary/10 rounded p-3">
            <div className="text-sm text-dnd-secondary mb-2">Exporting:</div>
            <div className="text-dnd-primary">
              {combatants.length} {combatants.length === 1 ? 'item' : 'items'}
              {pcCount > 0 && ` (${pcCount} PC${pcCount > 1 ? 's' : ''})`}
              {monsterCount > 0 && ` (${monsterCount} creature${monsterCount > 1 ? 's' : ''})`}
            </div>
          </div>

          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-dnd-secondary mb-2">
              Export Format
            </label>
            <div className="space-y-2">
              {formatOptions.map(option => (
                <div
                  key={option.value}
                  className={`p-3 border rounded-lg cursor-pointer transition-all ${
                    format === option.value
                      ? 'border-dnd-focus bg-dnd-primary/10'
                      : 'border-dnd hover:border-dnd-focus hover:bg-dnd-hover'
                  }`}
                  onClick={() => setFormat(option.value)}
                >
                  <div className="flex items-center gap-3">
                    <div className={format === option.value ? 'text-dnd-primary' : 'text-dnd-muted'}>
                      {option.icon}
                    </div>
                    <div>
                      <div className="text-dnd-primary font-medium">{option.label}</div>
                      <div className="text-xs text-dnd-muted">{option.description}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Export Options */}
          <div>
            <label className="block text-sm font-medium text-dnd-secondary mb-2">
              Include Additional Data
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={includeStats}
                  onChange={(e) => setIncludeStats(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm text-dnd-primary">
                  Temporary HP and detailed stats
                </span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={includeConditions}
                  onChange={(e) => setIncludeConditions(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm text-dnd-primary">
                  Active conditions and durations
                </span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={includeImportSource}
                  onChange={(e) => setIncludeImportSource(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm text-dnd-primary">
                  Import source information
                </span>
              </label>
            </div>
          </div>

          {/* Filename */}
          <div>
            <label className="block text-sm font-medium text-dnd-secondary mb-2">
              Filename (optional)
            </label>
            <input
              type="text"
              value={customFilename}
              onChange={(e) => setCustomFilename(e.target.value)}
              placeholder={suggestedFilename}
              className="input-dnd w-full px-3 py-2 text-sm"
            />
            <div className="text-xs text-dnd-muted mt-1">
              Will be saved as: {(customFilename.trim() || suggestedFilename)}.{format}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-dnd">
          <div className="flex gap-2 justify-end">
            <button
              onClick={onClose}
              className="btn-dnd btn-dnd-secondary px-4 py-2"
              disabled={isExporting}
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting || combatants.length === 0}
              className="btn-dnd btn-dnd-primary px-4 py-2 flex items-center gap-2"
            >
              {isExporting && (
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              )}
              {exportSuccess && (
                <Check className="w-4 h-4" />
              )}
              {exportSuccess ? 'Exported!' : isExporting ? 'Exporting...' : 'Export'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExportModal