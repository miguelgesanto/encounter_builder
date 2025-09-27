import { Combatant } from '../types/combatant'

/**
 * Enhanced special ability parsing with priority-based detection
 */

export enum AbilityPriority {
  Critical = 5,     // Regeneration, Legendary Resistance, Death mechanics
  High = 4,         // Multiattack, Frightful Presence, Major save effects
  Medium = 3,       // Recharge abilities, Pack Tactics, Spellcasting
  Low = 2,          // Keen Senses, Minor resistances
  Informational = 1 // Flavor abilities, minor traits
}

export interface ParsedSpecialAbility {
  name: string
  description: string
  type: 'passive' | 'triggered' | 'active' | 'legendary'
  priority: AbilityPriority
  reminderText?: string
  conditions?: string[]
  mechanics?: {
    saveDC?: number
    saveType?: string
    damage?: string
    range?: string
    recharge?: string
    uses?: string
  }
}

interface DetectionRule {
  name: string
  priority: AbilityPriority
  matcher: (name: string, desc: string) => boolean
  parser: (name: string, desc: string) => Omit<ParsedSpecialAbility, 'name' | 'description'>
}

/**
 * Advanced regex patterns for extracting ability mechanics
 */
const ADVANCED_REGEX = {
  saveDC: /DC (\d+)\s*(Strength|Dexterity|Constitution|Intelligence|Wisdom|Charisma)?\s*saving throw/i,
  damage: /(\d+(?:\s*\(\s*\d+d\d+(?:\s*[+\-]\s*\d+)?\s*\))?\s*(\w+)\s*damage)/i,
  range: /(\d+)\s*(?:foot|feet|ft\.?)\s*(?:radius|cone|line|range)/i,
  recharge: /recharge\s*(\d+(?:-\d+)?)/i,
  uses: /(\d+)\/(?:day|turn|round|short rest|long rest)/i,
  area: /([\d\-]+)\s*(?:foot|feet|ft\.?)\s*(radius|cone|line|cube|sphere)/i,
  hitPoints: /(\d+)\s*hit\s*points?/i
}

/**
 * Helper functions for parsing specific ability types
 */
function extractRegenerationConditions(description: string): string[] {
  const conditions: string[] = []
  const damageTypes = ['acid', 'fire', 'cold', 'lightning', 'necrotic', 'radiant', 'thunder', 'force', 'psychic']

  for (const damageType of damageTypes) {
    if (description.toLowerCase().includes(damageType)) {
      conditions.push(damageType)
    }
  }

  return conditions
}

function extractAttackCount(description: string): string {
  const numberWords: Record<string, string> = {
    'one': '1', 'two': '2', 'three': '3', 'four': '4', 'five': '5',
    'six': '6', 'seven': '7', 'eight': '8', 'nine': '9', 'ten': '10'
  }

  const patterns = [
    /makes?\s+(one|two|three|four|five|six|seven|eight|nine|ten)\s+attacks?/i,
    /makes?\s+(\d+)\s+attacks?/i,
    /(one|two|three|four|five|six|seven|eight|nine|ten)\s+attacks?/i,
    /(\d+)\s+attacks?/i
  ]

  for (const pattern of patterns) {
    const match = description.match(pattern)
    if (match) {
      const count = match[1].toLowerCase()
      return numberWords[count] || count
    }
  }

  return 'multiple'
}

/**
 * Comprehensive detection rules for D&D abilities
 */
