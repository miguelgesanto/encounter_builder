import { Combatant } from '../types/combatant'

/**
 * Utility functions to parse creature abilities and detect recharge patterns
 */

interface RechargePattern {
  name: string
  rechargeOn: string
  description?: string
}

/**
 * Parse action descriptions to find recharge abilities
 */
export function parseRechargeAbilities(actions: Array<{ name: string; description: string }>): RechargePattern[] {
  const rechargeAbilities: RechargePattern[] = []

  actions.forEach(action => {
    const description = action.description.toLowerCase()
    const name = action.name.toLowerCase()

    // Look for explicit recharge patterns in descriptions
    // Common patterns: "recharge 5-6", "recharge 4-6", "recharge 6"
    const rechargeMatch = description.match(/recharge (\d+(?:-\d+)?)/i)

    if (rechargeMatch) {
      rechargeAbilities.push({
        name: action.name,
        rechargeOn: rechargeMatch[1],
        description: action.description
      })
      return // Don't check other patterns if we found an explicit recharge
    }

    // Special cases for common abilities that typically have recharge
    const specialCases = [
      // Breath weapons (most common recharge ability)
      {
        patterns: ['breath'],
        rechargeOn: '5-6',
        condition: (desc: string, name: string) =>
          desc.includes('breath') && (desc.includes('weapon') || desc.includes('attack') || desc.includes('cone') || desc.includes('line'))
      },
      // Lightning breath variants
      {
        patterns: ['lightning breath', 'thunder breath', 'storm breath'],
        rechargeOn: '5-6',
        condition: (desc: string, name: string) =>
          (desc.includes('lightning') || desc.includes('thunder') || desc.includes('storm')) && desc.includes('breath')
      },
      // Fire breath variants
      {
        patterns: ['fire breath', 'flame breath', 'inferno'],
        rechargeOn: '5-6',
        condition: (desc: string, name: string) =>
          (desc.includes('fire') || desc.includes('flame') || desc.includes('inferno')) && desc.includes('breath')
      },
      // Cold/ice breath variants
      {
        patterns: ['cold breath', 'ice breath', 'frost breath', 'freezing breath'],
        rechargeOn: '5-6',
        condition: (desc: string, name: string) =>
          (desc.includes('cold') || desc.includes('ice') || desc.includes('frost') || desc.includes('freezing')) && desc.includes('breath')
      },
      // Acid breath variants
      {
        patterns: ['acid breath', 'poison breath'],
        rechargeOn: '5-6',
        condition: (desc: string, name: string) =>
          (desc.includes('acid') || desc.includes('poison')) && desc.includes('breath')
      },
      // Other common recharge abilities
      {
        patterns: ['web', 'entangle'],
        rechargeOn: '5-6',
        condition: (desc: string, name: string) =>
          (name.includes('web') || desc.includes('web') || desc.includes('entangle')) &&
          (desc.includes('ranged') || desc.includes('attack') || desc.includes('restrain'))
      },
      // Eye ray attacks (beholders, etc.)
      {
        patterns: ['eye ray', 'eye beam'],
        rechargeOn: '5-6',
        condition: (desc: string, name: string) =>
          (desc.includes('eye') || name.includes('eye')) && (desc.includes('ray') || desc.includes('beam'))
      },
      // Troll regeneration
      {
        patterns: ['regeneration'],
        rechargeOn: '4-6',
        condition: (desc: string, name: string) =>
          name.includes('regeneration') || (desc.includes('regenerat') && desc.includes('hit point'))
      }
    ]

    // Check special cases
    for (const specialCase of specialCases) {
      if (specialCase.condition(description, name)) {
        // Check if we already added this ability (avoid duplicates)
        if (!rechargeAbilities.find(ability => ability.name === action.name)) {
          rechargeAbilities.push({
            name: action.name,
            rechargeOn: specialCase.rechargeOn,
            description: action.description
          })
        }
        break // Only match the first applicable special case
      }
    }
  })

  return rechargeAbilities
}

/**
 * Check if a recharge roll succeeds
 */
