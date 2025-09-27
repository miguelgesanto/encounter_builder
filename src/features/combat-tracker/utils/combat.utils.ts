import { Combatant, CombatantUpdate, ChallengeRating } from '../types/combat.types'
import { AbilityScores } from '../../../shared/types/common.types'

/**
 * Dice rolling utilities
 */
export const rollD20 = (): number => Math.floor(Math.random() * 20) + 1
export const rollD6 = (): number => Math.floor(Math.random() * 6) + 1
export const rollDice = (sides: number, count: number = 1): number => {
  let total = 0
  for (let i = 0; i < count; i++) {
    total += Math.floor(Math.random() * sides) + 1
  }
  return total
}

/**
 * Get ability score modifier
 */
export const getModifier = (score: number): number => Math.floor((score - 10) / 2)

/**
 * Get proficiency bonus based on character level or CR
 */
export const getProficiencyBonus = (levelOrCR: number | string): number => {
  let level: number

  if (typeof levelOrCR === 'string') {
    // Convert CR to effective level
    const crValue = levelOrCR === '1/8' ? 0.125 :
                   levelOrCR === '1/4' ? 0.25 :
                   levelOrCR === '1/2' ? 0.5 :
                   parseInt(levelOrCR)

    if (crValue < 1) level = 1
    else if (crValue < 5) level = Math.ceil(crValue * 2)
    else level = Math.min(20, Math.ceil(crValue))
  } else {
    level = levelOrCR
  }

  if (level < 5) return 2
  if (level < 9) return 3
  if (level < 13) return 4
  if (level < 17) return 5
  return 6
}

/**
 * Calculate initiative with optional dexterity modifier
 */
export const rollInitiative = (dexScore?: number): number => {
  const dexMod = dexScore ? getModifier(dexScore) : 0
  return rollD20() + dexMod
}

/**
 * Convert challenge rating to XP value
 */
export const crToXP = (cr: ChallengeRating): number => {
  const crMap: Record<ChallengeRating, number> = {
    '0': 10, '1/8': 25, '1/4': 50, '1/2': 100, '1': 200, '2': 450, '3': 700, '4': 1100,
    '5': 1800, '6': 2300, '7': 2900, '8': 3900, '9': 5000, '10': 5900, '11': 7200,
    '12': 8400, '13': 10000, '14': 11500, '15': 13000, '16': 15000, '17': 18000,
    '18': 20000, '19': 22000, '20': 25000, '21': 33000, '22': 41000, '23': 50000,
    '24': 62000, '25': 75000, '26': 90000, '27': 105000, '28': 120000, '29': 135000, '30': 155000
  }
  return crMap[cr] || 0
}

/**
 * Format challenge rating for display
 */
export const formatChallengeRating = (cr: string): string => {
  if (!cr) return 'N/A'
  if (cr === '0.125') return '1/8'
  if (cr === '0.25') return '1/4'
  if (cr === '0.5') return '1/2'
  return cr
}

/**
 * Calculate HP percentage for status indicators
 */
export const getHPPercentage = (hp: number, maxHp: number): number => {
  if (maxHp === 0) return 0
  return Math.max(0, (hp / maxHp) * 100)
}

/**
 * Get HP status for UI styling
 */
export const getHPStatus = (hp: number, maxHp: number): 'healthy' | 'wounded' | 'bloodied' | 'critical' | 'unconscious' => {
  const percentage = getHPPercentage(hp, maxHp)

  if (hp === 0) return 'unconscious'
  if (percentage <= 25) return 'critical'
  if (percentage <= 50) return 'bloodied'
  if (percentage <= 75) return 'wounded'
  return 'healthy'
}

/**
 * Sort combatants by initiative (descending)
 */
export const sortByInitiative = (combatants: Combatant[]): Combatant[] => {
  return [...combatants].sort((a, b) => {
    // Sort by initiative (higher first), then by dex modifier as tiebreaker
    if (a.initiative !== b.initiative) {
      return b.initiative - a.initiative
    }

    // Tiebreaker: higher dex modifier goes first
    const aDex = a.abilities?.dex || 10
    const bDex = b.abilities?.dex || 10
    return getModifier(bDex) - getModifier(aDex)
  })
}

/**
 * Validate combatant data
 */
