import React from 'react';
import { X } from 'lucide-react';
import { Combatant } from '../types/combatant';
import { getContextualReminders } from '../utils/reminder-logic';

interface DMReminderCardProps {
  creature: Combatant;
  currentTurn: number;
  round: number;
  initiative: number;
  onDismiss: () => void;
  allCombatants?: Combatant[];
}

const DMReminderCard: React.FC<DMReminderCardProps> = ({
  creature,
  currentTurn,
  round,
  initiative,
  onDismiss,
  allCombatants
}) => {
  const reminders = getContextualReminders(creature, currentTurn, initiative, allCombatants);

  if (reminders.length === 0) return null;

  return (
    <div className="card-dnd mb-4 border-l-4 border-amber-500 bg-amber-50">

      {/* Header */}
      <div className="flex justify-between items-center p-3 border-b border-amber-200">
        <h3 className="font-semibold text-amber-900 text-sm flex items-center gap-2">
          💡 {creature.name} - Round {round}
        </h3>
        <button
          onClick={onDismiss}
          className="text-amber-600 hover:text-amber-800 p-1 rounded hover:bg-amber-100 transition-colors"
          aria-label="Dismiss reminder"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Compact Single Column Layout */}
      <div className="p-3 space-y-2">
        {reminders.map((reminder, idx) => {
          const getIcon = (type: string) => {
            switch(type) {
              case 'start_of_turn': return '🟢';
              case 'legendary_actions': return '👑';
              case 'lair_actions': return '📍';
              case 'combat_ability': return '⚡';
              case 'resistance': return '🛡️';
              case 'concentration': return '🎯';
              default: return '•';
            }
          };

          return (
            <div key={idx} className="text-sm flex items-start gap-2">
              <span className="text-base mt-0.5">{getIcon(reminder.type)}</span>
              <div className="flex-1">
                <span className="font-medium text-gray-800">{reminder.name}:</span>{' '}
                <span className="text-gray-700">{reminder.description}</span>
                {reminder.timing && (
                  <span className="text-xs text-gray-500 block">({reminder.timing})</span>
                )}
                {reminder.count && (
                  <span className="text-xs text-gray-500 block">({reminder.count} actions)</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DMReminderCard;