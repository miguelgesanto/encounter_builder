import { useCallback, useMemo } from 'react'
import { useCombatStore } from '../store/combatStore'
import { Combatant, ConditionInput } from '../types/combat.types'
import { rollInitiative, getHPStatus, getHPPercentage, validateCombatant } from '../utils/combat.utils'

export interface UseCombatCardReturn {
  // Health management
  applyDamage: (damage: number) => void
  applyHealing: (healing: number) => void
  setHP: (hp: number) => void
  setTempHP: (tempHp: number) => void

  // Initiative management
  rollInitiative: () => number
  setInitiative: (initiative: number) => void

  // Condition management
  addCondition: (condition: ConditionInput) => void
  removeCondition: (conditionId: string) => void

  // Combatant management
  updateCombatant: (updates: Partial<Combatant>) => void
  removeCombatant: () => void
  duplicateCombatant: () => string

  // Computed values
  hpStatus: 'healthy' | 'wounded' | 'bloodied' | 'critical' | 'unconscious'
  hpPercentage: number
  isCurrentTurn: boolean
  hasConditions: boolean
  isDead: boolean

  // Validation
  validationErrors: string[]
  isValid: boolean
}

/**
 * Custom hook for managing individual combatant cards
 * Provides all the functionality needed for a single combatant
 */
export const useCombatCard = (combatant: Combatant): UseCombatCardReturn => {
  const store = useCombatStore()
  const currentCombatant = useCombatStore(state => state.currentCombatant)

  // Actions from store
  const updateCombatantStore = useCombatStore(state => state.updateCombatant)
  const removeCombatantStore = useCombatStore(state => state.removeCombatant)
  const duplicateCombatantStore = useCombatStore(state => state.duplicateCombatant)
  const applyDamageStore = useCombatStore(state => state.applyDamage)
  const applyHealingStore = useCombatStore(state => state.applyHealing)
  const setHPStore = useCombatStore(state => state.setHP)
  const setTempHPStore = useCombatStore(state => state.setTempHP)
  const addConditionStore = useCombatStore(state => state.addCondition)
  const removeConditionStore = useCombatStore(state => state.removeCondition)
  const rollInitiativeForStore = useCombatStore(state => state.rollInitiativeFor)
  const setInitiativeStore = useCombatStore(state => state.setInitiative)

  // Health management
  const applyDamage = useCallback((damage: number) => {
    applyDamageStore(combatant.id, damage)
  }, [combatant.id, applyDamageStore])

  const applyHealing = useCallback((healing: number) => {
    applyHealingStore(combatant.id, healing)
  }, [combatant.id, applyHealingStore])

  const setHP = useCallback((hp: number) => {
    setHPStore(combatant.id, hp)
  }, [combatant.id, setHPStore])

  const setTempHP = useCallback((tempHp: number) => {
    setTempHPStore(combatant.id, tempHp)
  }, [combatant.id, setTempHPStore])

  // Initiative management
  const rollInitiativeAction = useCallback(() => {
    return rollInitiativeForStore(combatant.id)
  }, [combatant.id, rollInitiativeForStore])

  const setInitiative = useCallback((initiative: number) => {
    setInitiativeStore(combatant.id, initiative)
  }, [combatant.id, setInitiativeStore])

  // Condition management
  const addCondition = useCallback((condition: ConditionInput) => {
    addConditionStore(combatant.id, condition)
  }, [combatant.id, addConditionStore])

  const removeCondition = useCallback((conditionId: string) => {
    removeConditionStore(combatant.id, conditionId)
  }, [combatant.id, removeConditionStore])

  // Combatant management
  const updateCombatant = useCallback((updates: Partial<Combatant>) => {
    updateCombatantStore(combatant.id, updates)
  }, [combatant.id, updateCombatantStore])

  const removeCombatant = useCallback(() => {
    removeCombatantStore(combatant.id)
  }, [combatant.id, removeCombatantStore])

  const duplicateCombatant = useCallback(() => {
    return duplicateCombatantStore(combatant.id)
  }, [combatant.id, duplicateCombatantStore])

  // Computed values
  const hpStatus = useMemo(() =>
    getHPStatus(combatant.hp, combatant.maxHp),
    [combatant.hp, combatant.maxHp]
  )

  const hpPercentage = useMemo(() =>
    getHPPercentage(combatant.hp, combatant.maxHp),
    [combatant.hp, combatant.maxHp]
  )

  const isCurrentTurn = useMemo(() =>
    currentCombatant?.id === combatant.id,
    [currentCombatant?.id, combatant.id]
  )

  const hasConditions = useMemo(() =>
    combatant.conditions.length > 0,
    [combatant.conditions.length]
  )

  const isDead = useMemo(() =>
    combatant.hp === 0,
    [combatant.hp]
  )

  const validationErrors = useMemo(() =>
    validateCombatant(combatant),
    [combatant]
  )

  const isValid = useMemo(() =>
    validationErrors.length === 0,
    [validationErrors.length]
  )

  return {
    // Health management
    applyDamage,
    applyHealing,
    setHP,
    setTempHP,

    // Initiative management
    rollInitiative: rollInitiativeAction,
    setInitiative,

    // Condition management
    addCondition,
    removeCondition,

    // Combatant management
    updateCombatant,
    removeCombatant,
    duplicateCombatant,

    // Computed values
    hpStatus,
    hpPercentage,
    isCurrentTurn,
    hasConditions,
    isDead,

    // Validation
    validationErrors,
    isValid
  }
}