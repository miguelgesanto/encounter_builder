import { Combatant } from '../../combat-tracker/types/combat.types'
import { EncounterContext, ReminderType } from '../types/reminder.types'

interface ValidationRule {
  id: string
  name: string
  description: string
  validate: (context: EncounterContext) => ValidationResult[]
}

interface ValidationResult {
  type: 'error' | 'warning' | 'info'
  message: string
  creature?: string
  rule: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  suggestion?: string
}

export class DnD5eValidator {
  private static readonly VALIDATION_RULES: ValidationRule[] = [
    {
      id: 'legendary_actions_timing',
      name: 'Legendary Actions Timing',
      description: 'Validate legendary actions follow D&D 5e timing rules',
      validate: (context) => DnD5eValidator.validateLegendaryActionsTiming(context)
    },
    {
      id: 'lair_actions_initiative',
      name: 'Lair Actions Initiative',
      description: 'Ensure lair actions occur at initiative 20',
      validate: (context) => DnD5eValidator.validateLairActionsInitiative(context)
    },
    {
      id: 'concentration_rules',
      name: 'Concentration Rules',
      description: 'Validate concentration spell handling',
      validate: (context) => DnD5eValidator.validateConcentrationRules(context)
    },
    {
      id: 'death_saving_throws',
      name: 'Death Saving Throws',
      description: 'Ensure proper death save mechanics for PCs',
      validate: (context) => DnD5eValidator.validateDeathSavingThrows(context)
    },
    {
      id: 'condition_durations',
      name: 'Condition Durations',
      description: 'Validate condition timing and interactions',
      validate: (context) => DnD5eValidator.validateConditionDurations(context)
    },
    {
      id: 'recharge_abilities',
      name: 'Recharge Abilities',
      description: 'Ensure recharge mechanics follow 5e rules',
      validate: (context) => DnD5eValidator.validateRechargeAbilities(context)
    },
    {
      id: 'initiative_order',
      name: 'Initiative Order',
      description: 'Validate initiative tracking follows rules',
      validate: (context) => DnD5eValidator.validateInitiativeOrder(context)
    }
  ]

  /**
   * Run all validation rules against the current encounter context
   */
  static validateEncounter(context: EncounterContext): ValidationResult[] {
    const results: ValidationResult[] = []

    for (const rule of this.VALIDATION_RULES) {
      try {
        const ruleResults = rule.validate(context)
        results.push(...ruleResults)
      } catch (error) {
        console.error(`Validation rule ${rule.id} failed:`, error)
        results.push({
          type: 'error',
          message: `Validation rule "${rule.name}" failed to execute`,
          rule: rule.id,
          severity: 'medium'
        })
      }
    }

    return results
  }

  /**
   * Validate legendary actions timing and usage
   */
  private static validateLegendaryActionsTiming(context: EncounterContext): ValidationResult[] {
    const results: ValidationResult[] = []
    const currentCreature = context.creatures[context.currentTurn]

    context.legendaryCreatures.forEach(creature => {
      // Legendary actions should not be available during the creature's own turn
      if (creature.id === currentCreature?.id && creature.legendaryActionsRemaining > 0) {
        results.push({
          type: 'warning',
          message: `${creature.name} should not have legendary actions available during its own turn`,
          creature: creature.id,
          rule: 'legendary_actions_timing',
          severity: 'medium',
          suggestion: 'Legendary actions reset at the start of the creature\'s turn'
        })
      }

      // Check for proper action economy
      if (creature.legendaryActionsRemaining > creature.legendaryActionsTotal) {
        results.push({
          type: 'error',
          message: `${creature.name} has more legendary actions remaining than possible`,
          creature: creature.id,
          rule: 'legendary_actions_timing',
          severity: 'high',
          suggestion: 'Reset legendary actions to maximum value'
        })
      }

      // Validate action costs
      creature.actions.forEach(action => {
        const cost = (action as any).cost || 1
        if (cost > 3) {
          results.push({
            type: 'warning',
            message: `${creature.name}'s legendary action "${action.name}" has unusually high cost (${cost})`,
            creature: creature.id,
            rule: 'legendary_actions_timing',
            severity: 'low',
            suggestion: 'Most legendary actions cost 1-3 actions'
          })
        }
      })
    })

    return results
  }

