import React, { useState } from 'react'
import { Link, AlertCircle, CheckCircle, X, Loader } from 'lucide-react'
import { parseMonsterFromUrl, convertUrlParsedToCombatant, detectUrlSource } from '../utils/urlStatBlockParser'

interface UrlMonsterImportProps {
  onImportMonster: (monster: any) => void
  onCancel: () => void
}

export const UrlMonsterImport: React.FC<UrlMonsterImportProps> = ({ onImportMonster, onCancel }) => {
  const [urlInput, setUrlInput] = useState('')
  const [isImporting, setIsImporting] = useState(false)
  const [importResult, setImportResult] = useState<any>(null)

  const handleUrlImport = async () => {
    if (!urlInput.trim()) return;

    const source = detectUrlSource(urlInput);
    if (!source) {
      setImportResult({
        success: false,
        errors: ['Unsupported URL. Supported sites: aidedd.org, D&D Beyond, Roll20, 5etools'],
        warnings: []
      });
      return;
    }

    setIsImporting(true);
    try {
      const monsterData = await parseMonsterFromUrl(urlInput);
      if (monsterData) {
        const combatant = convertUrlParsedToCombatant(monsterData);
        onImportMonster(combatant);
        setImportResult({
          success: true,
          message: `Successfully imported ${monsterData.name} from ${source}!`,
          data: monsterData
        });
      } else {
        throw new Error('Failed to parse monster data');
      }
    } catch (error: any) {
      setImportResult({
        success: false,
        errors: [error.message || 'Failed to import from URL. Try copying the stat block text instead.'],
        warnings: []
      });
    } finally {
      setIsImporting(false);
    }
  }

  const getSupportedSites = () => [
    { name: 'Aidedd.org', url: 'https://www.aidedd.org/dnd/monstres.php?vo=ancient-red-dragon', icon: '🐉' },
    { name: 'D&D Beyond', url: 'https://www.dndbeyond.com/monsters/16782-ancient-red-dragon', icon: '⚔️' },
    { name: 'Roll20', url: 'https://roll20.net/compendium/dnd5e/Monsters:Ancient%20Red%20Dragon', icon: '🎲' },
    { name: '5etools', url: 'https://5e.tools/bestiary/ancient-red-dragon-xmm.html', icon: '🛠️' }
  ];

  return (
    <div className="bg-dnd-card border border-dnd rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-dnd-primary flex items-center gap-2">
            <Link className="w-5 h-5" />
            Import from URL
          </h3>
          <p className="text-xs text-dnd-muted mt-1">
            Paste a monster URL from supported D&D websites
          </p>
        </div>
        <button
          onClick={onCancel}
          className="text-dnd-muted hover:text-dnd-secondary"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Supported Sites */}
      <div className="bg-dnd-primary/5 rounded-lg p-3">
        <h4 className="text-sm font-medium text-dnd-secondary mb-2">Supported Sites:</h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {getSupportedSites().map((site) => (
            <div key={site.name} className="flex items-center gap-2 text-dnd-muted">
              <span>{site.icon}</span>
              <span>{site.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* URL Input */}
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-dnd-secondary mb-2">
            Monster URL
          </label>
          <input
            type="url"
            value={urlInput}
            onChange={(e) => {
              setUrlInput(e.target.value);
              setImportResult(null);
            }}
            placeholder="https://www.aidedd.org/dnd/monstres.php?vo=ancient-red-dragon"
            className="input-dnd w-full px-3 py-2 text-sm"
            disabled={isImporting}
          />
        </div>

        {/* URL Detection */}
        {urlInput && (
          <div className="flex items-center gap-2 text-xs">
            {detectUrlSource(urlInput) ? (
              <>
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-dnd-secondary">
                  Detected: {detectUrlSource(urlInput)}
                </span>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 text-orange-500" />
                <span className="text-dnd-muted">
                  Unsupported URL - please use a supported site
                </span>
              </>
            )}
          </div>
        )}

        {/* Import Result */}
        {importResult && (
          <div className={`p-3 rounded-lg border ${
            importResult.success
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-start gap-2">
              {importResult.success ? (
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" />
              )}
              <div className="text-xs">
                {importResult.message && (
                  <p className="font-medium">{importResult.message}</p>
                )}
                {importResult.errors?.map((error: string, index: number) => (
                  <p key={index}>{error}</p>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Import Button */}
        <div className="flex gap-2">
          <button
            onClick={handleUrlImport}
            disabled={!urlInput.trim() || !detectUrlSource(urlInput) || isImporting}
            className="btn-dnd btn-dnd-primary flex-1 px-4 py-2 flex items-center justify-center gap-2"
          >
            {isImporting ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Link className="w-4 h-4" />
                Import from URL
              </>
            )}
          </button>
          <button
            onClick={onCancel}
            className="btn-dnd btn-dnd-secondary px-4 py-2"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Note about limitations */}
      <div className="bg-dnd-primary/5 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-dnd-muted mt-0.5" />
          <div className="text-xs text-dnd-muted">
            <p className="font-medium mb-1">Note:</p>
            <p>URL parsing requires backend support and may not work in all cases.
            If URL import fails, try copying the stat block text and using the regular text import instead.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UrlMonsterImport