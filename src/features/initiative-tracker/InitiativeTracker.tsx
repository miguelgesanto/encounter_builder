// Initiative Tracker - Core component for managing combat initiative and turns
import React, { useState } from 'react';
import { Play, RotateCcw, Dice1, Heart, Shield, Trash2, Plus, AlertCircle, User } from 'lucide-react';
import { useEncounterStore } from '../../stores/encounterStore';
import { CONDITIONS } from '../../types';
import type { Encounter, Combatant } from '../../types';

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

  const [damageInput, setDamageInput] = useState<{ [key: string]: string }>({});
  const [healInput, setHealInput] = useState<{ [key: string]: string }>({});

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

  const handleDamage = (combatantId: string) => {
    const amount = parseInt(damageInput[combatantId] || '0');
    if (amount > 0) {
      damageCombatant(combatantId, amount);
      setDamageInput(prev => ({ ...prev, [combatantId]: '' }));
    }
  };

  const handleHeal = (combatantId: string) => {
    const amount = parseInt(healInput[combatantId] || '0');
    if (amount > 0) {
      healCombatant(combatantId, amount);
      setHealInput(prev => ({ ...prev, [combatantId]: '' }));
    }
  };

  const formatChallengeRating = (cr: string | undefined): string => {
    if (!cr) return '';
    if (cr === '0.125') return '1/8';
    if (cr === '0.25') return '1/4';
    if (cr === '0.5') return '1/2';
    return cr;
  };

  return (
    <div className="h-full flex flex-col bg-dnd-primary">
      {/* Header Controls */}
      <div className="bg-dnd-secondary border-b border-dnd p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold text-dnd-primary">
              {encounter.name}
            </h1>
            <span className="badge-dnd badge-pc text-sm px-2 py-1">
              Round {encounter.round}
            </span>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={rollAllInitiative}
              className="btn-dnd btn-dnd-warning flex items-center gap-1"
              title="Roll initiative for all combatants"
            >
              <Dice1 className="w-4 h-4" />
              Roll All
            </button>
            <button
              onClick={sortByInitiative}
              className="btn-dnd btn-dnd-primary"
              title="Sort by initiative order"
            >
              Sort
            </button>
            <button
              onClick={nextTurn}
              className="btn-dnd btn-dnd-danger flex items-center gap-1"
              disabled={encounter.combatants.length === 0}
            >
              <Play className="w-4 h-4" />
              Next Turn
            </button>
            <button
              onClick={resetEncounter}
              className="btn-dnd flex items-center gap-1"
              title="Reset encounter"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          </div>
        </div>

        {/* Current Turn Indicator */}
        {currentCombatant && (
          <div className="turn-banner p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-white">Current Turn:</span>
              <span className="font-semibold text-white">{currentCombatant.name}</span>
              {currentCombatant.isPC && (
                <User className="w-4 h-4 text-white" />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Initiative List */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-dnd">
        {encounter.combatants.length === 0 ? (
          <div className="text-center text-dnd-muted py-16">
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
                className={`
                  flex items-center rounded-2xl px-4 py-2 text-white font-sans gap-3 mb-2 transition-all duration-200 cursor-pointer hover:shadow-lg
                  ${index === encounter.currentTurn
                    ? 'bg-gray-900 border-2 border-red-400'
                    : 'bg-gray-900 hover:bg-gray-800 border-2 border-transparent'
                  }
                  ${selectedCombatantId === combatant.id ? 'ring-2 ring-blue-500' : ''}
                `}
              >
                {/* Initiative - Dice emoji + input without box */}
                <div className="flex items-center gap-2">
                  <span className="text-xl">🎲</span>
                  <input
                    type="number"
                    value={combatant.initiative}
                    onChange={(e) => updateCombatant(combatant.id, { initiative: parseInt(e.target.value) || 0 })}
                    className="bg-gray-800 border-none text-white font-bold text-center w-12 text-sm focus:outline-none rounded px-2 py-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>

                {/* Combatant Info - Compact name with CR chip at end */}
                <div className="flex-1 min-w-0">
                  {/* Name row with CR chip at end */}
                  <div className="flex items-center justify-between mb-1">
                    <input
                      type="text"
                      value={combatant.name}
                      onChange={(e) => updateCombatant(combatant.id, { name: e.target.value })}
                      className="bg-transparent border-none text-white font-bold text-sm focus:outline-none flex-1 min-w-0 mr-2"
                      onClick={(e) => e.stopPropagation()}
                    />
                    {combatant.isPC ? (
                      combatant.level && (
                        <span className="bg-green-900 text-green-300 px-2 py-1 rounded text-xs font-medium whitespace-nowrap">
                          Lvl {combatant.level}
                        </span>
                      )
                    ) : (
                      combatant.cr && (
                        <span className="bg-amber-900 text-amber-300 px-2 py-1 rounded text-xs font-medium whitespace-nowrap">
                          CR {combatant.cr}
                        </span>
                      )
                    )}
                  </div>

                  {/* Conditions immediately below name */}
                  <div className="flex flex-wrap gap-1">
                    {combatant.conditions.map((condition, condIndex) => (
                      <span
                        key={condIndex}
                        onClick={(e) => {
                          e.stopPropagation();
                          removeCondition(combatant.id, condition.name);
                        }}
                        className="bg-red-900 text-red-300 px-2 py-1 rounded text-xs cursor-pointer hover:bg-red-800 transition-colors flex items-center gap-1"
                        title={`${condition.name}: Click to remove`}
                      >
                        <span>⚠️</span>
                        {condition.name} ×
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
                      className="bg-amber-900 text-amber-300 px-2 py-1 rounded text-xs border-none focus:outline-none cursor-pointer hover:bg-amber-800 transition-colors appearance-none"
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

                {/* HP and AC - Compact boxes like in image */}
                <div className="flex items-center gap-3">
                  {/* HP */}
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-1 text-xs text-red-400 mb-1">
                      <span>❤️</span>
                      <span>HP</span>
                    </div>
                    <div className="bg-gray-800 rounded px-3 py-1 text-center min-w-[50px]">
                      <div className="text-white font-bold text-sm">
                        {combatant.hp}/{combatant.maxHp}
                      </div>
                      {combatant.tempHp && combatant.tempHp > 0 && (
                        <div className="text-blue-400 text-xs">
                          +{combatant.tempHp}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* AC */}
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-1 text-xs text-blue-400 mb-1">
                      <span>🛡️</span>
                      <span>AC</span>
                    </div>
                    <div className="bg-gray-800 rounded px-2 py-1 w-10">
                      <input
                        type="number"
                        value={combatant.ac}
                        onChange={(e) => updateCombatant(combatant.id, { ac: parseInt(e.target.value) || 0 })}
                        className="bg-transparent border-none text-white font-bold text-center w-full text-sm focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                </div>

                {/* Close Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeCombatant(combatant.id);
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white rounded px-2 py-1 text-sm font-bold transition-colors"
                >
                  ×
                </button>
              </div>

                {/* Notes (when selected) */}
                {selectedCombatantId === combatant.id && (
                  <div className="mt-3 pt-3 border-t border-dnd">
                    <textarea
                      placeholder="Combat notes..."
                      value={combatant.notes || ''}
                      onChange={(e) => updateCombatant(combatant.id, { notes: e.target.value })}
                      className="input-dnd w-full h-16 p-2 text-sm resize-none"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InitiativeTracker;