export function rollRecharge(rechargeOn: string): boolean {
  const roll = Math.floor(Math.random() * 6) + 1

  if (rechargeOn.includes('-')) {
    // Range like "5-6"
    const [min, max] = rechargeOn.split('-').map(n => parseInt(n))
    return roll >= min && roll <= max
  } else {
    // Single number like "6"
    return roll >= parseInt(rechargeOn)
  }
}

/**
 * Initialize recharge abilities for a creature based on their actions
 */
export function initializeRechargeAbilities(combatant: Combatant): Combatant {
  let updatedCombatant = combatant

  // Initialize recharge abilities
  if (combatant.actions && combatant.actions.length > 0) {
    const rechargePatterns = parseRechargeAbilities(combatant.actions)

    if (rechargePatterns.length > 0) {
      const rechargeAbilities = rechargePatterns.map(pattern => ({
        name: pattern.name,
        rechargeOn: pattern.rechargeOn,
        isAvailable: true, // Start available
        description: pattern.description
      }))

      updatedCombatant = {
        ...updatedCombatant,
        rechargeAbilities
      }
    }
  }

  // Initialize regeneration ability
  updatedCombatant = initializeRegenerationAbility(updatedCombatant)

  return updatedCombatant
}

/**
 * Process recharge rolls for a creature at start of their turn
 */
export function processRechargeRolls(combatant: Combatant): { combatant: Combatant; messages: string[] } {
  if (!combatant.rechargeAbilities || combatant.rechargeAbilities.length === 0) {
    return { combatant, messages: [] }
  }

  const messages: string[] = []
  const updatedAbilities = combatant.rechargeAbilities.map(ability => {
    if (ability.isAvailable) {
      return ability // Already available, no need to roll
    }

    const recharged = rollRecharge(ability.rechargeOn)
    messages.push(`🎲 ${combatant.name} ${ability.name} recharge (${ability.rechargeOn}): ${recharged ? 'RECHARGED!' : 'not ready'}`)

    return {
      ...ability,
      isAvailable: recharged
    }
  })

  return {
    combatant: {
      ...combatant,
      rechargeAbilities: updatedAbilities
    },
    messages
  }
}

/**
 * Use a recharge ability (mark as unavailable)
 */
export function useRechargeAbility(combatant: Combatant, abilityName: string): Combatant {
  if (!combatant.rechargeAbilities) {
    return combatant
  }

  const updatedAbilities = combatant.rechargeAbilities.map(ability =>
    ability.name === abilityName
      ? { ...ability, isAvailable: false }
      : ability
  )

  return {
    ...combatant,
    rechargeAbilities: updatedAbilities
  }
}

/**
 * Get available recharge abilities for a creature
 */
export function getAvailableRechargeAbilities(combatant: Combatant): string[] {
  if (!combatant.rechargeAbilities) {
    return []
  }

  return combatant.rechargeAbilities
    .filter(ability => ability.isAvailable)
    .map(ability => ability.name)
}

/**
 * Get recharging abilities for a creature
 */
export function getRechargingAbilities(combatant: Combatant): string[] {
  if (!combatant.rechargeAbilities) {
    return []
  }

  return combatant.rechargeAbilities
    .filter(ability => !ability.isAvailable)
    .map(ability => `${ability.name} (${ability.rechargeOn})`)
}

/**
 * Parse regeneration abilities from creature actions/special abilities
 */
