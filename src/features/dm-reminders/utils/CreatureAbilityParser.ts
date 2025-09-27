import { Combatant, Action, SpecialAbility } from '../../combat-tracker/types/combat.types'

export interface ParsedCreatureAbilities {
  lairActions: ParsedLairAction[]
  legendaryActions: ParsedLegendaryAction[]
  turnStartAbilities: ParsedTurnAbility[]
  combatAbilities: ParsedCombatAbility[]
  deathTriggers: ParsedDeathTrigger[]
  rechargeAbilities: ParsedRechargeAbility[]
  regenerationAbilities: ParsedRegenerationAbility[]
}

export interface ParsedLairAction {
  name: string
  description: string
  initiative: number // Always 20 for lair actions
  areaEffect: boolean
  damageType?: string
  saveRequired?: string
  environmentalEffect: string
}

export interface ParsedLegendaryAction {
  name: string
  description: string
  cost: number // 1, 2, or 3 legendary actions
  actionType: 'attack' | 'move' | 'spell' | 'ability'
  usageCondition?: string
}

export interface ParsedTurnAbility {
  name: string
  description: string
  trigger: 'turn_start' | 'turn_end'
  automatic: boolean
  healing?: number
  damageType?: string
}

export interface ParsedCombatAbility {
  name: string
  description: string
  actionType: 'action' | 'bonus_action' | 'reaction'
  damage?: string
  saveRequired?: string
  range?: string
  area?: string
}

export interface ParsedDeathTrigger {
  name: string
  description: string
  trigger: 'on_death' | 'reduced_to_zero'
  area?: string
  damage?: string
  effect: string
}

export interface ParsedRechargeAbility {
  name: string
  description: string
  rechargeOn: string // e.g., "5-6", "6"
  isAvailable: boolean
  lastUsedRound?: number
}

export interface ParsedRegenerationAbility {
  name: string
  healingAmount: number
  condition?: string // e.g., "unless fire or acid damage"
  triggersOnTurnStart: boolean
}

export class CreatureAbilityParser {

  /**
   * Parse all abilities from a creature's stat block
   */
  static parseCreatureAbilities(creature: Combatant): ParsedCreatureAbilities {
    return {
      lairActions: this.parseLairActions(creature),
      legendaryActions: this.parseLegendaryActions(creature),
      turnStartAbilities: this.parseTurnStartAbilities(creature),
      combatAbilities: this.parseCombatAbilities(creature),
      deathTriggers: this.parseDeathTriggers(creature),
      rechargeAbilities: this.parseRechargeAbilities(creature),
      regenerationAbilities: this.parseRegenerationAbilities(creature)
    }
  }

  /**
   * Parse lair actions (always initiative 20)
   */
  static parseLairActions(creature: Combatant): ParsedLairAction[] {
    if (!creature.lairActions) return []

    return creature.lairActions.map(action => {
      const description = action.description.toLowerCase()

      // Detect area effects
      const areaEffect = description.includes('area') ||
                        description.includes('radius') ||
                        description.includes('line') ||
                        description.includes('cone') ||
                        description.includes('all creatures')

      // Detect damage types
      let damageType: string | undefined
      const damageTypes = ['fire', 'cold', 'lightning', 'thunder', 'acid', 'poison', 'psychic', 'necrotic', 'radiant']
      damageType = damageTypes.find(type => description.includes(type))

      // Detect saves
      let saveRequired: string | undefined
      const saves = ['dexterity', 'constitution', 'wisdom', 'strength', 'intelligence', 'charisma']
      saveRequired = saves.find(save => description.includes(save))

      // Extract environmental effect description
      const environmentalEffect = this.extractEnvironmentalEffect(action.description)

      return {
        name: action.name,
        description: action.description,
        initiative: 20, // D&D rule: lair actions always on initiative 20
        areaEffect,
        damageType,
        saveRequired,
        environmentalEffect
      }
    })
  }

  /**
   * Parse legendary actions with costs
   */
  static parseLegendaryActions(creature: Combatant): ParsedLegendaryAction[] {
    if (!creature.legendaryActions) return []

    return creature.legendaryActions.map(action => {
      const description = action.description.toLowerCase()

      // Determine action type
      let actionType: 'attack' | 'move' | 'spell' | 'ability' = 'ability'
      if (description.includes('attack') || description.includes('bite') || description.includes('claw')) {
        actionType = 'attack'
      } else if (description.includes('move') || description.includes('fly') || description.includes('swim')) {
        actionType = 'move'
      } else if (description.includes('spell') || description.includes('cast')) {
        actionType = 'spell'
      }

      // Extract cost (defaults to 1 if not specified)
      const cost = action.cost || 1

      return {
        name: action.name,
        description: action.description,
        cost,
        actionType,
        usageCondition: this.extractUsageCondition(action.description)
      }
    })
  }