const DETECTION_RULES: DetectionRule[] = [
  // CRITICAL PRIORITY ABILITIES
  {
    name: 'Regeneration',
    priority: AbilityPriority.Critical,
    matcher: (name, desc) =>
      /regenerat(e|ion)/i.test(name) ||
      (/regains?\s+\d+\s+hit\s+points?/i.test(desc) && /start\s+of\s+(its|their)\s+turn/i.test(desc)),
    parser: (name, desc) => {
      const hpMatch = desc.match(ADVANCED_REGEX.hitPoints)
      const amount = hpMatch ? hpMatch[1] : '?'
      const conditions = extractRegenerationConditions(desc)
      return {
        type: 'triggered',
        priority: AbilityPriority.Critical,
        reminderText: `Regenerates ${amount} HP at start of turn`,
        conditions,
        mechanics: { damage: amount }
      }
    }
  },
  {
    name: 'Legendary Resistance',
    priority: AbilityPriority.Critical,
    matcher: (name, desc) =>
      /legendary\s+resistance/i.test(name) ||
      /choose\s+to\s+succeed\s+on\s+a\s+failed\s+saving\s+throw/i.test(desc),
    parser: (name, desc) => {
      const usesMatch = desc.match(ADVANCED_REGEX.uses)
      const uses = usesMatch ? usesMatch[1] : '3'
      return {
        type: 'triggered',
        priority: AbilityPriority.Critical,
        reminderText: `Can succeed on failed saves (${uses}/day)`,
        mechanics: { uses: `${uses}/day` }
      }
    }
  },

  // HIGH PRIORITY ABILITIES
  {
    name: 'Multiattack',
    priority: AbilityPriority.High,
    matcher: (name, desc) =>
      /multiattack/i.test(name) ||
      /makes?\s+(two|three|four|five|\d+)\s+attacks?/i.test(desc),
    parser: (name, desc) => {
      const attackCount = extractAttackCount(desc)
      return {
        type: 'active',
        priority: AbilityPriority.High,
        reminderText: `Makes ${attackCount} attacks in one action`,
        mechanics: { uses: attackCount }
      }
    }
  },
  {
    name: 'Frightful Presence',
    priority: AbilityPriority.High,
    matcher: (name, desc) =>
      /frightful\s+presence/i.test(name) ||
      (/each\s+creature\s+within/i.test(desc) && /wisdom\s+saving\s+throw/i.test(desc) && /frightened/i.test(desc)),
    parser: (name, desc) => {
      const dcMatch = desc.match(ADVANCED_REGEX.saveDC)
      const rangeMatch = desc.match(ADVANCED_REGEX.range)
      const dc = dcMatch ? dcMatch[1] : '?'
      const range = rangeMatch ? rangeMatch[1] : '?'
      return {
        type: 'active',
        priority: AbilityPriority.High,
        reminderText: `Fear aura: DC ${dc} Wisdom save within ${range} feet`,
        mechanics: { saveDC: parseInt(dc), saveType: 'Wisdom', range: `${range} feet` }
      }
    }
  },
  {
    name: 'Death Effects',
    priority: AbilityPriority.High,
    matcher: (name, desc) =>
      /dies\s+only\s+if/i.test(desc) ||
      /when\s+reduced\s+to\s+0\s+hit\s+points/i.test(desc) ||
      /death\s+throes/i.test(name),
    parser: (name, desc) => ({
      type: 'triggered',
      priority: AbilityPriority.High,
      reminderText: 'Special death rules - check description carefully'
    })
  },

  // MEDIUM PRIORITY ABILITIES
  {
    name: 'Magic Resistance',
    priority: AbilityPriority.Medium,
    matcher: (name, desc) =>
      /magic\s+resistance/i.test(name) ||
      /advantage\s+on\s+saving\s+throws\s+against\s+spells/i.test(desc),
    parser: () => ({
      type: 'passive',
      priority: AbilityPriority.Medium,
      reminderText: 'Advantage on saves against spells and magical effects'
    })
  },
  {
    name: 'Pack Tactics',
    priority: AbilityPriority.Medium,
    matcher: (name, desc) =>
      /pack\s+tactics/i.test(name) ||
      (/advantage\s+on\s+attack\s+rolls/i.test(desc) && /ally.*within\s+5\s+feet/i.test(desc)),
    parser: () => ({
      type: 'passive',
      priority: AbilityPriority.Medium,
      reminderText: 'Advantage on attacks when ally within 5 feet of target'
    })
  },
  {
    name: 'Spellcasting',
    priority: AbilityPriority.Medium,
    matcher: (name, desc) =>
      /spellcasting/i.test(name) ||
      /spellcaster/i.test(desc) ||
      /spell\s+save\s+DC/i.test(desc),
    parser: (name, desc) => {
      const dcMatch = desc.match(ADVANCED_REGEX.saveDC)
      const dc = dcMatch ? dcMatch[1] : '?'
      return {
        type: 'active',
        priority: AbilityPriority.Medium,
        reminderText: `Spellcaster - DC ${dc}, check spell list`,
        mechanics: { saveDC: parseInt(dc) }
      }
    }
  },
  {
    name: 'Recharge Abilities',
    priority: AbilityPriority.Medium,
    matcher: (name, desc) => ADVANCED_REGEX.recharge.test(desc),
    parser: (name, desc) => {
      const rechargeMatch = desc.match(ADVANCED_REGEX.recharge)
      const recharge = rechargeMatch ? rechargeMatch[1] : '?'
      return {
        type: 'active',
        priority: AbilityPriority.Medium,
        reminderText: `Recharge ${recharge} ability`,
        mechanics: { recharge }
      }
    }
  },

  // LOW PRIORITY ABILITIES
  {
    name: 'Keen Senses',
    priority: AbilityPriority.Low,
    matcher: (name, desc) =>
      /keen\s+(sight|smell|hearing)/i.test(name) ||
      (/advantage\s+on.*perception/i.test(desc) && /rely\s+on/i.test(desc)),
    parser: (name, desc) => {
      const senseType = name.match(/keen\s+(\w+)/i)?.[1] || 'senses'
      return {
        type: 'passive',
        priority: AbilityPriority.Low,
        reminderText: `Advantage on Perception (${senseType})`
      }
    }
  },
  {
    name: 'Damage Immunities',
    priority: AbilityPriority.Low,
    matcher: (name, desc) =>
      /damage\s+immunities?/i.test(name) ||
      /immune\s+to.*damage/i.test(desc),
    parser: (name, desc) => ({
      type: 'passive',
      priority: AbilityPriority.Low,
      reminderText: 'Check damage immunities before applying damage'
    })
  }
]

