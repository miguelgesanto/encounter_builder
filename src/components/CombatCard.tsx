import React, { useState } from 'react';
import { ConditionsTracker } from './ConditionsTracker';
import { Combatant } from '../types/combatant';
import { COLORS, ANIMATION } from '../constants/ui';
import { validateHP, validateAC, validateInitiative, validateName } from '../utils/validation';

interface CombatCardProps {
  combatant: Combatant;
  index: number;
  currentTurn: number;
  onUpdateCreature: (id: string, field: keyof Combatant, value: any) => void;
  onRemoveCreature: (id: string) => void;
  onAddCondition: (combatantId: string, condition: string) => void;
  onRemoveCondition: (combatantId: string, conditionIndex: number) => void;
  onOpenHPModal: (combatant: Combatant, event: React.MouseEvent) => void;
  onHandleCombatantClick: (combatant: Combatant) => void;
  onRollInitiative?: (combatant: Combatant) => number;
  selectedCombatant?: Combatant;
}

const CombatCard: React.FC<CombatCardProps> = React.memo(({
  combatant,
  index,
  currentTurn,
  onUpdateCreature,
  onRemoveCreature,
  onAddCondition,
  onRemoveCondition,
  onOpenHPModal,
  onHandleCombatantClick,
  onRollInitiative,
  selectedCombatant
}) => {
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Helper function to determine HP status color
  const getHPStatusColor = (hp: number, maxHp: number) => {
    const percentage = (hp / maxHp) * 100;
    if (percentage >= 75) return 'text-green-600'; // Healthy
    if (percentage >= 25) return 'text-yellow-600'; // Wounded
    return 'text-red-600'; // Critical
  };

  const getHPStatusClass = (hp: number, maxHp: number) => {
    const percentage = (hp / maxHp) * 100;
    if (percentage < 25) return 'animate-pulse'; // Pulse for critical
    return '';
  };

  // Create validated update handlers
  const handleInitiativeUpdate = (value: string) => {
    // Allow empty string during editing
    if (value === '') {
      onUpdateCreature(combatant.id, 'initiative', '');
      setValidationErrors(prev => ({ ...prev, [`${combatant.id}-initiative`]: '' }));
      return;
    }

    const validation = validateInitiative(value);
    if (validation.isValid) {
      onUpdateCreature(combatant.id, 'initiative', parseInt(value));
      setValidationErrors(prev => ({ ...prev, [`${combatant.id}-initiative`]: '' }));
    } else {
      // Still update the display value even if invalid, for better UX
      onUpdateCreature(combatant.id, 'initiative', value);
      setValidationErrors(prev => ({ ...prev, [`${combatant.id}-initiative`]: validation.error || '' }));
    }
  };

  const handleNameUpdate = (value: string) => {
    const validation = validateName(value);
    if (validation.isValid) {
      onUpdateCreature(combatant.id, 'name', value);
      setValidationErrors(prev => ({ ...prev, [`${combatant.id}-name`]: '' }));
    } else {
      setValidationErrors(prev => ({ ...prev, [`${combatant.id}-name`]: validation.error || '' }));
    }
  };

  const handleACUpdate = (value: string) => {
    const validation = validateAC(value);
    if (validation.isValid) {
      onUpdateCreature(combatant.id, 'ac', parseInt(value));
      setValidationErrors(prev => ({ ...prev, [`${combatant.id}-ac`]: '' }));
    } else {
      setValidationErrors(prev => ({ ...prev, [`${combatant.id}-ac`]: validation.error || '' }));
    }
  };
  return (
    <div
      key={combatant.id}
      className={`
        relative rounded-2xl px-4 py-1 font-sans gap-3 mb-2 border
        ${combatant.isPC ? 'bg-player-character text-gray-900 border-blue-200' : 'bg-monster text-gray-900 border-red-200'}
        ${index === currentTurn ? 'bg-current-turn' : ''}
        ${selectedCombatant?.id === combatant.id ? 'ring-2 ring-blue-500' : ''}
      `}
    >
      {/* Invisible clickable overlay */}
      <div
        onClick={() => onHandleCombatantClick(combatant)}
        className="absolute inset-0 cursor-pointer hover:shadow-lg transition-shadow rounded-2xl z-0"
      />

      {/* Content */}
      <div className="relative z-10 flex items-center gap-3">
      {/* Initiative Section */}
      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => {
            if (onRollInitiative) {
              const newInitiative = onRollInitiative(combatant);
              onUpdateCreature(combatant.id, 'initiative', newInitiative);
            }
          }}
          className="text-base hover:text-xl transition-all duration-200 cursor-pointer"
          title="Roll initiative"
        >
          🎲
        </button>
        <input
          type="text"
          value={combatant.initiative}
          onChange={(e) => handleInitiativeUpdate(e.target.value)}
          className={`bg-white border border-gray-300 text-gray-900 font-bold text-center w-10 text-xs focus:outline-none rounded px-1 py-1 ${
            validationErrors[`${combatant.id}-initiative`] ? 'text-red-600' : ''
          }`}
          onClick={(e) => e.stopPropagation()}
          title={validationErrors[`${combatant.id}-initiative`] || ''}
          pattern="[0-9]*"
          inputMode="numeric"
        />
      </div>

      {/* Combatant Info Section */}
      <div className="flex-1 min-w-0 py-1">
        <div className="flex items-center justify-between mb-1">
          <input
            type="text"
            value={combatant.name}
            onChange={(e) => handleNameUpdate(e.target.value)}
            className={`bg-transparent border-none text-gray-900 font-bold text-xs focus:outline-none flex-1 min-w-0 mr-1 ${
              validationErrors[`${combatant.id}-name`] ? 'text-red-600' : ''
            }`}
            onClick={(e) => e.stopPropagation()}
            title={validationErrors[`${combatant.id}-name`] || ''}
          />
          {combatant.isPC ? (
            combatant.level && (
              <span className="text-white px-1 py-0.5 rounded text-xs font-medium whitespace-nowrap ml-1" style={{background: 'var(--color-pc-badge)'}}>
                ⭐ Lvl {combatant.level}
              </span>
            )
          ) : (
            combatant.cr && (
              <span className="text-white px-1 py-0.5 rounded text-xs font-medium whitespace-nowrap ml-1" style={{background: 'var(--color-monster-badge)'}}>
                💀 CR {combatant.cr}
              </span>
            )
          )}
        </div>

        <div className="flex flex-wrap gap-1" onClick={(e) => e.stopPropagation()}>
          <ConditionsTracker
            conditions={combatant.conditions}
            onAddCondition={(condition) => onAddCondition(combatant.id, condition)}
            onRemoveCondition={(index) => onRemoveCondition(combatant.id, index)}
          />
        </div>
      </div>

      {/* Stats Section */}
      <div className="flex items-center gap-2">
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-0.5 text-xs text-red-600 mb-0.5">
            <span>❤️</span>
            <span>HP</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenHPModal(combatant, e);
            }}
            className="bg-white hover:bg-gray-50 border border-gray-300 rounded px-1.5 py-0.5 text-center min-w-[50px] min-h-[24px] transition-colors"
            title="Manage HP"
          >
            <div className={`font-bold text-xs whitespace-nowrap ${getHPStatusColor(combatant.hp, combatant.maxHp)} ${getHPStatusClass(combatant.hp, combatant.maxHp)}`}>
              {parseInt(String(combatant.hp)) || 0}/{parseInt(String(combatant.maxHp)) || 0}
              {(parseInt(String(combatant.tempHp)) || 0) > 0 && (
                <span className="text-cyan-600 ml-1"> +{parseInt(String(combatant.tempHp)) || 0}</span>
              )}
            </div>
          </button>
        </div>

        <div className="flex flex-col items-center">
          <div className="flex items-center gap-0.5 text-xs text-blue-600 mb-0.5">
            <span>🛡️</span>
            <span>AC</span>
          </div>
          <div className="bg-white border border-gray-300 rounded px-0.5 py-0.5 w-7">
            <input
              type="number"
              value={combatant.ac}
              onChange={(e) => handleACUpdate(e.target.value)}
              className={`bg-transparent border-none text-gray-900 font-bold text-center w-full text-xs focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                validationErrors[`${combatant.id}-ac`] ? 'text-red-600' : ''
              }`}
              onClick={(e) => e.stopPropagation()}
              title={validationErrors[`${combatant.id}-ac`] || ''}
            />
          </div>
        </div>
      </div>

      {/* Close Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemoveCreature(combatant.id);
        }}
        className="btn-dnd-danger rounded px-1.5 py-0.5 text-xs font-bold transition-colors min-w-[24px] min-h-[24px] flex items-center justify-center"
      >
        ×
      </button>
      </div>
    </div>
  );
});

CombatCard.displayName = 'CombatCard';

export default CombatCard;