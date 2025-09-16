import React, { useState } from 'react';
import { Plus, X, User, Dice1 } from 'lucide-react';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCreature: (creature: any) => void;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({ isOpen, onClose, onAddCreature }) => {
  const [name, setName] = useState('');
  const [hp, setHp] = useState(10);
  const [ac, setAc] = useState(12);
  const [isPC, setIsPC] = useState(false);
  const [level, setLevel] = useState(1);
  const [cr, setCr] = useState('1/4');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newCreature = {
      name: name.trim(),
      hp,
      maxHp: hp,
      ac,
      initiative: 0,
      isPC,
      level: isPC ? level : undefined,
      cr: !isPC ? cr : undefined,
      conditions: [],
      tempHp: 0
    };

    onAddCreature(newCreature);

    // Reset form
    setName('');
    setHp(10);
    setAc(12);
    setIsPC(false);
    setLevel(1);
    setCr('1/4');

    onClose();
  };

  const rollHP = () => {
    const roll = Math.floor(Math.random() * 10) + 6; // 6-15 HP range
    setHp(roll);
  };

  return (
    <div className="modal-overlay fixed inset-0 z-50 flex items-center justify-center">
      <div className="modal-content bg-dnd-elevated border border-dnd rounded-xl p-6 w-96 max-w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-green-500" />
            <h3 className="text-lg font-semibold text-dnd-primary">Add Combatant</h3>
          </div>
          <button
            onClick={onClose}
            className="btn-dnd p-2"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-dnd-muted mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-dnd w-full"
              placeholder="Enter combatant name..."
              autoComplete="name"
              autoFocus
              required
            />
          </div>

          {/* Type Toggle */}
          <div>
            <label className="block text-sm font-medium text-dnd-muted mb-2">Type</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsPC(false)}
                className={`btn-dnd flex-1 ${!isPC ? 'btn-dnd-primary' : ''}`}
              >
                Monster/NPC
              </button>
              <button
                type="button"
                onClick={() => setIsPC(true)}
                className={`btn-dnd flex-1 flex items-center justify-center gap-1 ${isPC ? 'btn-dnd-success' : ''}`}
              >
                <User className="w-4 h-4" />
                Player Character
              </button>
            </div>
          </div>

          {/* HP and AC */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dnd-muted mb-1">Hit Points</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={hp}
                  onChange={(e) => setHp(Math.max(1, parseInt(e.target.value) || 1))}
                  className="input-dnd flex-1"
                  min="1"
                  required
                />
                <button
                  type="button"
                  onClick={rollHP}
                  className="btn-dnd px-3"
                  title="Roll random HP"
                >
                  <Dice1 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-dnd-muted mb-1">Armor Class</label>
              <input
                type="number"
                value={ac}
                onChange={(e) => setAc(Math.max(1, parseInt(e.target.value) || 1))}
                className="input-dnd w-full"
                min="1"
                required
              />
            </div>
          </div>

          {/* PC Level or Monster CR */}
          {isPC ? (
            <div>
              <label className="block text-sm font-medium text-dnd-muted mb-1">Level</label>
              <input
                type="number"
                value={level}
                onChange={(e) => setLevel(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
                className="input-dnd w-full"
                min="1"
                max="20"
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-dnd-muted mb-1">Challenge Rating</label>
              <select
                value={cr}
                onChange={(e) => setCr(e.target.value)}
                className="select-dnd w-full"
              >
                <option value="0">0</option>
                <option value="1/8">1/8</option>
                <option value="1/4">1/4</option>
                <option value="1/2">1/2</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="6">6</option>
                <option value="7">7</option>
                <option value="8">8</option>
                <option value="9">9</option>
                <option value="10">10</option>
                <option value="11">11</option>
                <option value="12">12</option>
                <option value="13">13</option>
                <option value="14">14</option>
                <option value="15">15</option>
                <option value="16">16</option>
                <option value="17">17</option>
                <option value="18">18</option>
                <option value="19">19</option>
                <option value="20">20</option>
              </select>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-dnd px-4 py-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-dnd btn-dnd-primary px-4 py-2 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Combatant
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};