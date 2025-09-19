import React, { useState, useEffect, useRef } from 'react';
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

  const damageInputRef = useRef<HTMLInputElement>(null);

  // Focus damage input when modal opens
  useEffect(() => {
    if (isOpen && damageInputRef.current) {
      setTimeout(() => {
        damageInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

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

      // Update and save immediately
      onUpdateHP(combatant.id, newCurrentHp, maxHp, newTempHp);
      onClose();
    }
  };

  const handleHeal = () => {
    const heal = parseInt(healAmount) || 0;
    if (heal > 0) {
      const newCurrentHp = Math.min(maxHp, currentHp + heal);

      // Update and save immediately
      onUpdateHP(combatant.id, newCurrentHp, maxHp, tempHp);
      onClose();
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

  const calculatePosition = () => {
    if (!position) return {};

    const modalWidth = 280;
    const modalHeight = 200; // Approximate height
    const padding = 10;

    let left = position.x;
    let top = position.y + padding;

    // Adjust if modal would go off-screen horizontally
    if (left + modalWidth > window.innerWidth) {
      left = window.innerWidth - modalWidth - padding;
    }
    if (left < padding) {
      left = padding;
    }

    // Adjust if modal would go off-screen vertically
    if (top + modalHeight > window.innerHeight) {
      top = position.y - modalHeight - padding; // Show above the button instead
    }
    if (top < padding) {
      top = padding;
    }

    return {
      position: 'fixed' as const,
      left: `${left}px`,
      top: `${top}px`,
      transform: 'none',
    };
  };

  const modalStyle = position ? calculatePosition() : {
    position: 'fixed' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-[1000]"
      onClick={handleClickOutside}
    >
      <div
        className="bg-white border border-gray-300 rounded-lg p-4 shadow-xl"
        style={{
          ...modalStyle,
          width: '320px',
          minHeight: '200px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="text-lg font-medium text-gray-900 mb-4 text-center">
          {combatant.name}
        </div>

        {/* Quick Action Buttons */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="flex items-center gap-1">
            <input
              ref={damageInputRef}
              type="text"
              placeholder="Dmg"
              value={damageAmount}
              onChange={(e) => {
                const value = e.target.value;
                // Only allow integers
                if (value === '' || /^\d+$/.test(value)) {
                  setDamageAmount(value);
                }
              }}
              className="input-dnd w-16 text-center py-2"
              onKeyPress={(e) => e.key === 'Enter' && handleDamage()}
            />
            <button
              onClick={handleDamage}
              className="btn-dnd btn-dnd-danger px-2 py-1 text-sm font-bold flex items-center justify-center flex-1"
              title="Apply damage"
            >
              −
            </button>
          </div>
          <div className="flex items-center gap-1">
            <input
              type="text"
              placeholder="Heal"
              value={healAmount}
              onChange={(e) => {
                const value = e.target.value;
                // Only allow integers
                if (value === '' || /^\d+$/.test(value)) {
                  setHealAmount(value);
                }
              }}
              className="input-dnd w-16 text-center py-2"
              onKeyPress={(e) => e.key === 'Enter' && handleHeal()}
            />
            <button
              onClick={handleHeal}
              className="btn-dnd btn-dnd-success px-2 py-1 text-sm font-bold flex items-center justify-center flex-1"
              title="Apply healing"
            >
              +
            </button>
          </div>
        </div>

        {/* HP Inputs */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1 text-center">HP</label>
            <input
              type="text"
              value={currentHp}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '' || /^\d+$/.test(value)) {
                  setCurrentHp(Math.max(0, parseInt(value) || 0));
                }
              }}
              className="input-dnd w-full text-center py-2"
              min="0"
              max={maxHp}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1 text-center">Max</label>
            <input
              type="text"
              value={maxHp}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '' || /^\d+$/.test(value)) {
                  setMaxHp(Math.max(1, parseInt(value) || 1));
                }
              }}
              className="input-dnd w-full text-center py-2"
              min="1"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1 text-center">Temp</label>
            <input
              type="text"
              value={tempHp}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '' || /^\d+$/.test(value)) {
                  setTempHp(Math.max(0, parseInt(value) || 0));
                }
              }}
              className="input-dnd w-full text-center py-2"
              min="0"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-center">
          <button
            onClick={onClose}
            className="btn-dnd btn-dnd-secondary px-6 py-2"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="btn-dnd btn-dnd-warning px-6 py-2"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};