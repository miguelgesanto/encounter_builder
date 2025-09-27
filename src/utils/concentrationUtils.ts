import { Combatant } from '../types/combatant'

/**
 * Calculate concentration save DC based on damage taken
 */
export function calculateConcentrationDC(damage: number): number {
  // DC = 10 or half the damage taken, whichever is higher
  return Math.max(10, Math.floor(damage / 2))
}

/**
 * Get constitution modifier for concentration saves
 */
export function getConstitutionModifier(combatant: Combatant): number {
  if (!combatant.abilities?.con) return 0
  return Math.floor((combatant.abilities.con - 10) / 2)
}

/**
 * Check if a creature should make a concentration save
 */
export function shouldMakeConcentrationSave(combatant: Combatant, damageTaken: number): boolean {
  return !!(combatant.concentratingOn && damageTaken > 0)
}

/**
 * Common concentration spells that DMs should track
 */
export const COMMON_CONCENTRATION_SPELLS = [
  // Cantrips and 1st level
  'Guidance', 'Resistance', 'Bless', 'Bane', 'Charm Person', 'Command', 'Faerie Fire', 'Fog Cloud', 'Grease', 'Hunter\'s Mark', 'Hex',

  // 2nd level
  'Blur', 'Darkness', 'Heat Metal', 'Hold Person', 'Invisibility', 'Levitate', 'Moonbeam', 'Spike Growth', 'Web',

  // 3rd level
  'Call Lightning', 'Conjure Animals', 'Counterspell', 'Fear', 'Fireball', 'Fly', 'Haste', 'Hypnotic Pattern', 'Slow', 'Spirit Guardians',

  // 4th level and higher
  'Banishment', 'Confusion', 'Greater Invisibility', 'Polymorph', 'Wall of Fire', 'Dominate Person', 'Hold Monster', 'Telekinesis'
]

/**
 * Get spell duration in rounds (approximate)
 */
export function getSpellDurationInRounds(duration: string): number | null {
  const durationLower = duration.toLowerCase()

  if (durationLower.includes('instantaneous')) return 0
  if (durationLower.includes('1 action') || durationLower.includes('1 bonus action')) return 0
  if (durationLower.includes('1 round')) return 1
  if (durationLower.includes('1 minute')) return 10
  if (durationLower.includes('10 minutes')) return 100
  if (durationLower.includes('1 hour')) return 600
  if (durationLower.includes('8 hours')) return 4800
  if (durationLower.includes('24 hours')) return 14400

  // Parse "up to X minutes/hours"
  const minuteMatch = durationLower.match(/up to (\d+) minutes?/)
  if (minuteMatch) return parseInt(minuteMatch[1]) * 10

  const hourMatch = durationLower.match(/up to (\d+) hours?/)
  if (hourMatch) return parseInt(hourMatch[1]) * 600

  return null // Unknown duration
}

/**
 * Check if concentration spell is about to expire
 */
export function isConcentrationNearExpiry(combatant: Combatant, currentRound: number): boolean {
  if (!combatant.concentratingOn) return false

  const duration = getSpellDurationInRounds(combatant.concentratingOn.duration)
  if (!duration) return false

  const roundsElapsed = currentRound - combatant.concentratingOn.startedRound
  const roundsRemaining = duration - roundsElapsed

  // Warn when 2 rounds or less remaining
  return roundsRemaining <= 2 && roundsRemaining > 0
}

/**
 * Generate concentration check reminder message
 */
export function generateConcentrationReminder(combatant: Combatant, damage: number): string {
  if (!combatant.concentratingOn) return ''

  const dc = calculateConcentrationDC(damage)
  const conMod = getConstitutionModifier(combatant)
  const bonus = conMod >= 0 ? `+${conMod}` : `${conMod}`

  return `🧠 **Concentration Check Required!**
${combatant.name} took ${damage} damage while concentrating on ${combatant.concentratingOn.spellName}
• DC: ${dc} (10 or half damage, whichever is higher)
• Roll: 1d20 ${bonus} (Constitution)
• Failure ends concentration on ${combatant.concentratingOn.spellName}`
}

/**
 * Generate spell duration reminder
 */
export function generateSpellDurationReminder(combatant: Combatant, currentRound: number): string {
  if (!combatant.concentratingOn) return ''

  const roundsElapsed = currentRound - combatant.concentratingOn.startedRound
  const duration = getSpellDurationInRounds(combatant.concentratingOn.duration)

  if (!duration) {
    return `✨ ${combatant.name} is concentrating on ${combatant.concentratingOn.spellName} (${combatant.concentratingOn.duration})`
  }

  const roundsRemaining = duration - roundsElapsed

  if (roundsRemaining <= 0) {
    return `⏰ **${combatant.concentratingOn.spellName} expires!** ${combatant.name}'s concentration spell ends this round.`
  }

  if (roundsRemaining <= 2) {
    return `⚠️ **${combatant.concentratingOn.spellName}** expires in ${roundsRemaining} round${roundsRemaining > 1 ? 's' : ''}`
  }

  return `✨ ${combatant.name} concentrating on ${combatant.concentratingOn.spellName} (${roundsRemaining} rounds left)`
}

/**
 * Common saving throw DCs for quick reference
 */
export const COMMON_SAVE_DCS = {
  easy: 10,
  medium: 13,
  hard: 15,
  veryHard: 18,
  nearlyImpossible: 20
}

/**
 * Generate saving throw reminder based on creature abilities
 */
export function generateSavingThrowReminder(combatant: Combatant, saveType: keyof typeof combatant.savingThrows, dc: number): string {
  const saves = combatant.savingThrows
  const modifier = saves?.[saveType] || 0
  const bonus = modifier >= 0 ? `+${modifier}` : `${modifier}`

  const difficulty = Object.entries(COMMON_SAVE_DCS).find(([_, value]) => value >= dc)?.[0] || 'extreme'

  return `🎲 **${saveType.toUpperCase()} Save**: DC ${dc} (${difficulty})
${combatant.name} rolls 1d20 ${bonus}
${modifier < 0 ? '⚠️ Low modifier - likely to fail' : modifier > 5 ? '✅ High modifier - likely to succeed' : ''}`
}