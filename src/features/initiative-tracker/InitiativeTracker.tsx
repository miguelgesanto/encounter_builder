// Initiative Tracker - Core component for managing combat initiative and turns
import React, { useState } from 'react';
import { Play, RotateCcw, Dice1, Heart, Shield, Trash2, Plus, AlertCircle, User } from 'lucide-react';
import { useEncounterStore } from '../../stores/encounterStore';
import { CONDITIONS } from '../../types';
import type { Encounter, Combatant } from '../../types';
import { HPModal } from '../../components/HPModal';

interface InitiativeTrackerProps {
  encounter?: Encounter;
}

export const InitiativeTracker: React.FC<InitiativeTrackerProps> = ({ encounter }) => {
  const {
    rollInitiative,
    rollAllInitiative,
    sortByInitiative,
    nextTurn,
    previousTurn,
    nextRound,
    resetEncounter,
    updateCombatant,
    removeCombatant,
    addCondition,
    removeCondition,
    updateHitPoints,
    healCombatant,
    damageCombatant,
    setSelectedCombatant,
    initiative: { selectedCombatantId }
  } = useEncounterStore();

  const [hpModalOpen, setHpModalOpen] = useState(false);
  const [hpModalCombatant, setHpModalCombatant] = useState<Combatant | null>(null);

  if (!encounter) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center">
          <div className="text-4xl mb-4">⚔️</div>
          <p className="text-xl mb-2">No Active Encounter</p>
          <p>Create a new encounter to start tracking initiative</p>
        </div>
      </div>
    );
  }

  const currentCombatant = encounter.combatants[encounter.currentTurn];

  const openHPModal = (combatant: Combatant) => {
    setHpModalCombatant(combatant);
    setHpModalOpen(true);
  };

  const updateCombatantHP = (id: string, newHP: number, newMaxHP?: number, newTempHP?: number) => {
    const updates: any = { hp: newHP };
    if (newMaxHP !== undefined) updates.maxHp = newMaxHP;
    if (newTempHP !== undefined) updates.tempHp = newTempHP;
    updateCombatant(id, updates);
  };

  const formatChallengeRating = (cr: string | undefined): string => {
    if (!cr) return '';
    if (cr === '0.125') return '1/8';
    if (cr === '0.25') return '1/4';
    if (cr === '0.5') return '1/2';
    return cr;
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800">
      {/* Header Controls */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              {encounter.name}
            </h1>
            <span className="text-sm px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
              Round {encounter.round}
            </span>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={rollAllInitiative}
              className="px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg flex items-center gap-1 transition-colors"
              title="Roll initiative for all combatants"
            >
              <Dice1 className="w-4 h-4" />
              Roll All
            </button>
            <button
              onClick={sortByInitiative}
              className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              title="Sort by initiative order"
            >
              Sort
            </button>
            <button
              onClick={nextTurn}
              className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-1 transition-colors"
              disabled={encounter.combatants.length === 0}
            >
              <Play className="w-4 h-4" />
              Next Turn
            </button>
            <button
              onClick={resetEncounter}
              className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg flex items-center gap-1 transition-colors"
              title="Reset encounter"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          </div>
        </div>

      </div>

      {/* Initiative List */}
      <div className="flex-1 overflow-y-auto p-4">
        {encounter.combatants.length === 0 ? (
          <div className="text-center text-gray-500 py-16">
            <div className="text-4xl mb-4">🗡️</div>
            <p className="text-lg mb-2">No combatants in encounter</p>
            <p>Add creatures from the encounter builder to start combat</p>
          </div>
        ) : (
          <div className="space-y-2">
            {encounter.combatants.map((combatant, index) => (
              <div
                key={combatant.id}
                onClick={() => setSelectedCombatant(
                  selectedCombatantId === combatant.id ? null : combatant.id
                )}
                className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                  combatant.isPC
                    ? 'border-green-300 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
                } ${
                  selectedCombatantId === combatant.id ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Initiative */}
                  <div className="w-16 text-center">
                    <input
                      type="number"
                      value={combatant.initiative}
                      onChange={(e) => updateCombatant(combatant.id, { initiative: parseInt(e.target.value) || 0 })}
                      className="w-full text-center border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        rollInitiative(combatant.id);
                      }}
                      className="w-full mt-1 p-1 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 rounded transition-colors"
                      title="Roll initiative"
                    >
                      <Dice1 className="w-4 h-4 mx-auto" />
                    </button>
                  </div>

                  {/* Name and Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <input
                        type="text"
                        value={combatant.name}
                        onChange={(e) => updateCombatant(combatant.id, { name: e.target.value })}
                        className="font-medium text-lg border-none bg-transparent focus:outline-none text-gray-900 dark:text-white"
                        onClick={(e) => e.stopPropagation()}
                      />
                      {combatant.isPC && (
                        <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded flex items-center gap-1">
                          <User className="w-3 h-3" />
                          PC {combatant.level && `(Lvl ${combatant.level})`}
                        </span>
                      )}
                      {!combatant.isPC && combatant.cr && (
                        <span className="text-xs px-2 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded">
                          CR {formatChallengeRating(combatant.cr)}
                        </span>
                      )}
                    </div>

                    {/* Conditions */}
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {combatant.conditions.map((condition, condIndex) => (
                        <span
                          key={condIndex}
                          onClick={(e) => {
                            e.stopPropagation();
                            removeCondition(combatant.id, condition.name);
                          }}
                          className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded cursor-pointer hover:bg-red-200 dark:hover:bg-red-800 flex items-center gap-1 transition-colors"
                          title={`${condition.name}: ${condition.description}. Click to remove.`}
                        >
                          <AlertCircle className="w-3 h-3" />
                          {condition.name}
                          {condition.duration && ` (${condition.duration})`}
                        </span>
                      ))}
                      
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            const conditionName = e.target.value;
                            const condition = CONDITIONS[conditionName];
                            if (condition) {
                              addCondition(combatant.id, condition);
                            }
                            e.target.value = '';
                          }
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs px-2 py-1 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded text-yellow-800 dark:text-yellow-200"
                        defaultValue=""
                      >
                        <option value="">+ Condition</option>
                        {Object.keys(CONDITIONS).map(conditionName => (
                          <option key={conditionName} value={conditionName}>
                            {conditionName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Health and AC */}
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1 mb-1">
                        <Heart className="w-3 h-3 text-red-500" />
                        HP
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openHPModal(combatant);
                        }}
                        className="flex items-center gap-1 px-2 py-1 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                        title="Click to manage HP"
                      >
                        <span className="font-medium text-red-800 dark:text-red-200">
                          {combatant.hp + (combatant.tempHp || 0)} / {combatant.maxHp}
                        </span>
                        {combatant.tempHp && combatant.tempHp > 0 && (
                          <span className="text-xs text-blue-600 dark:text-blue-400">
                            (+{combatant.tempHp})
                          </span>
                        )}
                      </button>
                    </div>

                    <div className="text-center">
                      <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1 mb-1">
                        <Shield className="w-3 h-3 text-blue-500" />
                        AC
                      </div>
                      <div className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
                        <span className="font-medium text-blue-800 dark:text-blue-200">
                          {combatant.ac}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeCombatant(combatant.id);
                      }}
                      className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors"
                      title="Remove combatant"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Notes (when selected) */}
                {selectedCombatantId === combatant.id && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                    <textarea
                      placeholder="Combat notes..."
                      value={combatant.notes || ''}
                      onChange={(e) => updateCombatant(combatant.id, { notes: e.target.value })}
                      className="w-full h-16 p-2 text-sm border border-gray-300 dark:border-gray-600 rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* HP Modal */}
      {hpModalCombatant && (
        <HPModal
          isOpen={hpModalOpen}
          onClose={() => {
            setHpModalOpen(false);
            setHpModalCombatant(null);
          }}
          combatant={hpModalCombatant}
          onUpdateHP={updateCombatantHP}
        />
      )}
    </div>
  );
};

export default InitiativeTracker;
