import { Combatant, Condition } from '../types/combatant'

/**
 * Condition interactions and complex D&D mechanics
 */

export interface ConditionEffect {
  name: string
  effects: string[]
  savingThrow?: string
  duration?: string
  interactions?: string[]
}

export const CONDITION_EFFECTS: Record<string, ConditionEffect> = {
  'Blinded': {
    name: 'Blinded',
    effects: [
      'Can\'t see, automatically fails sight-based ability checks',
      'Attack rolls have disadvantage',
      'Attack rolls against creature have advantage'
    ],
    interactions: ['Invisible creatures gain no benefit from invisibility against blinded creatures']
  },
  'Charmed': {
    name: 'Charmed',
    effects: [
      'Can\'t attack the charmer or target them with harmful abilities/spells',
      'Charmer has advantage on social interaction checks'
    ],
    savingThrow: 'Wisdom',
    interactions: ['Cannot be charmed by multiple sources']
  },
  'Deafened': {
    name: 'Deafened',
    effects: [
      'Can\'t hear, automatically fails hearing-based ability checks'
    ]
  },
  'Frightened': {
    name: 'Frightened',
    effects: [
      'Disadvantage on ability checks and attack rolls while source is in sight',
      'Can\'t willingly move closer to source of fear'
    ],
    savingThrow: 'Wisdom',
    interactions: ['Fear effects don\'t stack - use highest DC']
  },
  'Grappled': {
    name: 'Grappled',
    effects: [
      'Speed becomes 0, can\'t benefit from speed bonuses',
      'Ends if grappler is incapacitated or moved away'
    ],
    interactions: ['Can still attack with disadvantage if restrained while grappled']
  },
  'Incapacitated': {
    name: 'Incapacitated',
    effects: [
      'Can\'t take actions or reactions'
    ],
    interactions: ['Breaks concentration', 'Ends grapples']
  },
  'Invisible': {
    name: 'Invisible',
    effects: [
      'Can\'t be seen without magical aid',
      'Attack rolls have advantage, attacks against have disadvantage',
      'Must hide to remain undetected'
    ],
    interactions: ['Attacking or casting reveals location but maintains invisibility']
  },
  'Paralyzed': {
    name: 'Paralyzed',
    effects: [
      'Incapacitated and can\'t move or speak',
      'Automatically fails Strength and Dexterity saves',
      'Attack rolls have advantage',
      'Hits within 5 feet are critical hits'
    ],
    savingThrow: 'Constitution',
    interactions: ['Overrides most other conditions', 'Breaks concentration']
  },
  'Petrified': {
    name: 'Petrified',
    effects: [
      'Incapacitated, can\'t move or speak, unaware of surroundings',
      'Attack rolls have advantage',
      'Automatically fails Strength and Dexterity saves',
      'Resistant to all damage',
      'Immune to poison and disease'
    ],
    interactions: ['Most powerful condition - overrides almost everything']
  },
  'Poisoned': {
    name: 'Poisoned',
    effects: [
      'Disadvantage on attack rolls and ability checks'
    ],
    savingThrow: 'Constitution',
    interactions: ['Multiple poison effects don\'t stack unless specified']
  },
  'Prone': {
    name: 'Prone',
    effects: [
      'Can only crawl or stand up (costs half movement)',
      'Disadvantage on attack rolls',
      'Attacks within 5 feet have advantage, ranged attacks have disadvantage'
    ],
    interactions: ['Standing up provokes opportunity attacks if grappled']
  },
  'Restrained': {
    name: 'Restrained',
    effects: [
      'Speed becomes 0, can\'t benefit from speed bonuses',
      'Attack rolls have disadvantage',
      'Attacks against have advantage',
      'Disadvantage on Dexterity saving throws'
    ],
    interactions: ['Often combined with grappled']
  },
  'Stunned': {
    name: 'Stunned',
    effects: [
      'Incapacitated, can\'t move, can speak falteringly',
      'Automatically fails Strength and Dexterity saves',
      'Attack rolls have advantage'
    ],
    interactions: ['Breaks concentration', 'Less severe than paralyzed']
  },
  'Unconscious': {
    name: 'Unconscious',
    effects: [
      'Incapacitated, can\'t move or speak, unaware of surroundings',
      'Drops what it\'s holding and falls prone',
      'Automatically fails Strength and Dexterity saves',
      'Attack rolls have advantage',
      'Hits within 5 feet are critical hits'
    ],
    interactions: ['Most severe condition - includes many other effects']
  }
}

