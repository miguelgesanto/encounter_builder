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
                className={`initiative-card p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                  index === encounter.currentTurn
                    ? 'bg-current-turn border-2'
                    : combatant.isPC
                    ? 'bg-player-character'
                    : 'bg-monster'
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
                      className="input-dnd w-full text-center px-2 py-1"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        rollInitiative(combatant.id);
                      }}
                      className="btn-dnd w-full mt-1 p-1"
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
                        className="font-medium text-lg border-none bg-transparent focus:outline-none text-dnd-primary"
                        onClick={(e) => e.stopPropagation()}
                      />
                      {combatant.isPC && (
                        <span className="badge-dnd badge-pc text-xs px-2 py-1 rounded flex items-center gap-1">
                          <User className="w-3 h-3" />
                          PC {combatant.level && `(Lvl ${combatant.level})`}
                        </span>
                      )}
                      {!combatant.isPC && combatant.cr && (
                        <span className="badge-dnd badge-cr text-xs px-2 py-1 rounded">
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
                          className="badge-dnd badge-condition text-xs px-2 py-1 rounded cursor-pointer flex items-center gap-1 transition-colors"
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
                        className="select-dnd text-xs px-2 py-1"
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
                      <div className="text-xs text-dnd-muted flex items-center justify-center gap-1 mb-1">
                        <Heart className="w-3 h-3 text-red-500" />
                        HP
                      </div>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={combatant.hp}
                          onChange={(e) => updateHitPoints(combatant.id, parseInt(e.target.value) || 0)}
                          className="input-dnd w-12 text-center px-1 py-1"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <span className="text-dnd-muted">/ {combatant.maxHp}</span>
                      </div>
                      
                      {/* Damage/Heal inputs */}
                      <div className="flex gap-1 mt-1">
                        <input
                          type="number"
                          placeholder="Dmg"
                          value={damageInput[combatant.id] || ''}
                          onChange={(e) => setDamageInput(prev => ({ ...prev, [combatant.id]: e.target.value }))}
                          className="input-dnd w-8 text-xs text-center px-1"
                          onClick={(e) => e.stopPropagation()}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleDamage(combatant.id);
                            }
                          }}
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDamage(combatant.id);
                          }}
                          className="btn-dnd btn-dnd-danger text-xs px-1"
                          title="Apply damage"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          placeholder="Heal"
                          value={healInput[combatant.id] || ''}
                          onChange={(e) => setHealInput(prev => ({ ...prev, [combatant.id]: e.target.value }))}
                          className="input-dnd w-8 text-xs text-center px-1"
                          onClick={(e) => e.stopPropagation()}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleHeal(combatant.id);
                            }
                          }}
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleHeal(combatant.id);
                          }}
                          className="btn-dnd btn-dnd-success text-xs px-1"
                          title="Apply healing"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="text-xs text-dnd-muted flex items-center justify-center gap-1 mb-1">
                        <Shield className="w-3 h-3 text-blue-500" />
                        AC
                      </div>
                      <input
                        type="number"
                        value={combatant.ac}
                        onChange={(e) => updateCombatant(combatant.id, { ac: parseInt(e.target.value) || 0 })}
                        className="input-dnd w-12 text-center px-1 py-1"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeCombatant(combatant.id);
                      }}
                      className="btn-dnd btn-dnd-danger p-2"
                      title="Remove combatant"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
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
