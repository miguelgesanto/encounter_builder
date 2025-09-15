// Header Component - Top navigation and encounter controls
import React, { useState } from 'react';
import { Save, FolderOpen, Plus, Settings, RotateCcw, Download } from 'lucide-react';
import { useEncounterStore } from '../stores/encounterStore';

export const Header: React.FC = () => {
  const {
    initiative: { activeEncounterId, encounters },
    setActiveEncounter,
    createEncounter,
    resetEncounter
  } = useEncounterStore();

  const [showEncounterSelect, setShowEncounterSelect] = useState(false);

  const activeEncounter = encounters.find(e => e.id === activeEncounterId);

  const handleNewEncounter = () => {
    createEncounter('New Encounter', 4, 3, 'medium');
  };

  const handleSaveEncounter = () => {
    if (activeEncounter) {
      // This would implement actual save functionality
      const dataStr = JSON.stringify(activeEncounter, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${activeEncounter.name}.json`;
      link.click();
      
      URL.revokeObjectURL(url);
    }
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - App title and encounter selector */}
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            D&D Initiative Tracker
          </h1>
          
          {/* Encounter Selector */}
          <div className="relative">
            <button
              onClick={() => setShowEncounterSelect(!showEncounterSelect)}
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              <FolderOpen className="w-4 h-4" />
              <span className="text-sm font-medium">
                {activeEncounter ? activeEncounter.name : 'No Encounter'}
              </span>
            </button>
            
            {showEncounterSelect && (
              <div className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                <div className="p-2">
                  <button
                    onClick={() => {
                      handleNewEncounter();
                      setShowEncounterSelect(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Create New Encounter
                  </button>
                </div>
                
                {encounters.length > 0 && (
                  <>
                    <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                    <div className="p-2 max-h-48 overflow-y-auto">
                      {encounters.map((encounter) => (
                        <button
                          key={encounter.id}
                          onClick={() => {
                            setActiveEncounter(encounter.id);
                            setShowEncounterSelect(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded transition-colors ${
                            encounter.id === activeEncounterId
                              ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
                              : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                        >
                          <div className="font-medium">{encounter.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {encounter.combatants.length} combatants • Round {encounter.round}
                          </div>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right side - Action buttons */}
        <div className="flex items-center gap-2">
          {activeEncounter && (
            <>
              <button
                onClick={handleSaveEncounter}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                title="Export encounter"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export</span>
              </button>
              
              <button
                onClick={resetEncounter}
                className="flex items-center gap-2 px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                title="Reset encounter"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            </>
          )}
          
          <button
            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Close dropdown when clicking outside */}
      {showEncounterSelect && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowEncounterSelect(false)}
        />
      )}
    </header>
  );
};

export default Header;