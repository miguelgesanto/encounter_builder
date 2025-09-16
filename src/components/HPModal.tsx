import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

interface HPModalProps {
  isOpen: boolean;
  onClose: () => void;
  combatant: {
    id: string;
    name: string;
    hp: number;
    maxHp: number;
    tempHp?: number;
  };
  onUpdateHP: (id: string, newHp: number, newMaxHp: number, newTempHp?: number) => void;
  position?: { x: number; y: number };
}

export const HPModal: React.FC<HPModalProps> = ({
  isOpen,
  onClose,
  combatant,
  onUpdateHP,
  position
}) => {
  const [currentHp, setCurrentHp] = useState(combatant.hp);
  const [maxHp, setMaxHp] = useState(combatant.maxHp);
  const [tempHp, setTempHp] = useState(combatant.tempHp || 0);
  const [damageAmount, setDamageAmount] = useState('');
  const [healAmount, setHealAmount] = useState('');

  if (!isOpen) return null;

  const handleDamage = () => {
    const damage = parseInt(damageAmount) || 0;
    if (damage > 0) {
      let newTempHp = tempHp;
      let newCurrentHp = currentHp;

      // Apply damage to temp HP first
      if (newTempHp > 0) {
        if (damage >= newTempHp) {
          const remainingDamage = damage - newTempHp;
          newTempHp = 0;
          newCurrentHp = Math.max(0, newCurrentHp - remainingDamage);
        } else {
          newTempHp -= damage;
        }
      } else {
        newCurrentHp = Math.max(0, newCurrentHp - damage);
      }

      setCurrentHp(newCurrentHp);
      setTempHp(newTempHp);
      setDamageAmount('');
    }
  };

  const handleHeal = () => {
    const heal = parseInt(healAmount) || 0;
    if (heal > 0) {
      setCurrentHp(Math.min(maxHp, currentHp + heal));
      setHealAmount('');
    }
  };

  const handleSave = () => {
    onUpdateHP(combatant.id, currentHp, maxHp, tempHp);
    onClose();
  };

  const handleClickOutside = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const modalStyle = position ? {
    position: 'absolute' as const,
    left: position.x,
    top: position.y + 10, // 10px below the button
    transform: 'none',
  } : {
    position: 'fixed' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-[1000] flex items-center justify-center"
      onClick={handleClickOutside}
    >
      <div
        className="bg-dnd-elevated border border-dnd rounded-lg p-3 shadow-xl"
        style={{
          ...modalStyle,
          width: '280px',
          minHeight: '180px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="text-sm font-medium text-dnd-primary mb-2 text-center">
          {combatant.name}
        </div>

        {/* Current Stats */}
        <div className="text-center mb-3">
          <div className="text-lg font-bold text-dnd-primary">
            {currentHp + tempHp} / {maxHp}
          </div>
          {tempHp > 0 && (
            <div className="text-xs text-blue-400">+{tempHp} temp</div>
          )}
        </div>

        {/* HP Inputs - Compact Row */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div>
            <label className="block text-xs text-dnd-muted mb-1">HP</label>
            <input
              type="number"
              value={currentHp}
              onChange={(e) => setCurrentHp(Math.max(0, parseInt(e.target.value) || 0))}
              className="input-dnd w-full text-xs p-1 text-center"
              min="0"
              max={maxHp}
            />
          </div>
          <div>
            <label className="block text-xs text-dnd-muted mb-1">Max</label>
            <input
              type="number"
              value={maxHp}
              onChange={(e) => setMaxHp(Math.max(1, parseInt(e.target.value) || 1))}
              className="input-dnd w-full text-xs p-1 text-center"
              min="1"
            />
          </div>
          <div>
            <label className="block text-xs text-dnd-muted mb-1">Temp</label>
            <input
              type="number"
              value={tempHp}
              onChange={(e) => setTempHp(Math.max(0, parseInt(e.target.value) || 0))}
              className="input-dnd w-full text-xs p-1 text-center"
              min="0"
            />
          </div>
        </div>

        {/* Quick Actions - Compact */}
        <div className="grid grid-cols-2 gap-1 mb-3">
          <div className="flex gap-1">
            <input
              type="number"
              placeholder="Dmg"
              value={damageAmount}
              onChange={(e) => setDamageAmount(e.target.value)}
              className="input-dnd text-xs p-1 w-16"
              min="0"
              onKeyPress={(e) => e.key === 'Enter' && handleDamage()}
            />
            <button
              onClick={handleDamage}
              className="btn-dnd btn-dnd-danger px-1 py-1 text-xs"
              title="Apply damage"
            >
              <Minus className="w-3 h-3" />
            </button>
          </div>
          <div className="flex gap-1">
            <input
              type="number"
              placeholder="Heal"
              value={healAmount}
              onChange={(e) => setHealAmount(e.target.value)}
              className="input-dnd text-xs p-1 w-16"
              min="0"
              onKeyPress={(e) => e.key === 'Enter' && handleHeal()}
            />
            <button
              onClick={handleHeal}
              className="btn-dnd btn-dnd-success px-1 py-1 text-xs"
              title="Apply healing"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Action Buttons - Compact */}
        <div className="flex gap-2 justify-center">
          <button
            onClick={onClose}
            className="btn-dnd px-3 py-1 text-xs"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="btn-dnd btn-dnd-primary px-3 py-1 text-xs"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};