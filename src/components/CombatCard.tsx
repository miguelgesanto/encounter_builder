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
  selectedCombatant
}) => {
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Create validated update handlers
  const handleInitiativeUpdate = (value: string) => {
    const validation = validateInitiative(value);
    if (validation.isValid) {
      onUpdateCreature(combatant.id, 'initiative', parseInt(value));
      setValidationErrors(prev => ({ ...prev, [`${combatant.id}-initiative`]: '' }));
    } else {
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
      onClick={() => onHandleCombatantClick(combatant)}
      className={`
        flex items-center rounded-2xl px-4 py-2 text-white font-sans gap-3 mb-2
        cursor-pointer hover:shadow-lg ${ANIMATION.TRANSITION}
        bg-gray-900 hover:bg-gray-800
        ${index === currentTurn ? 'border-2 border-blue-500' : 'border-2 border-transparent'}
        ${selectedCombatant?.id === combatant.id ? 'ring-2 ring-blue-500' : ''}
      `}
    >
      {/* Initiative Section */}
      <div className="flex items-center gap-2">
        <span className="text-xl">🎲</span>
        <input
          type="number"
          value={combatant.initiative}
          onChange={(e) => handleInitiativeUpdate(e.target.value)}
          className={`bg-gray-800 border-none text-white font-bold text-center w-12 text-sm focus:outline-none rounded px-2 py-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
            validationErrors[`${combatant.id}-initiative`] ? 'text-red-400' : ''
          }`}
          onClick={(e) => e.stopPropagation()}
          title={validationErrors[`${combatant.id}-initiative`] || ''}
        />
      </div>

      {/* Combatant Info Section */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <input
            type="text"
            value={combatant.name}
            onChange={(e) => handleNameUpdate(e.target.value)}
            className={`bg-transparent border-none text-white font-bold text-sm focus:outline-none flex-1 min-w-0 mr-1 ${
              validationErrors[`${combatant.id}-name`] ? 'text-red-400' : ''
            }`}
            onClick={(e) => e.stopPropagation()}
            title={validationErrors[`${combatant.id}-name`] || ''}
          />
          {combatant.isPC ? (
            combatant.level && (
              <span className={`${COLORS.PC_CHIP} px-2 py-1 rounded text-xs font-medium whitespace-nowrap ml-1`}>
                Lvl {combatant.level}
              </span>
            )
          ) : (
            combatant.cr && (
              <span className={`${COLORS.NPC_CHIP} px-2 py-1 rounded text-xs font-medium whitespace-nowrap ml-1`}>
                CR {combatant.cr}
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
      <div className="flex items-center gap-3">
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1 text-xs text-red-400 mb-1">
            <span>❤️</span>
            <span>HP</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenHPModal(combatant, e);
            }}
            className="bg-gray-800 hover:bg-gray-700 rounded px-3 py-2 text-center min-w-[70px] min-h-[44px] transition-colors"
            title="Manage HP"
          >
            <div className="text-white font-bold text-sm whitespace-nowrap">
              {parseInt(String(combatant.hp)) || 0}/{parseInt(String(combatant.maxHp)) || 0}
              {(parseInt(String(combatant.tempHp)) || 0) > 0 && (
                <span className="text-blue-400 ml-3"> +{parseInt(String(combatant.tempHp)) || 0}</span>
              )}
            </div>
          </button>
        </div>

        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1 text-xs text-blue-400 mb-1">
            <span>🛡️</span>
            <span>AC</span>
          </div>
          <div className="bg-gray-800 rounded px-2 py-1 w-10">
            <input
              type="number"
              value={combatant.ac}
              onChange={(e) => handleACUpdate(e.target.value)}
              className={`bg-transparent border-none text-white font-bold text-center w-full text-sm focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                validationErrors[`${combatant.id}-ac`] ? 'text-red-400' : ''
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
        className={`${COLORS.DANGER} text-white rounded px-3 py-2 text-sm font-bold transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center`}
      >
        ×
      </button>
    </div>
  );
});

CombatCard.displayName = 'CombatCard';

export default CombatCard;