/**
 * Check for complex condition interactions
 */
export function analyzeConditionInteractions(combatant: Combatant): string[] {
  const warnings: string[] = []
  const conditions = combatant.conditions.map(c => typeof c === 'object' ? c.name : c)

  // Check for condition combinations that create special rules
  if (conditions.includes('Grappled') && conditions.includes('Restrained')) {
    warnings.push('⚠️ Grappled + Restrained: Speed is 0, disadvantage on attacks and Dex saves')
  }

  if (conditions.includes('Prone') && conditions.includes('Grappled')) {
    warnings.push('⚠️ Prone + Grappled: Standing up costs movement but speed is 0 - cannot stand')
  }

  if (conditions.includes('Invisible') && conditions.includes('Blinded')) {
    warnings.push('💡 Invisible + Blinded: Invisibility provides no benefit (both have advantage/disadvantage)')
  }

  if (conditions.includes('Paralyzed') || conditions.includes('Unconscious')) {
    warnings.push('💀 **Critical**: Attacks within 5 feet are automatic critical hits!')
  }

  if (conditions.includes('Incapacitated') || conditions.includes('Paralyzed') || conditions.includes('Stunned') || conditions.includes('Unconscious')) {
    warnings.push('🧠 **Concentration Lost**: This condition breaks concentration on spells')
  }

  // Check for redundant conditions
  if (conditions.includes('Unconscious') && (conditions.includes('Prone') || conditions.includes('Incapacitated'))) {
    warnings.push('📝 Redundant: Unconscious already includes prone and incapacitated effects')
  }

  return warnings
}

// Opportunity attacks removed - not applicable without battle map positioning

/**
 * Generate condition interaction reminder
 */
export function generateConditionReminder(combatant: Combatant): string {
  if (!combatant.conditions || combatant.conditions.length === 0) return ''

  const interactions = analyzeConditionInteractions(combatant)

  let reminder = `🔄 **Condition Effects for ${combatant.name}:**\n`

  // List active conditions and their effects
  combatant.conditions.forEach(condition => {
    const conditionName = typeof condition === 'object' ? condition.name : condition
    const effect = CONDITION_EFFECTS[conditionName]

    if (effect) {
      reminder += `• **${conditionName}**: ${effect.effects[0]}\n`
      if (effect.savingThrow) {
        reminder += `  ↳ Save: ${effect.savingThrow} at end of turn\n`
      }
    } else {
      reminder += `• **${conditionName}**: Check rules for effects\n`
    }
  })

  // Add interaction warnings
  if (interactions.length > 0) {
    reminder += `\n**Special Interactions:**\n${interactions.join('\n')}`
  }

  return reminder
}

/**
 * Death saving throw reminders
 */
export function generateDeathSaveReminder(combatant: Combatant): string {
  if (combatant.hp > 0) return ''

  return `💀 **Death Saving Throws for ${combatant.name}**
• Roll 1d20 at start of turn
• 10+ = Success, 9 or lower = Failure
• 3 successes = stabilized at 0 HP
• 3 failures = dead
• Critical hit or damage = 2 failures
• Nat 20 = regain 1 HP and consciousness`
}

/**
 * Common spell save DCs by creature type
 */
export function getExpectedSpellSaveDC(combatant: Combatant): number {
  if (combatant.isPC) {
    const level = combatant.level || 1
    // Rough estimate: 8 + proficiency + ability modifier
    const proficiency = Math.ceil(level / 4) + 1
    return 8 + proficiency + 3 // Assume +3 ability modifier
  } else {
    // For monsters, estimate based on CR
    const cr = combatant.cr || '0'
    const crNumber = cr.includes('/') ? 0.5 : parseInt(cr)

    if (crNumber <= 2) return 12
    if (crNumber <= 5) return 13
    if (crNumber <= 10) return 15
    if (crNumber <= 15) return 16
    if (crNumber <= 20) return 18
    return 19
  }
}