import React, { useState } from 'react';
import { ConditionsTracker } from './ConditionsTracker';
import { Combatant } from '../types/combatant';
// Removed unused imports
// Simple inline validation functions
const validateName = (name: string) => name.trim().length > 0;
const validateAC = (ac: number) => ac >= 0 && ac <= 30;
const validateInitiative = (init: number) => init >= -10 && init <= 50;
const validateHP = (hp: number) => hp >= 0;

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
        relative flex flex-col rounded-lg px-3 py-2 font-sans gap-1 mb-2 border transition-all duration-200
        ${combatant.isPC ? 'bg-blue-50 text-gray-900 border-blue-200' : 'bg-gray-50 text-gray-900 border-gray-200'}
        ${index === currentTurn ? 'ring-2 ring-orange-400 bg-orange-50' : ''}
        ${selectedCombatant?.id === combatant.id ? 'ring-2 ring-blue-500' : ''}
        hover:shadow-sm cursor-pointer
      `}
      onClick={() => onHandleCombatantClick(combatant)}
    >
      {/* First Row: Initiative, Name on left, HP/AC/Remove on right */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Initiative */}
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => {
                if (onRollInitiative) {
                  const newInitiative = onRollInitiative(combatant);
                  onUpdateCreature(combatant.id, 'initiative', newInitiative);
                }
              }}
              className="text-sm hover:text-base transition-all duration-200 cursor-pointer"
              title="Roll initiative"
            >
              🎲
            </button>
            <input
              type="text"
              value={combatant.initiative}
              onChange={(e) => handleInitiativeUpdate(e.target.value)}
              className={`bg-white border border-gray-300 text-gray-900 font-bold text-center w-8 text-xs focus:outline-none rounded px-1 py-0.5 ${
                validationErrors[`${combatant.id}-initiative`] ? 'text-red-600' : ''
              }`}
              onClick={(e) => e.stopPropagation()}
              title={validationErrors[`${combatant.id}-initiative`] || ''}
            />
          </div>

          {/* Name */}
          <div className="flex-1 min-w-0">
            <input
              type="text"
              value={combatant.name}
              onChange={(e) => handleNameUpdate(e.target.value)}
              className={`bg-transparent border-none text-gray-900 font-semibold text-sm focus:outline-none w-full ${
                validationErrors[`${combatant.id}-name`] ? 'text-red-600' : ''
              }`}
              onClick={(e) => e.stopPropagation()}
              title={validationErrors[`${combatant.id}-name`] || ''}
            />
          </div>
        </div>

        {/* Right side: Conditions Dropdown, HP, AC, Remove */}
        <div className="flex items-center gap-2">
          {/* Conditions Dropdown */}
          <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
            <ConditionsTracker
              conditions={[]} // Only show the dropdown, not the chips
              onAddCondition={(condition) => onAddCondition(combatant.id, condition)}
              onRemoveCondition={() => {}} // Not used for dropdown only
            />
          </div>

          {/* HP */}
          <div className="flex items-center gap-1 bg-white border border-gray-300 rounded px-2 py-1 min-w-[70px]" onClick={(e) => e.stopPropagation()}>
            <span className="text-red-500">❤️</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenHPModal(combatant, e);
              }}
              className={`font-semibold text-xs whitespace-nowrap ${getHPStatusColor(combatant.hp, combatant.maxHp)} ${getHPStatusClass(combatant.hp, combatant.maxHp)} hover:bg-gray-50 transition-colors bg-transparent border-none focus:outline-none`}
              title="Manage HP"
            >
              HP {parseInt(String(combatant.hp)) || 0}/{parseInt(String(combatant.maxHp)) || 0}
              {(parseInt(String(combatant.tempHp)) || 0) > 0 && (
                <span className="text-cyan-600"> +{parseInt(String(combatant.tempHp)) || 0}</span>
              )}
            </button>
          </div>

          {/* AC */}
          <div className="flex items-center gap-1 bg-white border border-gray-300 rounded px-2 py-1 min-w-[50px]" onClick={(e) => e.stopPropagation()}>
            <span className="text-blue-500">🛡️</span>
            <span className="font-semibold text-xs">AC</span>
            <input
              type="text"
              value={combatant.ac}
              onChange={(e) => handleACUpdate(e.target.value)}
              className={`bg-transparent border-none text-gray-900 font-bold text-center w-5 text-xs focus:outline-none ${
                validationErrors[`${combatant.id}-ac`] ? 'text-red-600' : ''
              }`}
              onClick={(e) => e.stopPropagation()}
              title={validationErrors[`${combatant.id}-ac`] || ''}
            />
          </div>

          {/* Remove Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemoveCreature(combatant.id);
            }}
            className="bg-red-500 hover:bg-red-600 text-white rounded px-1.5 py-1 text-xs font-bold transition-colors"
            title="Remove combatant"
          >
            ×
          </button>
        </div>
      </div>

      {/* Second Row: Condition chips below name */}
      {combatant.conditions && combatant.conditions.length > 0 && (
        <div className="flex flex-wrap gap-1 ml-10" onClick={(e) => e.stopPropagation()}>
          {combatant.conditions.map((condition, index) => (
            <span
              key={index}
              className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium flex items-center gap-1 cursor-pointer hover:bg-red-200 transition-colors"
              onClick={() => onRemoveCondition(combatant.id, index)}
              title={`Remove ${typeof condition === 'object' ? condition.name : condition}`}
            >
              ⚠️ {typeof condition === 'object' ? condition.name : condition}
              <span className="text-red-600 hover:text-red-800 font-bold">×</span>
            </span>
          ))}
        </div>
      )}

    </div>
  );
});

CombatCard.displayName = 'CombatCard';

export default CombatCard;