/**
 * Parse all special abilities from a creature with priority-based detection
 */
export function parseAllSpecialAbilities(combatant: Combatant): ParsedSpecialAbility[] {
  console.log(`🔍 Parsing abilities for ${combatant.name}`)

  const abilities: ParsedSpecialAbility[] = []

  // Collect all ability sources
  const allAbilitySources = [
    ...(combatant.specialAbilities || []).map(a => ({ ...a, source: 'special' })),
    ...(combatant.actions || []).map(a => ({ ...a, source: 'action' })),
    ...(combatant.legendaryActions || []).map(a => ({ ...a, source: 'legendary' }))
  ]

  console.log(`📋 Found ${allAbilitySources.length} total abilities:`, allAbilitySources.map(a => a.name))

  // Apply detection rules to all abilities
  allAbilitySources.forEach(ability => {
    console.log(`🔍 Checking ability: "${ability.name}" - ${ability.description?.substring(0, 50)}...`)
    const detectedAbility = detectAbilityWithRules(ability.name, ability.description, ability.source)
    if (detectedAbility) {
      console.log(`✅ Detected: ${detectedAbility.name} (Priority: ${detectedAbility.priority})`)
      abilities.push(detectedAbility)
    } else {
      console.log(`❌ No match for: ${ability.name}`)
    }
  })

  // Sort by priority (highest first) and limit to top 5 most critical
  const prioritizedAbilities = abilities
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 5)

  console.log(`🎯 Final abilities for ${combatant.name}:`, prioritizedAbilities.map(a => `${a.name} (${a.priority})`))
  console.log(`📄 Detailed abilities:`, prioritizedAbilities.map(a => ({ name: a.name, priority: a.priority, reminderText: a.reminderText })))

  return prioritizedAbilities
}

/**
 * Apply detection rules to identify and parse abilities
 */