  /**
   * Parse abilities that trigger at turn start/end
   */
  static parseTurnStartAbilities(creature: Combatant): ParsedTurnAbility[] {
    if (!creature.specialAbilities) return []

    const turnAbilities: ParsedTurnAbility[] = []

    creature.specialAbilities.forEach(ability => {
      const description = ability.description.toLowerCase()

      // Check for turn start triggers
      if (description.includes('start of') || description.includes('beginning of')) {
        const healing = this.extractHealingAmount(ability.description)
        const damageType = this.extractDamageType(ability.description)

        turnAbilities.push({
          name: ability.name,
          description: ability.description,
          trigger: 'turn_start',
          automatic: true,
          healing,
          damageType
        })
      }

      // Check for turn end triggers
      if (description.includes('end of') || description.includes('end of turn')) {
        turnAbilities.push({
          name: ability.name,
          description: ability.description,
          trigger: 'turn_end',
          automatic: true
        })
      }
    })

    return turnAbilities
  }

  /**
   * Parse combat actions (attacks, spells, abilities)
   */
  static parseCombatAbilities(creature: Combatant): ParsedCombatAbility[] {
    if (!creature.actions) return []

    return creature.actions
      .filter(action => action.actionType === 'action')
      .map(action => {
        const description = action.description.toLowerCase()

        // Extract damage
        const damage = this.extractDamage(action.description)

        // Extract save requirement
        const saveRequired = this.extractSaveRequirement(action.description)

        // Extract range
        const range = this.extractRange(action.description)

        // Extract area
        const area = this.extractArea(action.description)

        return {
          name: action.name,
          description: action.description,
          actionType: action.actionType as 'action' | 'bonus_action' | 'reaction',
          damage,
          saveRequired,
          range,
          area
        }
      })
  }

  /**
   * Parse death-triggered abilities
   */
  static parseDeathTriggers(creature: Combatant): ParsedDeathTrigger[] {
    if (!creature.specialAbilities) return []

    return creature.specialAbilities
      .filter(ability => {
        const description = ability.description.toLowerCase()
        return description.includes('die') ||
               description.includes('death') ||
               description.includes('reduced to 0') ||
               description.includes('drops to 0')
      })
      .map(ability => {
        const description = ability.description.toLowerCase()

        const trigger: 'on_death' | 'reduced_to_zero' =
          description.includes('reduced to 0') || description.includes('drops to 0')
            ? 'reduced_to_zero'
            : 'on_death'

        const area = this.extractArea(ability.description)
        const damage = this.extractDamage(ability.description)

        return {
          name: ability.name,
          description: ability.description,
          trigger,
          area,
          damage,
          effect: this.extractEffectDescription(ability.description)
        }
      })
  }

  /**
   * Parse recharge abilities (breath weapons, etc.)
   */
  static parseRechargeAbilities(creature: Combatant): ParsedRechargeAbility[] {
    const rechargeAbilities: ParsedRechargeAbility[] = []

    // Check actions for recharge
    creature.actions?.forEach(action => {
      if (action.description.toLowerCase().includes('recharge')) {
        const rechargeOn = this.extractRechargeValue(action.description)
        rechargeAbilities.push({
          name: action.name,
          description: action.description,
          rechargeOn,
          isAvailable: true // Start as available
        })
      }
    })

    // Check special abilities for recharge
    creature.specialAbilities?.forEach(ability => {
      if (ability.recharge) {
        rechargeAbilities.push({
          name: ability.name,
          description: ability.description,
          rechargeOn: ability.recharge,
          isAvailable: true
        })
      }
    })

    return rechargeAbilities
  }

