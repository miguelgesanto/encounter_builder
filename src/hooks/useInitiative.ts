import { useCallback } from 'react';
import { Combatant } from '../types/combatant';

export const useInitiative = () => {
  const getInitiativeModifier = (combatant: Combatant): number => {
    if (combatant.isPC) {
      return 2; // Default PC modifier
    }

    // Calculate dexterity modifier based on creature type and CR
    const crValue = parseFloat(combatant.cr || '1');
    const baseMod = Math.min(5, Math.max(0, Math.floor(crValue / 5)));

    let dexterity = 12; // Default
    if (combatant.type === 'dragon') {
      dexterity = 10 + baseMod;
    } else if (combatant.type === 'undead') {
      dexterity = 16 + baseMod;
    } else if (combatant.type === 'giant') {
      dexterity = 13 + baseMod;
    } else {
      dexterity = 12 + baseMod;
    }

    return Math.floor((dexterity - 10) / 2);
  };

  const rollInitiative = useCallback((combatant: Combatant): number => {
    const roll = Math.floor(Math.random() * 20) + 1;
    const modifier = getInitiativeModifier(combatant);
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