function detectAbilityWithRules(name: string, description: string, source: string): ParsedSpecialAbility | null {
  // Try each detection rule
  for (const rule of DETECTION_RULES) {
    if (rule.matcher(name, description)) {
      console.log(`🎯 Matched rule: ${rule.name} for ability: ${name}`)
      const parsed = rule.parser(name, description)
      return {
        name,
        description,
        ...parsed
      }
    }
  }

  console.log(`🔍 No rule matched for "${name}", trying fallback...`)
  // Fallback for unmatched abilities
  return createFallbackAbility(name, description, source)
}

/**
 * Create fallback ability for unmatched cases
 */
function createFallbackAbility(name: string, description: string, source: string): ParsedSpecialAbility | null {
  const nameLower = name.toLowerCase()
  const descLower = description.toLowerCase()

  // Skip very common/generic abilities that don't need reminders
  const skipPatterns = [
    /^bite$/i, /^claw$/i, /^slam$/i, /^fist$/i, // Basic attacks
    /^darkvision$/i, /^blindsight$/i, // Basic senses (already in stat block)
    /amphibious/i, /hold breath/i // Minor utility abilities
  ]

  if (skipPatterns.some(pattern => pattern.test(name))) {
    return null
  }

  // Determine priority based on content analysis
  let priority = AbilityPriority.Informational

  if (descLower.includes('saving throw') || descLower.includes('save')) {
    priority = AbilityPriority.Medium
  }
  if (descLower.includes('damage') && (descLower.includes('extra') || descLower.includes('additional'))) {
    priority = AbilityPriority.Medium
  }
  if (descLower.includes('advantage') || descLower.includes('disadvantage')) {
    priority = AbilityPriority.Low
  }

  // Only include if it has some tactical relevance
  if (priority === AbilityPriority.Informational) {
    return null
  }

  return {
    name,
    description,
    type: source === 'legendary' ? 'legendary' : 'passive',
    priority,
    reminderText: `${name} - check description for effects`
  }
}

/**
 * Generate concise ability reminders like static reminders
 */
export function generateSpecialAbilityReminders(combatant: Combatant): string[] {
  const abilities = parseAllSpecialAbilities(combatant)
  const reminders: string[] = []

  if (abilities.length === 0) {
    return reminders
  }

  // Sort by priority and take top 4-5 most important
  const sortedAbilities = abilities
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 5)

  // Generate individual short lines for each ability
  sortedAbilities.forEach(ability => {
    const shortReminder = generateShortReminder(ability.name, ability.description, ability.priority)
    if (shortReminder) {
      reminders.push(shortReminder)
    }
  })

  return reminders
}

/**
 * Generate contextual ability reminders based on initiative and turn state
 */
export function generateContextualAbilityReminders(
  combatant: Combatant,
  allCombatants: Combatant[],
  isCreatureTurn: boolean,
  isTopOfRound: boolean
): string[] {
  const abilities = parseAllSpecialAbilities(combatant)
  const reminders: string[] = []

  if (abilities.length === 0) {
    return reminders
  }

  // Lair Actions (Top of Round) - HIGHEST PRIORITY
  if (isTopOfRound) {
    const lairAbilities = abilities.filter(a =>
      a.name.toLowerCase().includes('lair') ||
      a.description.toLowerCase().includes('lair')
    )
    if (lairAbilities.length > 0) {
      reminders.push('Lair Actions: Environmental effects')
    }

    // If it's also this creature's turn, continue to add their other abilities
    if (!isCreatureTurn) {
      return reminders // Return ONLY lair actions if it's not the creature's turn
    }
  }

  // Creature's own turn - show start of turn abilities
  if (isCreatureTurn) {
    // Regeneration first
    const regenAbilities = abilities.filter(a =>
      a.name.toLowerCase().includes('regenerat')
    )
    regenAbilities.forEach(ability => {
      const shortReminder = generateShortReminder(ability.name, ability.description, ability.priority)
      if (shortReminder) {
        reminders.push(shortReminder)
      }
    })

    // Other combat abilities
    const combatAbilities = abilities.filter(a =>
      !a.name.toLowerCase().includes('regenerat') &&
      !a.name.toLowerCase().includes('legendary') &&
      !a.name.toLowerCase().includes('lair')
    ).slice(0, 3) // Limit to prevent clutter

    combatAbilities.forEach(ability => {
      const shortReminder = generateShortReminder(ability.name, ability.description, ability.priority)
      if (shortReminder) {
        reminders.push(shortReminder)
      }
    })
  }

  // Not creature's turn but creature has legendary actions - show them
  if (!isCreatureTurn && !isTopOfRound) {
    const hasLegendaryActions = abilities.some(a =>
      a.name.toLowerCase().includes('legendary action')
    ) || combatant.legendaryActions?.length > 0

    if (hasLegendaryActions) {
      reminders.push('Legendary Actions: 3 remaining')
    }
  }

  return reminders
}

