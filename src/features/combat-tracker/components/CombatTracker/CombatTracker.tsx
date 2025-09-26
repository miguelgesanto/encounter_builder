import React from 'react'
import { CombatCard } from '../CombatCard'
import { useCombat } from '../../hooks/useCombat'
import { Button } from '../../../../shared/components/ui/Button'
import { Combatant } from '../../types/combat.types'

interface CombatTrackerProps {
  onOpenHPModal?: (combatant: Combatant, event: React.MouseEvent) => void
  onSelectCombatant?: (combatant: Combatant) => void
  selectedCombatantId?: string
}

/**
 * Main combat tracker component using the new architecture
 * Much cleaner and focused on orchestration rather than implementation
 */
export const CombatTracker: React.FC<CombatTrackerProps> = ({
  onOpenHPModal,
  onSelectCombatant,
  selectedCombatantId
}) => {
  const {
    sortedCombatants,
    currentTurn,
    round,
    isActive,
    isPaused,
    canStartCombat,
    encounterDifficulty,
    startCombat,
    endCombat,
    pauseCombat,
    resumeCombat,
    nextTurn,
    previousTurn,
    rollInitiativeForAll,
    stats
  } = useCombat()

  const handleCombatantClick = (combatant: Combatant) => {
    onSelectCombatant?.(combatant)
  }

  if (sortedCombatants.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500 mb-4">
          <div className="text-6xl mb-2">⚔️</div>
          <p>No combatants added yet</p>
          <p className="text-sm">Add creatures from the browser to start combat</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Combat Controls */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Combat Tracker
              {isActive && (
                <span className="ml-2 text-sm font-normal text-gray-500">
                  Round {round} • Turn {currentTurn + 1}/{sortedCombatants.length}
                </span>
              )}
            </h2>
            {stats.totalXP > 0 && (
              <p className="text-sm text-gray-600">
                {stats.totalXP.toLocaleString()} XP • {encounterDifficulty} encounter
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!isActive && canStartCombat && (
              <>
                <Button
                  onClick={rollInitiativeForAll}
                  variant="outline"
                  size="sm"
                >
                  🎲 Roll Initiative
                </Button>
                <Button
                  onClick={startCombat}
                  variant="primary"
                  size="sm"
                >
                  Start Combat
                </Button>
              </>
            )}

            {isActive && (
              <>
                <Button
                  onClick={previousTurn}
                  variant="outline"
                  size="sm"
                  disabled={isPaused}
                >
                  ← Prev
                </Button>

                {isPaused ? (
                  <Button
                    onClick={resumeCombat}
                    variant="secondary"
                    size="sm"
                  >
                    ▶️ Resume
                  </Button>
                ) : (
                  <Button
                    onClick={pauseCombat}
                    variant="outline"
                    size="sm"
                  >
                    ⏸️ Pause
                  </Button>
                )}

                <Button
                  onClick={nextTurn}
                  variant="primary"
                  size="sm"
                  disabled={isPaused}
                >
                  Next →
                </Button>

                <Button
                  onClick={endCombat}
                  variant="destructive"
                  size="sm"
                >
                  End Combat
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Combat Stats */}
        {isActive && (
          <div className="grid grid-cols-4 gap-4 text-center text-sm">
            <div>
              <div className="font-medium text-gray-900">{Math.round(stats.averageHP)}%</div>
              <div className="text-gray-500">Avg HP</div>
            </div>
            <div>
              <div className="font-medium text-gray-900">{stats.activeConditions}</div>
              <div className="text-gray-500">Conditions</div>
            </div>
            <div>
              <div className="font-medium text-gray-900">{stats.totalTurns}</div>
              <div className="text-gray-500">Total Turns</div>
            </div>
            <div>
              <div className="font-medium text-gray-900">{round}</div>
              <div className="text-gray-500">Rounds</div>
            </div>
          </div>
        )}
      </div>

      {/* Combatant Cards */}
      <div className="space-y-2">
        {sortedCombatants.map((combatant, index) => (
          <CombatCard
            key={combatant.id}
            combatant={combatant}
            isActive={isActive && index === currentTurn}
            onClick={handleCombatantClick}
          >
            <CombatCard.Header />
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <CombatCard.Conditions />
              </div>
              <CombatCard.Stats onOpenHPModal={onOpenHPModal} />
            </div>
            <CombatCard.Actions />
          </CombatCard>
        ))}
      </div>

      {/* Current Turn Indicator */}
      {isActive && !isPaused && (
        <div className="fixed bottom-4 right-4 bg-orange-500 text-white px-4 py-2 rounded-lg shadow-lg">
          <div className="font-medium">
            {sortedCombatants[currentTurn]?.name}'s Turn
          </div>
          <div className="text-sm opacity-90">
            Round {round}
          </div>
        </div>
      )}

      {isPaused && (
        <div className="fixed bottom-4 right-4 bg-gray-500 text-white px-4 py-2 rounded-lg shadow-lg">
          <div className="font-medium">Combat Paused</div>
        </div>
      )}
    </div>
  )
}

export default CombatTracker