import { Combatant } from '../types/combatant';
import { CreatureAbility } from '../types/creature-abilities';
import { CREATURE_ABILITIES } from '../data/creature-abilities';

export const getContextualReminders = (
  creature: Combatant,
  currentTurn: number,
  initiative: number,
  allCombatants?: Combatant[]
): CreatureAbility[] => {
  const creatureTemplate = CREATURE_ABILITIES.find(c => c.name === creature.name);
  if (!creatureTemplate) return [];

  const reminders: CreatureAbility[] = [];
  // If allCombatants is provided, check if this creature is at the current turn index
  const isCreatureTurn = allCombatants ?
    allCombatants[currentTurn]?.id === creature.id :
    creature.id === currentTurn.toString() || currentTurn === parseInt(creature.id);

  // Check if current initiative is the highest initiative for lair actions
  const currentCreature = allCombatants?.[currentTurn];
  const maxInitiative = allCombatants ? Math.max(...allCombatants.map(c => c.initiative)) : 0;
  const isTopOfRound = currentCreature?.initiative === maxInitiative;

  // Lair Actions (Top of Round) - HIGHEST PRIORITY
  // Show lair actions if: (1) current initiative is highest AND (2) this creature has lair actions
  if (isTopOfRound) {
    const lairActions = creatureTemplate.abilities.filter(a => a.type === 'lair_actions');
    if (lairActions.length > 0) {
      reminders.push(...lairActions);
      // If it's also this creature's turn, continue to add their other abilities too
      if (!isCreatureTurn) {
        return reminders; // Return ONLY lair actions if it's not the creature's turn
      }
    }
  }

  // Creature's own turn - show start of turn, combat abilities, resistances, concentration
  if (isCreatureTurn) {
    reminders.push(...creatureTemplate.abilities.filter(a =>
      ['start_of_turn', 'combat_ability', 'resistance', 'concentration'].includes(a.type)
    ));
  }

  // Not creature's turn but creature has legendary actions - show them
  if (!isCreatureTurn && !isTopOfRound) {
    const legendaryActions = creatureTemplate.abilities.filter(a => a.type === 'legendary_actions');
    if (legendaryActions.length > 0) {
      reminders.push(...legendaryActions);
    }
  }

  // Sort by priority: critical > high > medium > low
  const priorityOrder = { 'critical': 0, 'high': 1, 'medium': 2, 'low': 3 };
  reminders.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  // Limit to prevent information overload
  return reminders.slice(0, 8);
};

// Check if creature has legendary actions based on CR or explicit marking
export const hasLegendaryActions = (creature: Combatant): boolean => {
  const creatureTemplate = CREATURE_ABILITIES.find(c => c.name === creature.name);
  return creatureTemplate?.abilities.some(a => a.type === 'legendary_actions') || false;
};

// Lair action special handling
export const checkForLairActions = (initiative: number, creatures: Combatant[]): Combatant[] => {
  // Check if this is the highest initiative (top of round)
  const maxInitiative = Math.max(...creatures.map(c => c.initiative));
  console.log('🔍 checkForLairActions:', {
    currentInitiative: initiative,
    maxInitiative,
    isTopOfRound: initiative === maxInitiative,
    allCreatures: creatures.map(c => ({ name: c.name, initiative: c.initiative }))
  });

  if (initiative !== maxInitiative) return [];

  const lairCreatures = creatures.filter(creature => {
    const template = CREATURE_ABILITIES.find(c => c.name === creature.name);
    const hasLair = template?.abilities.some(a => a.type === 'lair_actions');
    console.log(`🏰 Checking ${creature.name}: hasLair=${hasLair}, template=${!!template}`);
    return hasLair;
  });

  console.log('🎭 Final lair creatures:', lairCreatures.map(c => c.name));
  return lairCreatures;
};

// Get the current creature based on turn index
export const getCurrentCreature = (creatures: Combatant[], currentTurn: number): Combatant | null => {
  return creatures[currentTurn] || null;
};

// Check if any creature has reminders for the current state
export const hasActiveReminders = (
  creature: Combatant,
  currentTurn: number,
  initiative: number,
  allCombatants?: Combatant[]
): boolean => {
  const reminders = getContextualReminders(creature, currentTurn, initiative, allCombatants);
  return reminders.length > 0;
};