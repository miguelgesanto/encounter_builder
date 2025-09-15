import React, { useState, useEffect } from 'react';
import { X, Heart, Plus, Minus } from 'lucide-react';

interface HPModalProps {
  isOpen: boolean;
  onClose: () => void;
  combatantName: string;
  currentHp: number;
  maxHp: number;
  tempHp?: number;
  onUpdateHp: (newHp: number, newMaxHp: number, newTempHp: number) => void;
}

export const HPModal: React.FC<HPModalProps> = ({
  isOpen,
  onClose,
  combatantName,
  currentHp,
  maxHp,
  tempHp = 0,
  onUpdateHp
}) => {
  const [hp, setHp] = useState(currentHp);
  const [maxHpValue, setMaxHpValue] = useState(maxHp);
  const [tempHpValue, setTempHpValue] = useState(tempHp);
  const [damageInput, setDamageInput] = useState('');
  const [healInput, setHealInput] = useState('');

  useEffect(() => {
    if (isOpen) {
      setHp(currentHp);
      setMaxHpValue(maxHp);
      setTempHpValue(tempHp);
      setDamageInput('');
      setHealInput('');
    }
  }, [isOpen, currentHp, maxHp, tempHp]);

  const handleApplyDamage = () => {
    const damage = parseInt(damageInput) || 0;
    if (damage > 0) {
      let newHp = hp;
      let newTempHp = tempHpValue;

      // Apply damage to temp HP first
      if (newTempHp > 0) {
        if (damage >= newTempHp) {
          const remainingDamage = damage - newTempHp;
          newTempHp = 0;
          newHp = Math.max(0, newHp - remainingDamage);
        } else {
          newTempHp -= damage;
        }
      } else {
        newHp = Math.max(0, newHp - damage);
      }

      setHp(newHp);
      setTempHpValue(newTempHp);
      setDamageInput('');
    }
  };

  const handleApplyHealing = () => {
    const healing = parseInt(healInput) || 0;
    if (healing > 0) {
      const newHp = Math.min(maxHpValue, hp + healing);
      setHp(newHp);
      setHealInput('');
    }
  };

  const handleSave = () => {
    onUpdateHp(hp, maxHpValue, tempHpValue);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-80 max-w-sm mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500" />
            HP Management
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{combatantName}</p>
        </div>

        {/* Current HP Display */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Current HP / Max HP
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={hp}
                onChange={(e) => setHp(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <span className="text-gray-500 dark:text-gray-400">/</span>
              <input
                type="number"
                value={maxHpValue}
                onChange={(e) => setMaxHpValue(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Temp HP */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Temporary HP
            </label>
            <input
              type="number"
              value={tempHpValue}
              onChange={(e) => setTempHpValue(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="0"
            />
          </div>

          {/* Quick Actions */}
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Apply Damage
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={damageInput}
                  onChange={(e) => setDamageInput(e.target.value)}
                  className="flex-1 px-3 py-2 border border-red-300 dark:border-red-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Damage amount"
                />
                <button
                  onClick={handleApplyDamage}
                  className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-1"
                >
                  <Minus className="w-4 h-4" />
                  Apply
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Apply Healing
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={healInput}
                  onChange={(e) => setHealInput(e.target.value)}
                  className="flex-1 px-3 py-2 border border-green-300 dark:border-green-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Healing amount"
                />
                <button
                  onClick={handleApplyHealing}
                  className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Apply
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Save Changes
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HPModal;