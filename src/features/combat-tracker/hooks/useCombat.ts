import { useCallback, useMemo } from 'react'
import { useCombatStore } from '../store/combatStore'
import { Combatant, CombatStats } from '../types/combat.types'
import { calculateEncounterDifficulty } from '../utils/combat.utils'

export interface UseCombatReturn {
  // State
  combatants: Combatant[]
  sortedCombatants: Combatant[]
  currentCombatant: Combatant | null
  currentTurn: number
  round: number
  isActive: boolean
  isPaused: boolean
  notes: string
  stats: CombatStats

  // Combat control
  startCombat: () => void
  endCombat: () => void
  pauseCombat: () => void
  resumeCombat: () => void
  nextTurn: () => void
  previousTurn: () => void
  goToTurn: (turnIndex: number) => void

  // Combatant management
  addCombatant: (combatant: Omit<Combatant, 'id' | 'createdAt' | 'updatedAt' | 'conditions'>) => string
  importCombatants: (combatants: Combatant[]) => void
  resetCombat: () => void

  // Initiative management
  rollInitiativeForAll: () => void
  resetInitiative: () => void

  // Notes
  setNotes: (notes: string) => void

  // Computed values
  playerCharacters: Combatant[]
  monsters: Combatant[]
  encounterDifficulty: 'trivial' | 'easy' | 'medium' | 'hard' | 'deadly' | 'legendary'
  canStartCombat: boolean
  hasActiveCombat: boolean

  // Utility functions
  exportCombat: () => any
  getCombatantById: (id: string) => Combatant | undefined
  getTurnOrder: () => string[]
}

/**
 * Main hook for combat tracker functionality
 * Provides high-level combat management operations
 */
export const useCombat = (): UseCombatReturn => {
  // Store state
  const combatants = useCombatStore(state => state.combatants)
  const sortedCombatants = useCombatStore(state => state.sortedCombatants)
  const currentCombatant = useCombatStore(state => state.currentCombatant)
  const currentTurn = useCombatStore(state => state.currentTurn)
  const round = useCombatStore(state => state.round)
  const isActive = useCombatStore(state => state.isActive)
  const isPaused = useCombatStore(state => state.isPaused)
  const notes = useCombatStore(state => state.notes)
  const stats = useCombatStore(state => state.stats)

  // Store actions
  const startCombatStore = useCombatStore(state => state.startCombat)
  const endCombatStore = useCombatStore(state => state.endCombat)
  const pauseCombatStore = useCombatStore(state => state.pauseCombat)
  const resumeCombatStore = useCombatStore(state => state.resumeCombat)
  const nextTurnStore = useCombatStore(state => state.nextTurn)
  const previousTurnStore = useCombatStore(state => state.previousTurn)
  const goToTurnStore = useCombatStore(state => state.goToTurn)
  const addCombatantStore = useCombatStore(state => state.addCombatant)
  const importCombatantsStore = useCombatStore(state => state.importCombatants)
  const resetCombatStore = useCombatStore(state => state.resetCombat)
  const rollInitiativeForAllStore = useCombatStore(state => state.rollInitiativeForAll)
  const resetInitiativeStore = useCombatStore(state => state.resetInitiative)
  const setNotesStore = useCombatStore(state => state.setNotes)
  const exportCombatStore = useCombatStore(state => state.exportCombat)

  // Combat control actions
  const startCombat = useCallback(() => {
    if (combatants.length === 0) {
      throw new Error('Cannot start combat with no combatants')
    }
    startCombatStore()
  }, [combatants.length, startCombatStore])

  const endCombat = useCallback(() => {
    endCombatStore()
  }, [endCombatStore])

  const pauseCombat = useCallback(() => {
    if (!isActive) return
    pauseCombatStore()
  }, [isActive, pauseCombatStore])

  const resumeCombat = useCallback(() => {
    if (!isActive || !isPaused) return
    resumeCombatStore()
  }, [isActive, isPaused, resumeCombatStore])

  const nextTurn = useCallback(() => {
    if (!isActive || isPaused) return
    nextTurnStore()
  }, [isActive, isPaused, nextTurnStore])

  const previousTurn = useCallback(() => {
    if (!isActive) return
    previousTurnStore()
  }, [isActive, previousTurnStore])

  const goToTurn = useCallback((turnIndex: number) => {
    if (!isActive) return
    goToTurnStore(turnIndex)
  }, [isActive, goToTurnStore])

  // Combatant management
  const addCombatant = useCallback((combatantData: Omit<Combatant, 'id' | 'createdAt' | 'updatedAt' | 'conditions'>) => {
    return addCombatantStore(combatantData)
  }, [addCombatantStore])

  const importCombatants = useCallback((newCombatants: Combatant[]) => {
    importCombatantsStore(newCombatants)
  }, [importCombatantsStore])

  const resetCombat = useCallback(() => {
    resetCombatStore()
  }, [resetCombatStore])

  // Initiative management
  const rollInitiativeForAll = useCallback(() => {
    rollInitiativeForAllStore()
  }, [rollInitiativeForAllStore])

  const resetInitiative = useCallback(() => {
    resetInitiativeStore()
  }, [resetInitiativeStore])

  // Notes
  const setNotes = useCallback((newNotes: string) => {
    setNotesStore(newNotes)
  }, [setNotesStore])

  // Computed values
  const playerCharacters = useMemo(() =>
    combatants.filter(c => c.isPC),
    [combatants]
  )

  const monsters = useMemo(() =>
    combatants.filter(c => !c.isPC),
    [combatants]
  )

  const encounterDifficulty = useMemo(() => {
    if (playerCharacters.length === 0 || monsters.length === 0) {
      return 'trivial' as const
    }

    const avgLevel = playerCharacters.reduce((sum, pc) => sum + (pc.level || 1), 0) / playerCharacters.length
    const totalXP = monsters.reduce((sum, monster) => sum + (monster.xp || 0), 0)

    return calculateEncounterDifficulty(
      Math.round(avgLevel),
      playerCharacters.length,
      totalXP
    )
  }, [playerCharacters, monsters])

  const canStartCombat = useMemo(() =>
    combatants.length > 0 && !isActive,
    [combatants.length, isActive]
  )

  const hasActiveCombat = useMemo(() =>
    isActive,
    [isActive]
  )

  // Utility functions
  const exportCombat = useCallback(() => {
    return exportCombatStore()
  }, [exportCombatStore])

  const getCombatantById = useCallback((id: string) => {
    return combatants.find(c => c.id === id)
  }, [combatants])

  const getTurnOrder = useCallback(() => {
    return sortedCombatants.map(c => c.id)
  }, [sortedCombatants])

  return {
    // State
    combatants,
    sortedCombatants,
    currentCombatant,
    currentTurn,
    round,
    isActive,
    isPaused,
    notes,
    stats,

    // Combat control
    startCombat,
    endCombat,
    pauseCombat,
    resumeCombat,
    nextTurn,
    previousTurn,
    goToTurn,

    // Combatant management
    addCombatant,
    importCombatants,
    resetCombat,

    // Initiative management
    rollInitiativeForAll,
    resetInitiative,

    // Notes
    setNotes,

    // Computed values
    playerCharacters,
    monsters,
    encounterDifficulty,
    canStartCombat,
    hasActiveCombat,

    // Utility functions
    exportCombat,
    getCombatantById,
    getTurnOrder
  }
}