export function parseRegenerationAbility(combatant: Combatant): { amount: number; damageTypes: string[]; description: string } | null {
  const allAbilities = [
    ...(combatant.specialAbilities || []),
    ...(combatant.actions || [])
  ]

  for (const ability of allAbilities) {
    const description = ability.description.toLowerCase()
    const name = ability.name.toLowerCase()

    // Look for regeneration patterns
    if (name.includes('regeneration') || description.includes('regenerat')) {
      // Try to parse regeneration amount
      const amountMatch = description.match(/regains? (\d+) hit points?/i) ||
                         description.match(/(\d+) hit points? at the start/i)

      if (amountMatch) {
        const amount = parseInt(amountMatch[1])

        // Look for damage types that stop regeneration
        const damageTypes: string[] = []
        const damageTypePatterns = [
          /takes? (fire|acid|necrotic|radiant|cold|lightning|thunder|force|psychic) damage/gi,
          /(fire|acid|necrotic|radiant|cold|lightning|thunder|force|psychic) damage/gi
        ]

        for (const pattern of damageTypePatterns) {
          const matches = description.match(pattern)
          if (matches) {
            matches.forEach(match => {
              const damageType = match.toLowerCase().replace(/takes?|damage/g, '').trim()
              if (damageType && !damageTypes.includes(damageType)) {
                damageTypes.push(damageType)
              }
            })
          }
        }

        return {
          amount,
          damageTypes,
          description: ability.description
        }
      }
    }
  }

  return null
}

/**
 * Initialize regeneration ability for a creature
 */
export function initializeRegenerationAbility(combatant: Combatant): Combatant {
  if (combatant.regeneration) {
    return combatant // Already has regeneration
  }

  const regenData = parseRegenerationAbility(combatant)
  if (!regenData) {
    return combatant // No regeneration found
  }

  return {
    ...combatant,
    regeneration: {
      amount: regenData.amount,
      damageTypes: regenData.damageTypes,
      isActive: true,
      description: regenData.description
    }
  }
}

/**
 * Process regeneration at the start of a creature's turn
 */
export function processRegeneration(combatant: Combatant): { combatant: Combatant; message: string } {
  if (!combatant.regeneration || !combatant.regeneration.isActive) {
    return { combatant, message: '' }
  }

  // Don't regenerate if at max HP or dead
  if (combatant.hp >= combatant.maxHp || combatant.hp <= 0) {
    return { combatant, message: '' }
  }

  const oldHp = combatant.hp
  const newHp = Math.min(combatant.maxHp, combatant.hp + combatant.regeneration.amount)
  const healed = newHp - oldHp

  const message = `🌿 ${combatant.name} regenerates ${healed} HP (${oldHp} → ${newHp})`

  return {
    combatant: { ...combatant, hp: newHp },
    message
  }
}

/**
 * Check if regeneration should be disabled due to damage type
 */
export function checkRegenerationDisabled(combatant: Combatant, damageType: string): boolean {
  if (!combatant.regeneration || !combatant.regeneration.damageTypes) {
    return false
  }

  return combatant.regeneration.damageTypes.includes(damageType.toLowerCase())
}

/**
 * Generate regeneration reminder
 */
export function generateRegenerationReminder(combatant: Combatant): string {
  if (!combatant.regeneration) {
    return ''
  }

  const regenAmount = combatant.regeneration.amount
  const preventingTypes = combatant.regeneration.damageTypes?.join(' or ') || 'certain damage'

  if (!combatant.regeneration.isActive) {
    return `🚫 **${combatant.name} regeneration disabled** - took ${preventingTypes} damage last turn
💡 Regeneration will resume next turn if no ${preventingTypes} damage is taken`
  }

  if (combatant.hp <= 0) {
    // Special Troll death rules
    if (combatant.name.toLowerCase().includes('troll')) {
      return `💀 **${combatant.name} at 0 HP** - REMINDER: Trolls die only if they start their turn with 0 HP AND don't regenerate
🌿 **ACTION NEEDED**: Roll to see if ${combatant.name} regenerates ${regenAmount} HP and revives
⚠️ Blocked by: ${preventingTypes} damage this turn`
    }
    return `💀 **${combatant.name} regeneration cannot work** - creature is at 0 HP or dead`
  }

  if (combatant.hp >= combatant.maxHp) {
    return `✅ **${combatant.name} at full HP** - regeneration not needed this turn`
  }

  const wouldHeal = Math.min(regenAmount, combatant.maxHp - combatant.hp)

  return `🌿 **REGENERATION REMINDER**: ${combatant.name} should regain ${wouldHeal} HP
📝 **ACTION**: Manually increase HP from ${combatant.hp} to ${combatant.hp + wouldHeal}
⚠️ **BLOCKED BY**: ${preventingTypes} damage taken since last turn`
}