export const validateCombatant = (combatant: Partial<Combatant>): string[] => {
  const errors: string[] = []

  if (!combatant.name?.trim()) {
    errors.push('Name is required')
  }

  if (typeof combatant.hp !== 'number' || combatant.hp < 0) {
    errors.push('HP must be a non-negative number')
  }

  if (typeof combatant.maxHp !== 'number' || combatant.maxHp <= 0) {
    errors.push('Max HP must be a positive number')
  }

  if (typeof combatant.ac !== 'number' || combatant.ac < 0 || combatant.ac > 30) {
    errors.push('AC must be between 0 and 30')
  }

  if (typeof combatant.initiative !== 'number' || combatant.initiative < -10 || combatant.initiative > 50) {
    errors.push('Initiative must be between -10 and 50')
  }

  return errors
}

/**
 * Generate default abilities based on creature type and CR
 */
export const generateDefaultAbilities = (type?: string, cr?: string): AbilityScores => {
  const crValue = cr ? parseFloat(cr.replace('1/', '0.')) : 1
  const baseMod = Math.min(5, Math.max(0, Math.floor(crValue / 5)))

  if (type === 'dragon') {
    return {
      str: 23 + baseMod,
      dex: 10 + baseMod,
      con: 21 + baseMod,
      int: 14 + baseMod,
      wis: 13 + baseMod,
      cha: 17 + baseMod
    }
  } else if (type === 'undead') {
    return {
      str: 11 + baseMod,
      dex: 16 + baseMod,
      con: 16 + baseMod,
      int: 20 + baseMod,
      wis: 14 + baseMod,
      cha: 16 + baseMod
    }
  } else if (type === 'giant') {
    return {
      str: 18 + baseMod,
      dex: 13 + baseMod,
      con: 16 + baseMod,
      int: 7 + baseMod,
      wis: 9 + baseMod,
      cha: 7 + baseMod
    }
  } else {
    // Generic creature
    return {
      str: 10 + baseMod,
      dex: 12 + baseMod,
      con: 12 + baseMod,
      int: 8 + baseMod,
      wis: 11 + baseMod,
      cha: 8 + baseMod
    }
  }
}

/**
 * Generate unique ID for combatants
 */
export const generateCombatantId = (): string => {
  return `combatant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Calculate encounter difficulty based on party level and monster XP
 */
export const calculateEncounterDifficulty = (
  partyLevel: number,
  partySize: number,
  totalXP: number
): 'trivial' | 'easy' | 'medium' | 'hard' | 'deadly' | 'legendary' => {
  // XP thresholds per character level
  const thresholds = [
    [25, 50, 75, 100],    // Level 1
    [50, 100, 150, 200],  // Level 2
    [75, 150, 225, 400],  // Level 3
    [125, 250, 375, 500], // Level 4
    [250, 500, 750, 1100], // Level 5
    [300, 600, 900, 1400], // Level 6
    [350, 750, 1100, 1700], // Level 7
    [450, 900, 1400, 2100], // Level 8
    [550, 1100, 1600, 2400], // Level 9
    [600, 1200, 1900, 2800], // Level 10
    [800, 1600, 2400, 3600], // Level 11
    [1000, 2000, 3000, 4500], // Level 12
    [1100, 2200, 3400, 5100], // Level 13
    [1250, 2500, 3800, 5700], // Level 14
    [1400, 2800, 4300, 6400], // Level 15
    [1600, 3200, 4800, 7200], // Level 16
    [2000, 3900, 5900, 8800], // Level 17
    [2100, 4200, 6300, 9500], // Level 18
    [2400, 4900, 7300, 10900], // Level 19
    [2800, 5700, 8500, 12700], // Level 20
  ]

  const levelIndex = Math.max(0, Math.min(19, partyLevel - 1))
  const [easy, medium, hard, deadly] = thresholds[levelIndex]

  // Multiply by party size
  const adjustedEasy = easy * partySize
  const adjustedMedium = medium * partySize
  const adjustedHard = hard * partySize
  const adjustedDeadly = deadly * partySize

  if (totalXP < adjustedEasy * 0.5) return 'trivial'
  if (totalXP < adjustedEasy) return 'easy'
  if (totalXP < adjustedMedium) return 'medium'
  if (totalXP < adjustedHard) return 'hard'
  if (totalXP < adjustedDeadly) return 'deadly'
  return 'legendary'
}