  /**
   * Validate lair actions occur at proper initiative
   */
  private static validateLairActionsInitiative(context: EncounterContext): ValidationResult[] {
    const results: ValidationResult[] = []

    if (context.lairActions.length > 0) {
      const maxInitiative = Math.max(...context.creatures.map(c => c.initiative))
      const creaturesAtHighestInit = context.creatures.filter(c => c.initiative === maxInitiative)

      // Lair actions should occur at initiative 20 or highest initiative count
      if (maxInitiative !== 20) {
        results.push({
          type: 'info',
          message: `Lair actions occurring at initiative ${maxInitiative} instead of standard initiative 20`,
          rule: 'lair_actions_initiative',
          severity: 'low',
          suggestion: 'Consider adjusting initiative to 20 for lair actions'
        })
      }

      // Check for multiple creatures at highest initiative (potential conflicts)
      if (creaturesAtHighestInit.length > 1) {
        const lairCreatures = creaturesAtHighestInit.filter(c => c.lairActions && c.lairActions.length > 0)
        if (lairCreatures.length > 1) {
          results.push({
            type: 'warning',
            message: 'Multiple creatures with lair actions at same initiative',
            rule: 'lair_actions_initiative',
            severity: 'medium',
            suggestion: 'Determine lair action order or merge effects'
          })
        }
      }
    }

    return results
  }

  /**
   * Validate concentration spell mechanics
   */
  private static validateConcentrationRules(context: EncounterContext): ValidationResult[] {
    const results: ValidationResult[] = []

    context.creatures.forEach(creature => {
      if (creature.concentratingOn) {
        // Check for multiple concentration spells (impossible in 5e)
        if (Array.isArray(creature.concentratingOn)) {
          results.push({
            type: 'error',
            message: `${creature.name} is concentrating on multiple spells`,
            creature: creature.id,
            rule: 'concentration_rules',
            severity: 'critical',
            suggestion: 'A creature can only concentrate on one spell at a time'
          })
        }

        // Check for unconscious creature maintaining concentration
        const isUnconscious = creature.conditions?.some(c =>
          c.name.toLowerCase().includes('unconscious') ||
          c.name.toLowerCase().includes('incapacitated')
        )

        if (isUnconscious && creature.concentratingOn) {
          results.push({
            type: 'error',
            message: `${creature.name} is unconscious but still concentrating`,
            creature: creature.id,
            rule: 'concentration_rules',
            severity: 'high',
            suggestion: 'Unconscious creatures automatically lose concentration'
          })
        }

        // Check for dead creature maintaining concentration
        if (creature.hp <= 0 && creature.concentratingOn) {
          results.push({
            type: 'error',
            message: `${creature.name} is at 0 HP but still concentrating`,
            creature: creature.id,
            rule: 'concentration_rules',
            severity: 'critical',
            suggestion: 'Creatures at 0 HP automatically lose concentration'
          })
        }
      }
    })

    return results
  }

  /**
   * Validate death saving throw mechanics for PCs
   */
  private static validateDeathSavingThrows(context: EncounterContext): ValidationResult[] {
    const results: ValidationResult[] = []

    context.creatures.forEach(creature => {
      if (creature.isPC && creature.hp <= 0) {
        // PC at 0 HP should have death save tracking
        if (!creature.deathSaves) {
          results.push({
            type: 'warning',
            message: `${creature.name} (PC) is at 0 HP but has no death save tracking`,
            creature: creature.id,
            rule: 'death_saving_throws',
            severity: 'high',
            suggestion: 'Initialize death saving throws for PC at 0 HP'
          })
        }

        // Check for invalid death save values
        if (creature.deathSaves) {
          const saves = creature.deathSaves as any
          if (saves.successes > 3 || saves.failures > 3) {
            results.push({
              type: 'error',
              message: `${creature.name} has invalid death save count`,
              creature: creature.id,
              rule: 'death_saving_throws',
              severity: 'high',
              suggestion: 'Death saves should not exceed 3 successes or failures'
            })
          }
        }
      }

      // NPCs at 0 HP should generally be dead (unless special rules)
      if (!creature.isPC && creature.hp <= 0) {
        const hasSpecialRule = creature.specialAbilities?.some(ability =>
          ability.description.toLowerCase().includes('regeneration') ||
          ability.description.toLowerCase().includes('undead fortitude')
        )

        if (!hasSpecialRule) {
          results.push({
            type: 'info',
            message: `${creature.name} (NPC) is at 0 HP - should be dead unless special rules apply`,
            creature: creature.id,
            rule: 'death_saving_throws',
            severity: 'low',
            suggestion: 'NPCs typically die at 0 HP unless they have special abilities'
          })
        }
      }
    })

    return results
  }

