import React, { useState } from 'react'
import { CombatTracker } from './features/combat-tracker'
import { ErrorBoundary, CombatErrorBoundary } from './shared/components/layout/ErrorBoundary'
import { Combatant } from './features/combat-tracker/types/combat.types'

// Simplified App component - much cleaner than the original 660+ lines
const App: React.FC = () => {
  const [selectedCombatant, setSelectedCombatant] = useState<Combatant | null>(null)
  const [showHPModal, setShowHPModal] = useState(false)
  const [hpModalData, setHPModalData] = useState<{ combatant: Combatant; event: React.MouseEvent } | null>(null)

  const handleOpenHPModal = (combatant: Combatant, event: React.MouseEvent) => {
    setHPModalData({ combatant, event })
    setShowHPModal(true)
  }

  const handleSelectCombatant = (combatant: Combatant) => {
    setSelectedCombatant(combatant)
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              D&D Encounter Builder
            </h1>
            <p className="text-gray-600">
              Build and manage your D&D 5e encounters with ease
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Sidebar - Creature Browser would go here */}
            <aside className="lg:col-span-3">
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h2 className="font-semibold mb-4">Creature Browser</h2>
                <p className="text-gray-500 text-sm">
                  Creature browser component would be integrated here using the same
                  feature-based architecture pattern.
                </p>
              </div>
            </aside>

            {/* Main Combat Tracker */}
            <main className="lg:col-span-6">
              <CombatErrorBoundary>
                <CombatTracker
                  onOpenHPModal={handleOpenHPModal}
                  onSelectCombatant={handleSelectCombatant}
                  selectedCombatantId={selectedCombatant?.id}
                />
              </CombatErrorBoundary>
            </main>

            {/* Right Panel - Stat Block */}
            <aside className="lg:col-span-3">
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h2 className="font-semibold mb-4">Stat Block</h2>
                {selectedCombatant ? (
                  <div className="text-sm">
                    <p className="font-medium">{selectedCombatant.name}</p>
                    <p className="text-gray-600">
                      HP: {selectedCombatant.hp}/{selectedCombatant.maxHp}
                    </p>
                    <p className="text-gray-600">AC: {selectedCombatant.ac}</p>
                    <p className="text-gray-600">Initiative: {selectedCombatant.initiative}</p>
                    {selectedCombatant.cr && (
                      <p className="text-gray-600">CR: {selectedCombatant.cr}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">
                    Select a combatant to view their stat block
                  </p>
                )}
              </div>
            </aside>
          </div>
        </div>

        {/* HP Modal - simplified example */}
        {showHPModal && hpModalData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="font-semibold mb-4">
                Manage HP - {hpModalData.combatant.name}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current HP
                  </label>
                  <input
                    type="number"
                    value={hpModalData.combatant.hp}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    max={hpModalData.combatant.maxHp}
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Temporary HP
                  </label>
                  <input
                    type="number"
                    value={hpModalData.combatant.tempHp || 0}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    min="0"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setShowHPModal(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      // Apply changes using store actions
                      setShowHPModal(false)
                    }}
                    className="px-4 py-2 bg-dnd-primary text-white rounded hover:bg-dnd-primary/90"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  )
}

export default App