import { useCallback } from 'react';
import { Combatant } from '../types/combatant';

export const useInitiative = () => {
  const rollInitiative = useCallback((combatant: Combatant): number => {
    const roll = Math.floor(Math.random() * 20) + 1;
    const modifier = combatant.isPC ? 2 : Math.floor(Math.random() * 4) + 1; // Keep existing logic
    return roll + modifier;
  }, []);

  const rollAllInitiative = useCallback((combatants: Combatant[]): Combatant[] => {
    return combatants.map(combatant => ({
      ...combatant,
      initiative: rollInitiative(combatant)
    }));
  }, [rollInitiative]);

  const sortByInitiative = useCallback((combatants: Combatant[]): Combatant[] => {
    return [...combatants].sort((a, b) => b.initiative - a.initiative);
  }, []);

  return {
    rollInitiative,
    rollAllInitiative,
    sortByInitiative,
  };
};