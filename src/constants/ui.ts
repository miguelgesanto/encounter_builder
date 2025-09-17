// UI Constants
export const ANIMATION = {
  DURATION: 200,
  TRANSITION: 'transition-all duration-200',
} as const;

export const COLORS = {
  // Changed: Use blue for current turn instead of red
  CURRENT_TURN: 'bg-blue-900 border-2 border-blue-500 shadow-blue-500/20',
  NORMAL: 'bg-gray-900 hover:bg-gray-800 border-2 border-transparent',

  // Keep red only for danger/remove actions
  DANGER: 'bg-red-600 hover:bg-red-700',

  // Keep existing chip colors
  PC_CHIP: 'bg-green-900 text-green-300',
  NPC_CHIP: 'bg-amber-900 text-amber-300',
  CONDITION: 'bg-red-900 text-red-300',
} as const;

export const STORAGE_KEYS = {
  SAVED_ENCOUNTERS: 'dnd-saved-encounters',
  CURRENT_ENCOUNTER: 'dnd-current-encounter',
} as const;