  /**
   * Parse regeneration abilities
   */
  static parseRegenerationAbilities(creature: Combatant): ParsedRegenerationAbility[] {
    if (!creature.specialAbilities) return []

    return creature.specialAbilities
      .filter(ability => {
        const description = ability.description.toLowerCase()
        return description.includes('regenerat') || description.includes('regains')
      })
      .map(ability => {
        const healingAmount = this.extractHealingAmount(ability.description) || 0
        const condition = this.extractRegenerationCondition(ability.description)

        return {
          name: ability.name,
          healingAmount,
          condition,
          triggersOnTurnStart: ability.description.toLowerCase().includes('start of')
        }
      })
  }

  // Helper methods for parsing specific data

  private static extractEnvironmentalEffect(description: string): string {
    // Extract the main environmental effect
    const lowerDesc = description.toLowerCase()

    if (lowerDesc.includes('difficult terrain')) return 'Creates difficult terrain'
    if (lowerDesc.includes('darkness')) return 'Creates magical darkness'
    if (lowerDesc.includes('fog') || lowerDesc.includes('mist')) return 'Creates obscuring fog'
    if (lowerDesc.includes('fire') && lowerDesc.includes('spread')) return 'Spreads fire across area'
    if (lowerDesc.includes('ice') || lowerDesc.includes('frozen')) return 'Creates icy terrain'
    if (lowerDesc.includes('earthquake') || lowerDesc.includes('tremor')) return 'Causes ground tremors'
    if (lowerDesc.includes('wall')) return 'Creates environmental barrier'

    // Default: extract first sentence as effect
    const sentences = description.split('. ')
    return sentences[0] || 'Environmental manipulation'
  }

  private static extractUsageCondition(description: string): string | undefined {
    const lowerDesc = description.toLowerCase()

    if (lowerDesc.includes('only if')) {
      const match = description.match(/only if ([^.]+)/i)
      return match ? match[1] : undefined
    }

    if (lowerDesc.includes('requires')) {
      const match = description.match(/requires ([^.]+)/i)
      return match ? match[1] : undefined
    }

    return undefined
  }

  private static extractHealingAmount(description: string): number | undefined {
    // Look for patterns like "regains 10 hit points", "heals 5 HP"
    const healingMatch = description.match(/(?:regains?|heals?)\s+(\d+)\s*(?:hit\s*points?|hp)/i)
    return healingMatch ? parseInt(healingMatch[1], 10) : undefined
  }

  private static extractDamageType(description: string): string | undefined {
    const damageTypes = ['fire', 'cold', 'lightning', 'thunder', 'acid', 'poison', 'psychic', 'necrotic', 'radiant', 'force']
    return damageTypes.find(type => description.toLowerCase().includes(type))
  }

  private static extractDamage(description: string): string | undefined {
    // Look for damage patterns like "2d6 + 3", "1d8 fire"
    const damageMatch = description.match(/(\d+d\d+(?:\s*[+\-]\s*\d+)?)\s*(?:\w+\s+)?damage/i)
    return damageMatch ? damageMatch[1] : undefined
  }

  private static extractSaveRequirement(description: string): string | undefined {
    const saves = ['Dexterity', 'Constitution', 'Wisdom', 'Strength', 'Intelligence', 'Charisma']
    const saveMatch = description.match(new RegExp(`(${saves.join('|')})\\s+saving\\s+throw`, 'i'))
    return saveMatch ? saveMatch[1] : undefined
  }

  private static extractRange(description: string): string | undefined {
    const rangeMatch = description.match(/(?:range|reach)\s+(\d+\s*feet?)/i)
    return rangeMatch ? rangeMatch[1] : undefined
  }

  private static extractArea(description: string): string | undefined {
    // Look for area descriptions
    const areaPatterns = [
      /(\d+)-foot radius/i,
      /(\d+)-foot cone/i,
      /(\d+)-foot line/i,
      /(\d+) by (\d+) feet?/i
    ]

    for (const pattern of areaPatterns) {
      const match = description.match(pattern)
      if (match) return match[0]
    }

    return undefined
  }

  private static extractEffectDescription(description: string): string {
    // Extract the main effect, typically the first sentence
    const sentences = description.split('. ')
    return sentences[0] || description
  }

  private static extractRechargeValue(description: string): string {
    const rechargeMatch = description.match(/recharge\s+(\d+(?:-\d+)?)/i)
    return rechargeMatch ? rechargeMatch[1] : '6'
  }

  private static extractRegenerationCondition(description: string): string | undefined {
    // Look for conditions that prevent regeneration
    const conditionMatch = description.match(/unless\s+([^.]+)/i)
    return conditionMatch ? conditionMatch[1] : undefined
  }
}