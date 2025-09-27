import { create } from 'zustand'
import { subscribeWithSelector, persist } from 'zustand/middleware'
import { Combatant, CombatState, CombatStats, Condition, CombatantUpdate, CombatEvent } from '../types/combat.types'
import {
  sortByInitiative,
  generateCombatantId,
  getHPPercentage,
  rollInitiative,
  validateCombatant
} from '../utils/combat.utils'

interface CombatStore extends CombatState {
  // Computed values
  sortedCombatants: Combatant[]
  currentCombatant: Combatant | null
  stats: CombatStats
  events: CombatEvent[]

  // Actions - Combatant Management
  addCombatant: (combatantData: Omit<Combatant, 'id' | 'createdAt' | 'updatedAt' | 'conditions'>) => string
  updateCombatant: (id: string, updates: CombatantUpdate) => void
  removeCombatant: (id: string) => void
  duplicateCombatant: (id: string) => string

  // Actions - Combat Control
  startCombat: () => void
  endCombat: () => void
  pauseCombat: () => void
  resumeCombat: () => void
  nextTurn: () => void
  previousTurn: () => void
  goToTurn: (turnIndex: number) => void
  resetInitiative: () => void

  // Actions - Health Management
  applyDamage: (id: string, damage: number) => void
  applyHealing: (id: string, healing: number) => void
  setHP: (id: string, hp: number) => void
  setTempHP: (id: string, tempHp: number) => void

  // Actions - Condition Management
  addCondition: (combatantId: string, condition: Omit<Condition, 'id'>) => void
  removeCondition: (combatantId: string, conditionId: string) => void
  updateCondition: (combatantId: string, conditionId: string, updates: Partial<Condition>) => void

  // Actions - Initiative Management
  rollInitiativeForAll: () => void
  rollInitiativeFor: (id: string) => number
  setInitiative: (id: string, initiative: number) => void

  // Actions - Notes and Events
  setNotes: (notes: string) => void
  addEvent: (event: Omit<CombatEvent, 'id' | 'timestamp'>) => void
  clearEvents: () => void

  // Utility actions
  importCombatants: (combatants: Combatant[]) => void
  exportCombat: () => CombatState & { events: CombatEvent[] }
  resetCombat: () => void
}

// Helper to create events
const createEvent = (type: CombatEvent['type'], combatantId?: string, data?: Record<string, any>): CombatEvent => ({
  id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  type,
  combatantId,
  timestamp: new Date().toISOString(),
  data
})

// Helper to create combatant
const createCombatant = (data: Omit<Combatant, 'id' | 'createdAt' | 'updatedAt' | 'conditions'>): Combatant => {
  const now = new Date().toISOString()
  return {
    ...data,
    id: generateCombatantId(),
    conditions: [],
    createdAt: now,
    updatedAt: now
  }
}