  /**
   * Validate condition duration tracking
   */
  private static validateConditionDurations(context: EncounterContext): ValidationResult[] {
    const results: ValidationResult[] = []

    context.activeConditions.forEach(condition => {
      // Check for negative durations
      if (condition.duration < 0) {
        results.push({
          type: 'error',
          message: `Condition "${condition.name}" has negative duration`,
          creature: condition.creature,
          rule: 'condition_durations',
          severity: 'medium',
          suggestion: 'Conditions with 0 or negative duration should be removed'
        })
      }

      // Check for conflicting conditions
      const creature = context.creatures.find(c => c.id === condition.creature)
      if (creature) {
        const conflictingConditions = this.getConflictingConditions(condition.name, creature.conditions || [])
        if (conflictingConditions.length > 0) {
          results.push({
            type: 'warning',
            message: `${creature.name} has conflicting conditions: ${condition.name} and ${conflictingConditions.join(', ')}`,
            creature: condition.creature,
            rule: 'condition_durations',
            severity: 'medium',
            suggestion: 'Some conditions may override or conflict with each other'
          })
        }
      }
    })

    return results
  }

  /**
   * Validate recharge ability mechanics
   */
  private static validateRechargeAbilities(context: EncounterContext): ValidationResult[] {
    const results: ValidationResult[] = []

    context.creatures.forEach(creature => {
      if (creature.rechargeAbilities) {
        creature.rechargeAbilities.forEach(ability => {
          // Validate recharge format
          const rechargePattern = /^(\d+)[-–](\d+)$/
          if (ability.rechargeOn && !rechargePattern.test(ability.rechargeOn)) {
            results.push({
              type: 'warning',
              message: `${creature.name}'s ${ability.name} has invalid recharge format: "${ability.rechargeOn}"`,
              creature: creature.id,
              rule: 'recharge_abilities',
              severity: 'low',
              suggestion: 'Recharge should be in format "5-6" or "4-6"'
            })
          }

          // Check for breath weapons that should recharge
          if (ability.name.toLowerCase().includes('breath') && !ability.rechargeOn) {
            results.push({
              type: 'info',
              message: `${creature.name}'s ${ability.name} appears to be a breath weapon but has no recharge`,
              creature: creature.id,
              rule: 'recharge_abilities',
              severity: 'low',
              suggestion: 'Most breath weapons recharge on 5-6'
            })
          }
        })
      }
    })

    return results
  }

  /**
   * Validate initiative order and tracking
   */
  private static validateInitiativeOrder(context: EncounterContext): ValidationResult[] {
    const results: ValidationResult[] = []

    // Check for duplicate initiatives
    const initiativeMap = new Map<number, string[]>()
    context.creatures.forEach(creature => {
      const init = creature.initiative
      if (!initiativeMap.has(init)) {
        initiativeMap.set(init, [])
      }
      initiativeMap.get(init)!.push(creature.name)
    })

    initiativeMap.forEach((names, initiative) => {
      if (names.length > 1) {
        results.push({
          type: 'info',
          message: `Multiple creatures at initiative ${initiative}: ${names.join(', ')}`,
          rule: 'initiative_order',
          severity: 'low',
          suggestion: 'Consider using DEX scores or rolling to break ties'
        })
      }
    })

    // Check for current turn being valid index
    if (context.currentTurn >= context.creatures.length) {
      results.push({
        type: 'error',
        message: `Current turn index (${context.currentTurn}) exceeds number of creatures`,
        rule: 'initiative_order',
        severity: 'critical',
        suggestion: 'Reset turn to valid index'
      })
    }

    return results
  }

  /**
   * Get conditions that conflict with the given condition
   */
  private static getConflictingConditions(conditionName: string, conditions: any[]): string[] {
    const conflicts: Record<string, string[]> = {
      'stunned': ['paralyzed', 'unconscious'],
      'paralyzed': ['stunned', 'unconscious'],
      'unconscious': ['stunned', 'paralyzed', 'prone'],
      'charmed': ['frightened'], // In some contexts
      'invisible': ['visible'] // Custom conditions
    }

    const normalizedName = conditionName.toLowerCase()
    const conflictList = conflicts[normalizedName] || []

    return conditions
      .map(c => typeof c === 'string' ? c : c.name)
      .filter(name => conflictList.includes(name.toLowerCase()))
  }

  /**
   * Get validation results for specific reminder types
   */
  static getValidationForReminderType(reminderType: ReminderType, context: EncounterContext): ValidationResult[] {
    const allResults = this.validateEncounter(context)

    const typeRuleMap: Record<ReminderType, string[]> = {
      legendary_actions: ['legendary_actions_timing'],
      lair_actions: ['lair_actions_initiative'],
      concentration_check: ['concentration_rules'],
      death_trigger: ['death_saving_throws'],
      condition_reminder: ['condition_durations'],
      turn_start: ['recharge_abilities', 'initiative_order'],
      turn_end: ['condition_durations'],
      round_start: ['initiative_order'],
      environmental: [],
      tactical_suggestion: []
    }

    const relevantRules = typeRuleMap[reminderType] || []
    return allResults.filter(result => relevantRules.includes(result.rule))
  }
}