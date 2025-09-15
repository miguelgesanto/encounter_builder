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
    <header className="header-dnd px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - App title and encounter selector */}
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-dnd-primary">
            D&D Initiative Tracker
          </h1>
          
          {/* Encounter Selector */}
          <div className="relative">
            <button
              onClick={() => setShowEncounterSelect(!showEncounterSelect)}
              className="btn-dnd flex items-center gap-2 px-3 py-2"
            >
              <FolderOpen className="w-4 h-4" />
              <span className="text-sm font-medium">
                {activeEncounter ? activeEncounter.name : 'No Encounter'}
              </span>
            </button>
            
            {showEncounterSelect && (
              <div className="dropdown-dnd absolute top-full left-0 mt-1 w-64 rounded-lg z-50">
                <div className="p-2">
                  <button
                    onClick={() => {
                      handleNewEncounter();
                      setShowEncounterSelect(false);
                    }}
                    className="dropdown-item w-full flex items-center gap-2 text-left"
                  >
                    <Plus className="w-4 h-4" />
                    Create New Encounter
                  </button>
                </div>
                
                {encounters.length > 0 && (
                  <>
                    <div className="border-t border-dnd my-1"></div>
                    <div className="p-2 max-h-48 overflow-y-auto scrollbar-dnd">
                      {encounters.map((encounter) => (
                        <button
                          key={encounter.id}
                          onClick={() => {
                            setActiveEncounter(encounter.id);
                            setShowEncounterSelect(false);
                          }}
                          className={`dropdown-item w-full text-left ${
                            encounter.id === activeEncounterId
                              ? 'bg-dnd-hover text-dnd-primary'
                              : ''
                          }`}
                        >
                          <div className="font-medium text-dnd-primary">{encounter.name}</div>
                          <div className="text-xs text-dnd-muted">
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
                className="btn-dnd btn-dnd-primary flex items-center gap-2 px-3 py-2"
                title="Export encounter"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export</span>
              </button>
              
              <button
                onClick={resetEncounter}
                className="btn-dnd btn-dnd-danger flex items-center gap-2 px-3 py-2"
                title="Reset encounter"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            </>
          )}
          
          <button
            className="btn-dnd p-2"
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