import { useCallback } from 'react';
import { Combatant } from '../types/combatant';

export const useEncounterBalance = () => {
  const calculateDifficulty = useCallback((combatants: Combatant[]) => {
    const party = combatants.filter(c => c.isPC);
    const enemies = combatants.filter(c => !c.isPC);

    if (party.length === 0) return { difficulty: 'No Party', xp: 0 };

    const avgLevel = Math.round(party.reduce((sum, pc) => sum + (pc.level || 5), 0) / party.length);
    const totalXP = enemies.reduce((sum, enemy) => sum + (enemy.xp || 0), 0);

    // Using the existing thresholds calculation logic
    const thresholds = {
      easy: 25 * party.length * avgLevel,
      medium: 50 * party.length * avgLevel,
      hard: 75 * party.length * avgLevel,
      deadly: 100 * party.length * avgLevel
    };

    let difficulty = 'trivial';
    if (totalXP >= thresholds.deadly) difficulty = 'deadly';
    else if (totalXP >= thresholds.hard) difficulty = 'hard';
    else if (totalXP >= thresholds.medium) difficulty = 'medium';
    else if (totalXP >= thresholds.easy) difficulty = 'easy';

    return { difficulty, xp: totalXP };
  }, []);

  return { calculateDifficulty };
};