export const useCombatStore = create<CombatStore>()(
  persist(
    subscribeWithSelector((set, get) => ({
      // Initial state
      combatants: [],
      currentTurn: 0,
      round: 1,
      isActive: false,
      isPaused: false,
      startTime: undefined,
      notes: '',
      events: [],

      // Computed values
      get sortedCombatants() {
        return sortByInitiative(get().combatants)
      },

      get currentCombatant() {
        const { sortedCombatants, currentTurn } = get()
        return sortedCombatants[currentTurn] || null
      },

      get stats() {
        const { combatants, events } = get()
        const monsters = combatants.filter(c => !c.isPC)

        return {
          totalXP: monsters.reduce((sum, c) => sum + (c.xp || 0), 0),
          averageHP: combatants.length > 0
            ? combatants.reduce((sum, c) => sum + getHPPercentage(c.hp, c.maxHp), 0) / combatants.length
            : 0,
          activeConditions: combatants.reduce((sum, c) => sum + c.conditions.length, 0),
          turnDuration: 0, // TODO: Calculate from events
          totalTurns: events.filter(e => e.type === 'turn_start').length
        }
      },

      // Combatant Management
      addCombatant: (combatantData) => {
        const errors = validateCombatant(combatantData)
        if (errors.length > 0) {
          console.error('Validation errors:', errors)
          throw new Error(`Invalid combatant data: ${errors.join(', ')}`)
        }

        const combatant = createCombatant(combatantData)

        set((state) => ({
          combatants: [...state.combatants, combatant]
        }))

        get().addEvent({
          type: 'turn_start', // Using as generic "added" event
          combatantId: combatant.id,
          data: { name: combatant.name, action: 'added' }
        })

        return combatant.id
      },

      updateCombatant: (id, updates) => {
        set((state) => ({
          combatants: state.combatants.map(c =>
            c.id === id
              ? { ...c, ...updates, updatedAt: new Date().toISOString() }
              : c
          )
        }))
      },

      removeCombatant: (id) => {
        const combatant = get().combatants.find(c => c.id === id)

        set((state) => {
          const newCombatants = state.combatants.filter(c => c.id !== id)
          const newCurrentTurn = state.currentTurn >= newCombatants.length
            ? Math.max(0, newCombatants.length - 1)
            : state.currentTurn

          return {
            combatants: newCombatants,
            currentTurn: newCurrentTurn
          }
        })

        if (combatant) {
          get().addEvent({
            type: 'turn_end', // Using as generic "removed" event
            combatantId: id,
            data: { name: combatant.name, action: 'removed' }
          })
        }
      },

      duplicateCombatant: (id) => {
        const original = get().combatants.find(c => c.id === id)
        if (!original) return ''

        const duplicate = createCombatant({
          ...original,
          name: `${original.name} (Copy)`,
          hp: original.maxHp // Reset to full HP
        })

        set((state) => ({
          combatants: [...state.combatants, duplicate]
        }))

        return duplicate.id
      },

      // Combat Control
      startCombat: () => {
        set({
          isActive: true,
          isPaused: false,
          startTime: new Date().toISOString(),
          currentTurn: 0,
          round: 1
        })

        get().addEvent({
          type: 'round_start',
          data: { round: 1 }
        })
      },

      endCombat: () => {
        set({
          isActive: false,
          isPaused: false,
          currentTurn: 0,
          round: 1
        })

        get().addEvent({
          type: 'round_end',
          data: { action: 'combat_ended' }
        })
      },

      pauseCombat: () => {
        set({ isPaused: true })
      },

      resumeCombat: () => {
        set({ isPaused: false })
      },

      nextTurn: () => {
        const { sortedCombatants, currentTurn, round } = get()
        const nextTurn = (currentTurn + 1) % sortedCombatants.length
        const isNewRound = nextTurn === 0

        // End current turn
        const currentCombatant = get().currentCombatant
        if (currentCombatant) {
          get().addEvent({
            type: 'turn_end',
            combatantId: currentCombatant.id
          })
        }

        set({
          currentTurn: nextTurn,
          round: isNewRound ? round + 1 : round
        })

        // Start new turn/round
        const newCombatant = sortedCombatants[nextTurn]
        if (newCombatant) {
          get().addEvent({
            type: isNewRound ? 'round_start' : 'turn_start',
            combatantId: newCombatant.id,
            data: isNewRound ? { round: round + 1 } : undefined
          })
        }
      },

      previousTurn: () => {
        const { sortedCombatants, currentTurn, round } = get()
        const prevTurn = currentTurn === 0 ? sortedCombatants.length - 1 : currentTurn - 1
        const isNewRound = currentTurn === 0 && round > 1

        set({
          currentTurn: prevTurn,
          round: isNewRound ? round - 1 : round
        })
      },

      goToTurn: (turnIndex) => {
        const { sortedCombatants } = get()
        if (turnIndex >= 0 && turnIndex < sortedCombatants.length) {
          set({ currentTurn: turnIndex })
        }
      },

      resetInitiative: () => {
        set((state) => ({
          combatants: state.combatants.map(c => ({ ...c, initiative: 0 }))
        }))
      },

      // Health Management
      applyDamage: (id, damage) => {
        const combatant = get().combatants.find(c => c.id === id)
        if (!combatant) return

        const actualDamage = Math.min(damage, combatant.hp + combatant.tempHp)
        const newTempHp = Math.max(0, combatant.tempHp - damage)
        const remainingDamage = damage - (combatant.tempHp - newTempHp)
        const newHp = Math.max(0, combatant.hp - Math.max(0, remainingDamage))

        get().updateCombatant(id, {
          hp: newHp,
          tempHp: newTempHp
        })

        get().addEvent({
          type: 'damage_taken',
          combatantId: id,
          data: { damage: actualDamage, newHp, newTempHp }
        })
      },

      applyHealing: (id, healing) => {
        const combatant = get().combatants.find(c => c.id === id)
        if (!combatant) return

        const newHp = Math.min(combatant.maxHp, combatant.hp + healing)
        const actualHealing = newHp - combatant.hp

        get().updateCombatant(id, { hp: newHp })

        if (actualHealing > 0) {
          get().addEvent({
            type: 'healing_received',
            combatantId: id,
            data: { healing: actualHealing, newHp }
          })
        }
      },

      setHP: (id, hp) => {
        const combatant = get().combatants.find(c => c.id === id)
        if (!combatant) return

        const clampedHP = Math.max(0, Math.min(hp, combatant.maxHp))
        get().updateCombatant(id, { hp: clampedHP })
      },

      setTempHP: (id, tempHp) => {
        const clampedTempHP = Math.max(0, tempHp)
        get().updateCombatant(id, { tempHp: clampedTempHP })
      },

      // Condition Management
      addCondition: (combatantId, conditionData) => {
        const condition: Condition = {
          ...conditionData,
          id: `condition-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        }

        set((state) => ({
          combatants: state.combatants.map(c =>
            c.id === combatantId
              ? { ...c, conditions: [...c.conditions, condition] }
              : c
          )
        }))

        get().addEvent({
          type: 'condition_added',
          combatantId,
          data: { conditionName: condition.name, conditionId: condition.id }
        })
      },

      removeCondition: (combatantId, conditionId) => {
        let removedCondition: Condition | null = null

        set((state) => ({
          combatants: state.combatants.map(c => {
            if (c.id === combatantId) {
              removedCondition = c.conditions.find(cond => cond.id === conditionId) || null
              return {
                ...c,
                conditions: c.conditions.filter(cond => cond.id !== conditionId)
              }
            }
            return c
          })
        }))

        if (removedCondition) {
          get().addEvent({
            type: 'condition_removed',
            combatantId,
            data: { conditionName: removedCondition.name, conditionId }
          })
        }
      },

      updateCondition: (combatantId, conditionId, updates) => {
        set((state) => ({
          combatants: state.combatants.map(c =>
            c.id === combatantId
              ? {
                  ...c,
                  conditions: c.conditions.map(cond =>
                    cond.id === conditionId ? { ...cond, ...updates } : cond
                  )
                }
              : c
          )
        }))
      },

      // Initiative Management
      rollInitiativeForAll: () => {
        set((state) => ({
          combatants: state.combatants.map(c => ({
            ...c,
            initiative: rollInitiative(c.abilities?.dex)
          }))
        }))

        get().addEvent({
          type: 'round_start',
          data: { action: 'initiative_rolled' }
        })
      },

      rollInitiativeFor: (id) => {
        const combatant = get().combatants.find(c => c.id === id)
        if (!combatant) return 0

        const newInitiative = rollInitiative(combatant.abilities?.dex)
        get().updateCombatant(id, { initiative: newInitiative })
        return newInitiative
      },

      setInitiative: (id, initiative) => {
        get().updateCombatant(id, { initiative })
      },

      // Notes and Events
      setNotes: (notes) => {
        set({ notes })
      },

      addEvent: (eventData) => {
        const event = createEvent(eventData.type, eventData.combatantId, eventData.data)
        set((state) => ({
          events: [...state.events, event]
        }))
      },

      clearEvents: () => {
        set({ events: [] })
      },

      // Utility actions
      importCombatants: (combatants) => {
        const validatedCombatants = combatants.map(c => {
          const errors = validateCombatant(c)
          if (errors.length > 0) {
            console.warn(`Skipping invalid combatant ${c.name}:`, errors)
            return null
          }
          return c
        }).filter(Boolean) as Combatant[]

        set({ combatants: validatedCombatants })
      },

      exportCombat: () => {
        const state = get()
        return {
          combatants: state.combatants,
          currentTurn: state.currentTurn,
          round: state.round,
          isActive: state.isActive,
          isPaused: state.isPaused,
          startTime: state.startTime,
          notes: state.notes,
          events: state.events
        }
      },

      resetCombat: () => {
        set({
          combatants: [],
          currentTurn: 0,
          round: 1,
          isActive: false,
          isPaused: false,
          startTime: undefined,
          notes: '',
          events: []
        })
      }
    })),
    {
      name: 'dnd-combat-tracker',
      partialize: (state) => ({
        combatants: state.combatants,
        currentTurn: state.currentTurn,
        round: state.round,
        notes: state.notes
      })
    }
  )
)