/**
 * Generate short, actionable reminders like the static system
 */
function generateShortReminder(name: string, description: string, priority: AbilityPriority): string | null {
  const nameLower = name.toLowerCase()
  const descLower = description.toLowerCase()

  // Regeneration
  if (nameLower.includes('regenerat')) {
    const hpMatch = description.match(/(\d+)\s+hit\s+points?/i)
    const amount = hpMatch ? hpMatch[1] : '?'
    return `Regeneration: ${amount} HP at start of turn`
  }

  // Multiattack
  if (nameLower.includes('multiattack')) {
    const attackMatch = description.match(/makes?\s+(two|three|four|five|six|\d+)\s+attacks?/i)
    const count = attackMatch ? attackMatch[1] : 'multiple'
    return `Multiattack: ${count} attacks`
  }

  // Legendary Actions
  if (nameLower.includes('legendary action')) {
    return `Legendary Actions: 3/turn (end of other turns)`
  }

  // Legendary Resistance
  if (nameLower.includes('legendary resistance')) {
    return `Legendary Resistance: 3/day (auto-succeed saves)`
  }

  // Breath Weapon
  if (nameLower.includes('breath')) {
    return `Breath Weapon: Recharge 5-6`
  }

  // Frightful Presence
  if (nameLower.includes('frightful presence')) {
    const dcMatch = description.match(/DC\s*(\d+)/i)
    const dc = dcMatch ? dcMatch[1] : '?'
    return `Frightful Presence: DC ${dc} Wisdom save`
  }

  // Spellcasting
  if (nameLower.includes('spellcasting')) {
    const dcMatch = description.match(/spell\s+save\s+DC\s*(\d+)/i)
    const dc = dcMatch ? dcMatch[1] : '?'
    return `Spellcaster: DC ${dc}`
  }

  // Magic Resistance
  if (nameLower.includes('magic resistance')) {
    return `Magic Resistance: Advantage on spell saves`
  }

  // Pack Tactics
  if (nameLower.includes('pack tactics')) {
    return `Pack Tactics: Advantage with ally nearby`
  }

  // Keen Senses
  if (nameLower.includes('keen')) {
    return `Keen Senses: Advantage on Perception`
  }

  // Generic recharge abilities
  const rechargeMatch = description.match(/recharge\s*(\d+(?:-\d+)?)/i)
  if (rechargeMatch) {
    return `${name}: Recharge ${rechargeMatch[1]}`
  }

  // Skip if not important enough
  return null
}

/**
 * Get detailed ability breakdown for debugging/inspection
 */
export function getDetailedAbilityBreakdown(combatant: Combatant): string {
  const abilities = parseAllSpecialAbilities(combatant)

  if (abilities.length === 0) {
    return 'No significant special abilities detected.'
  }

  const breakdown = abilities.map(ability =>
    `• **${ability.name}** (Priority: ${ability.priority}): ${ability.reminderText}`
  ).join('\n')

  return `**Detected Abilities:**\n${breakdown}`
}