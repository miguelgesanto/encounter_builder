import {
  ReminderContent,
  TurnContext,
  AIPromptTemplate,
  ReminderType,
  DisplayPosition
} from '../types/reminder.types'
import { CreatureAbilityParser, ParsedCreatureAbilities } from '../utils/CreatureAbilityParser'
import { InitiativeTimingEngine } from '../utils/InitiativeTimingEngine'

export interface AIResponse {
  content: string
  confidence: number
  processingTime: number
  model: string
}

export class ReminderAIAgent {
  private static readonly API_ENDPOINT = 'https://api.anthropic.com/v1/messages'
  private static readonly MODEL = 'claude-3-sonnet-20240229'
  private static readonly MAX_TOKENS = 300

  // Specialized prompts for different reminder types
  private static readonly PROMPT_TEMPLATES: Record<ReminderType, AIPromptTemplate> = {
    turn_start: {
      id: 'turn_start',
      name: 'Turn Start Reminders',
      template: `
As an experienced DM assistant, analyze this creature's turn and provide 2-3 concise reminders for the DM:

Creature: {creatureName} ({isPC})
HP: {currentHP}/{maxHP} ({hpPercentage}%)
AC: {ac}
CR: {challengeRating} | Type: {creatureType}
Conditions: {conditions}
Recent Actions: {recentActions}
Available Actions: {availableActions}
Legendary Actions: {legendaryActions}
Legendary Actions Remaining: {legendaryActionsRemaining}
Lair Actions: {lairActions}
Special Abilities: {specialAbilities}
Breath Weapon: {breathWeaponAvailable}
Round: {round} | Turn: {turnNumber}

Focus on:
- What the DM should announce to players
- Condition effects that apply this turn
- Legendary actions available (if any)
- Special abilities to remember
- Critical HP warnings for death saves or regeneration
- Lair actions if applicable

Format as markdown with emojis for quick visual parsing. Keep each reminder to one line.
Example format:
🎯 **Action Reminder**: [text]
⚠️ **Condition Effect**: [text]
🦁 **Legendary Actions**: [text]
💀 **Critical**: [text]

Provide only the most important reminders, maximum 3 items.
`,
      variables: [
        'creatureName', 'isPC', 'currentHP', 'maxHP', 'hpPercentage', 'ac',
        'conditions', 'recentActions', 'availableActions', 'round', 'turnNumber',
        'legendaryActions', 'lairActions', 'specialAbilities', 'challengeRating', 'creatureType',
        'legendaryActionsRemaining', 'breathWeaponAvailable'
      ],
      reminderType: 'turn_start',
      maxTokens: 200
    },

    legendary_actions: {
      id: 'legendary_actions',
      name: 'Legendary Action Reminders',
      template: `
A legendary creature can take legendary actions:

Creature: {creatureName} (CR {challengeRating})
Actions Remaining: {actionsRemaining}/3
Available Legendary Actions: {legendaryActions}
Last Player Action: {lastPlayerAction}
Current Tactical Situation: {tacticalSituation}

Provide tactical reminder for the DM in this format:
🦁 **Legendary Action Suggestion**: [which action to use and why]
⚡ **Timing**: [when to use it for maximum impact]
🎯 **Target Priority**: [suggested targets or positioning]

Keep suggestions concise and tactical. Focus on the most effective use of remaining actions.
`,
      variables: [
        'creatureName', 'challengeRating', 'actionsRemaining', 'legendaryActions',
        'lastPlayerAction', 'tacticalSituation'
      ],
      reminderType: 'legendary_actions',
      maxTokens: 250
    },

    death_trigger: {
      id: 'death_trigger',
      name: 'Death Event Reminders',
      template: `
A creature is potentially dying this turn:

Creature: {creatureName} ({isPC})
Current HP: {hp}/{maxHP}
Death-triggered abilities: {deathTriggers}
Special death effects: {specialEffects}
Is Player Character: {isPC}

Generate death-related reminders:
💀 **Death Trigger**: [what happens when creature dies]
🎲 **Death Saves**: [if applicable for PCs]
💥 **Special Effects**: [explosions, auras, last words, etc.]
⚰️ **Consequence**: [impact on combat/story]

Focus on mechanical effects the DM needs to remember and dramatic moments for storytelling.
`,
      variables: [
        'creatureName', 'isPC', 'hp', 'maxHP', 'deathTriggers', 'specialEffects'
      ],
      reminderType: 'death_trigger',
      maxTokens: 200
    },

    lair_actions: {
      id: 'lair_actions',
      name: 'Lair Action Reminders',
      template: `
Initiative count 20 - Lair Actions:

Encounter Location: {encounterName}
Round: {round}
Available Lair Actions: {lairAbilities}
Current Battlefield State: {battlefieldState}
Environmental Factors: {environmentalFactors}
Player Positions: {playerPositions}

Generate lair action reminder:
🏰 **Lair Action**: [which specific action to take]
🗺️ **Environmental Effect**: [how it changes the battlefield]
🎯 **Strategic Impact**: [how it affects player tactics]

Choose the most dramatically and tactically appropriate lair action for the current situation.
`,
      variables: [
        'encounterName', 'round', 'lairAbilities', 'battlefieldState',
        'environmentalFactors', 'playerPositions'
      ],
      reminderType: 'lair_actions',
      maxTokens: 250
    },

    condition_reminder: {
      id: 'condition_reminder',
      name: 'Condition Effect Reminders',
      template: `
Active condition on creature:

Creature: {creatureName}
Condition: {conditionName}
Duration: {duration} turns remaining
Condition Description: {conditionDescription}
Source: {conditionSource}
Turn Type: {turnType} (start/end of turn)

Provide condition reminder:
⚠️ **Condition Effect**: [mechanical effects this turn]
🎲 **Required Rolls**: [saves, checks, or rolls needed]
⏰ **Duration**: [when it ends or if it needs renewal]
🔄 **On Turn End**: [what happens at end of turn]

Focus on immediate mechanical effects the DM needs to apply right now.
`,
      variables: [
        'creatureName', 'conditionName', 'duration', 'conditionDescription',
        'conditionSource', 'turnType'
      ],
      reminderType: 'condition_reminder',
      maxTokens: 150
    },

    concentration_check: {
      id: 'concentration_check',
      name: 'Concentration Check Reminders',
      template: `
Concentration check required:

Spellcaster: {creatureName}
Spell Being Concentrated On: {spellName}
Damage Taken: {damage}
Required DC: {concentrationDC} (10 or half damage, whichever is higher)
Constitution Save Modifier: {constitutionSave}
Spell Level: {spellLevel}

Generate concentration reminder:
🧠 **Concentration Check**: DC {concentrationDC} Constitution save
✨ **Spell at Risk**: {spellName} (level {spellLevel})
💥 **If Failed**: [consequences of losing concentration]
🎯 **Modifier**: {constitutionSave} to the roll

Keep it quick - just the essential DC and consequences.
`,
      variables: [
        'creatureName', 'spellName', 'damage', 'concentrationDC',
        'constitutionSave', 'spellLevel'
      ],
      reminderType: 'concentration_check',
      maxTokens: 150
    },

    environmental: {
      id: 'environmental',
      name: 'Environmental Reminders',
      template: `
Environmental effect active:

Environment: {environmentType}
Effect: {environmentalEffect}
Affected Area: {affectedArea}
Duration/Trigger: {durationOrTrigger}
Affected Creatures: {affectedCreatures}

Generate environmental reminder:
🌪️ **Environmental Effect**: [what's happening]
🗺️ **Area**: [where it affects]
⚡ **Mechanical Effect**: [rules impact]
⏰ **Duration**: [when it ends or changes]

Focus on immediate effects that impact this turn's actions.
`,
      variables: [
        'environmentType', 'environmentalEffect', 'affectedArea',
        'durationOrTrigger', 'affectedCreatures'
      ],
      reminderType: 'environmental',
      maxTokens: 150
    },

    tactical_suggestion: {
      id: 'tactical_suggestion',
      name: 'Tactical Suggestions',
      template: `
Tactical situation analysis:

Creature: {creatureName} ({isPC})
HP Status: {hpStatus}
Position: {currentPosition}
Nearby Enemies: {nearbyEnemies}
Available Actions: {availableActions}
Environmental Factors: {environmentalFactors}
Party/Team Status: {teamStatus}

Provide tactical suggestion:
🎯 **Recommended Action**: [best action for this turn]
📍 **Positioning**: [movement suggestions]
⚔️ **Target Priority**: [who to focus on]
🛡️ **Defense**: [how to minimize risk]

Focus on optimal play that considers the current tactical situation.
`,
      variables: [
        'creatureName', 'isPC', 'hpStatus', 'currentPosition', 'nearbyEnemies',
        'availableActions', 'environmentalFactors', 'teamStatus'
      ],
      reminderType: 'tactical_suggestion',
      maxTokens: 200
    },

    turn_end: {
      id: 'turn_end',
      name: 'Turn End Reminders',
      template: `
End of turn for:

Creature: {creatureName}
Actions Taken: {actionsTaken}
Conditions: {activeConditions}
End-of-Turn Effects: {endOfTurnEffects}

Generate turn end reminder:
🔄 **End of Turn**: [effects that trigger now]
⏰ **Condition Updates**: [durations that decrease]
💫 **Ongoing Effects**: [damage, healing, or other effects]

Brief reminders for end-of-turn housekeeping.
`,
      variables: [
        'creatureName', 'actionsTaken', 'activeConditions', 'endOfTurnEffects'
      ],
      reminderType: 'turn_end',
      maxTokens: 100
    },

    round_start: {
      id: 'round_start',
      name: 'Round Start Reminders',
      template: `
Starting Round {roundNumber}:

Lair Actions: {lairActions}
Environmental Effects: {environmentalEffects}
Ongoing Spells/Effects: {ongoingEffects}
Initiative Order: {initiativeOrder}

Generate round start reminder:
🔄 **Round {roundNumber}**: [what happens at round start]
🏰 **Lair Actions**: [if any at initiative 20]
🌪️ **Environment**: [ongoing environmental effects]

Quick overview of round-level effects.
`,
      variables: [
        'roundNumber', 'lairActions', 'environmentalEffects',
        'ongoingEffects', 'initiativeOrder'
      ],
      reminderType: 'round_start',
      maxTokens: 150
    }
  }

  // Generate a reminder using AI
  static async generateReminder(
    reminderType: ReminderType,
    context: Record<string, any>,
    urgency: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ): Promise<ReminderContent | null> {
    try {
      const template = this.PROMPT_TEMPLATES[reminderType]
      if (!template) {
        console.warn(`No template found for reminder type: ${reminderType}`)
        return null
      }

      const prompt = this.fillTemplate(template, context)
      const response = await this.callAI(prompt, template.maxTokens)

      if (!response || !response.content.trim()) {
        console.warn(`Empty response for reminder type: ${reminderType}`)
        return null
      }

      return {
        id: `ai_${reminderType}_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        content: response.content.trim(),
        type: reminderType,
        urgency: this.calculateUrgency(urgency, response.confidence),
        displayDuration: this.calculateDisplayDuration(reminderType, urgency),
        position: this.getDefaultPosition(reminderType) as DisplayPosition,
        timing: this.getDefaultTiming(reminderType, urgency) as 'immediate' | 'delayed-500ms' | 'delayed-1s' | 'delayed-2s',
        dismissible: true,
        context
      }
    } catch (error) {
      console.error(`Error generating ${reminderType} reminder:`, error)
      return null
    }
  }

  // Generate turn-specific reminder with proper creature ability parsing
  static async generateTurnReminder(turnContext: TurnContext): Promise<ReminderContent | null> {
    // Parse creature abilities using the new parser
    const parsedAbilities = CreatureAbilityParser.parseCreatureAbilities(turnContext.creature)

    const context = {
      creatureName: turnContext.creature.name,
      isPC: turnContext.creature.isPC ? 'Player Character' : 'NPC',
      currentHP: turnContext.creature.hp,
      maxHP: turnContext.creature.maxHp,
      hpPercentage: Math.round((turnContext.creature.hp / turnContext.creature.maxHp) * 100),
      ac: turnContext.creature.ac,
      conditions: turnContext.conditions.map(c => c.name).join(', ') || 'None',
      recentActions: turnContext.recentActions.map(a => a.type).join(', ') || 'None',
      availableActions: this.formatCombatAbilities(parsedAbilities.combatAbilities),
      round: turnContext.round,
      turnNumber: turnContext.turnNumber,
      // Use parsed data instead of raw data
      legendaryActions: this.formatLegendaryActions(parsedAbilities.legendaryActions),
      lairActions: this.formatLairActions(parsedAbilities.lairActions),
      specialAbilities: this.formatTurnStartAbilities(parsedAbilities.turnStartAbilities),
      challengeRating: turnContext.creature.cr || 'Unknown',
      creatureType: turnContext.creature.type || 'Unknown',
      // Add specific ability tracking
      legendaryActionsRemaining: 3, // TODO: Track this properly in combat state
      rechargeAbilities: this.formatRechargeAbilities(parsedAbilities.rechargeAbilities),
      regenerationAbilities: this.formatRegenerationAbilities(parsedAbilities.regenerationAbilities),
      deathTriggers: this.formatDeathTriggers(parsedAbilities.deathTriggers),
      breathWeaponAvailable: this.getBreathWeaponStatus(parsedAbilities.rechargeAbilities)
    }

    const urgency = turnContext.creature.hp <= (turnContext.creature.maxHp * 0.25) ? 'critical' :
                   turnContext.creature.hp <= (turnContext.creature.maxHp * 0.5) ? 'high' :
                   'medium'

    return this.generateReminder('turn_start', context, urgency)
  }

  // Generate legendary action reminder
  static async generateLegendaryActionReminder(
    creature: any,
    actionsRemaining: number,
    tacticalContext: any
  ): Promise<ReminderContent | null> {
    const context = {
      creatureName: creature.name,
      challengeRating: creature.cr || 'Unknown',
      actionsRemaining,
      legendaryActions: creature.legendaryActions?.map((a: any) =>
        `${a.name} (${a.cost || 1} action${(a.cost || 1) > 1 ? 's' : ''})`
      ).join(', ') || 'Standard legendary actions',
      lastPlayerAction: tacticalContext.lastPlayerAction || 'Unknown',
      tacticalSituation: tacticalContext.description || 'Ongoing combat'
    }

    return this.generateReminder('legendary_actions', context, 'high')
  }

  // Generate condition reminder
  static async generateConditionReminder(
    creatureName: string,
    condition: any,
    turnType: 'start' | 'end' = 'start'
  ): Promise<ReminderContent | null> {
    const context = {
      creatureName,
      conditionName: condition.name,
      duration: condition.duration || 'Unknown',
      conditionDescription: condition.description || 'No description available',
      conditionSource: condition.source || 'Unknown source',
      turnType: turnType === 'start' ? 'start of turn' : 'end of turn'
    }

    const urgency = condition.duration <= 1 ? 'high' : 'medium'
    return this.generateReminder('condition_reminder', context, urgency)
  }

  // Generate death trigger reminder
  static async generateDeathTriggerReminder(
    creature: any,
    deathTriggers: string[] = [],
    specialEffects: string[] = []
  ): Promise<ReminderContent | null> {
    const context = {
      creatureName: creature.name,
      isPC: creature.isPC ? 'Player Character' : 'NPC',
      hp: creature.hp,
      maxHP: creature.maxHp,
      deathTriggers: deathTriggers.join(', ') || 'None',
      specialEffects: specialEffects.join(', ') || 'None'
    }

    return this.generateReminder('death_trigger', context, 'critical')
  }

  // Fill template with context variables
  private static fillTemplate(template: AIPromptTemplate, context: Record<string, any>): string {
    let prompt = template.template

    template.variables.forEach(variable => {
      const placeholder = `{${variable}}`
      const value = context[variable]?.toString() || '[Not provided]'
      prompt = prompt.replace(new RegExp(placeholder, 'g'), value)
    })

    return prompt
  }

  // Call AI API
  private static async callAI(prompt: string, maxTokens: number = this.MAX_TOKENS): Promise<AIResponse | null> {
    const startTime = Date.now()

    try {
      // In a real implementation, you'd need an API key
      // For now, we'll return a mock response for development
      console.log('🤖 AI Agent Called with prompt:', prompt)

      // Mock response for development
      const mockResponse = this.generateMockResponse(prompt)
      console.log('🤖 AI Agent Generated response:', mockResponse)

      return {
        content: mockResponse,
        confidence: 0.85,
        processingTime: Date.now() - startTime,
        model: this.MODEL
      }

      // Real API call would be:
      /*
      const response = await fetch(this.API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: this.MODEL,
          max_tokens: maxTokens,
          messages: [{ role: 'user', content: prompt }]
        })
      })

      if (!response.ok) {
        throw new Error(`API call failed: ${response.status}`)
      }

      const data = await response.json()

      return {
        content: data.content[0].text,
        confidence: this.calculateConfidence(data),
        processingTime: Date.now() - startTime,
        model: this.MODEL
      }
      */
    } catch (error) {
      console.error('AI API call failed:', error)
      return null
    }
  }

  // Generate context-aware mock response for development
  private static generateMockResponse(prompt: string): string {
    console.log('🔍 Mock response generator analyzing prompt:', prompt.substring(0, 300))

    // Extract context from prompt
    const extractValue = (key: string): string => {
      const regex = new RegExp(`${key}:\\s*([^\\n]+)`)
      const match = prompt.match(regex)
      const result = match ? match[1].trim() : 'Unknown'
      console.log(`🔍 Extracted ${key}:`, result)
      return result
    }

    if (prompt.includes('analyze this creature\'s turn')) {
      const creatureName = extractValue('Creature')
      const currentHP = extractValue('HP').split('/')[0]
      const maxHP = extractValue('HP').split('/')[1]
      const conditions = extractValue('Conditions')
      const creatureText = extractValue('Creature')
      const isPC = creatureText.includes('Player Character')
      const legendaryActions = extractValue('Legendary Actions')
      const lairActions = extractValue('Lair Actions')
      const specialAbilities = extractValue('Special Abilities')
      const challengeRating = extractValue('CR')
      const legendaryActionsRemaining = extractValue('Legendary Actions Remaining')
      const breathWeaponAvailable = extractValue('Breath Weapon')

      const hpPercent = parseInt(currentHP) && parseInt(maxHP) ? Math.round((parseInt(currentHP) / parseInt(maxHP)) * 100) : 100

      let response = `🎯 **${creatureName}'s Turn** - ${isPC ? 'PC' : 'NPC'}`

      // Add breath weapon status for dragons
      if (creatureName.toLowerCase().includes('dragon')) {
        if (breathWeaponAvailable === 'Available') {
          response += `\n🔥 **Breath Weapon** - AVAILABLE (save DC varies)`
        } else {
          response += `\n🔥 **Breath Weapon** - recharging (5-6 on d6)`
        }
      }

      // Add legendary actions if available and remaining
      if (legendaryActions !== 'None' && legendaryActions !== 'Unknown' && parseInt(legendaryActionsRemaining) > 0) {
        response += `\n🦁 **Legendary Actions** - ${legendaryActionsRemaining} remaining`
      }

      // Add special abilities for high-CR creatures
      if (specialAbilities !== 'None' && specialAbilities !== 'Unknown') {
        const abilities = specialAbilities.split(',')
        if (abilities.length > 0) {
          response += `\n✨ **Special** - ${abilities[0].trim()}`
        }
      }

      // Add lair actions if available
      if (lairActions !== 'None' && lairActions !== 'Unknown') {
        response += `\n🏰 **Lair Actions** - check initiative 20`
      }

      // HP status (prioritize critical) with creature-specific advice
      if (hpPercent <= 25) {
        if (creatureName.toLowerCase().includes('troll')) {
          response += `\n💀 **Critical HP** ${currentHP}/${maxHP} - regeneration unless fire/acid!`
        } else if (isPC) {
          response += `\n💀 **Critical HP** ${currentHP}/${maxHP} - death saves required!`
        } else {
          response += `\n💀 **Critical HP** ${currentHP}/${maxHP} - near death!`
        }
      } else if (hpPercent <= 50) {
        if (creatureName.toLowerCase().includes('troll')) {
          response += `\n🩸 **Bloodied** ${currentHP}/${maxHP} - regenerates 10 HP/turn`
        } else {
          response += `\n🩸 **Bloodied** ${currentHP}/${maxHP}`
        }
      }

      // Conditions
      if (conditions !== 'None' && conditions !== 'Unknown') {
        response += `\n⚠️ **${conditions}** - apply condition effects`
      }

      return response
    }

    if (prompt.includes('legendary creature can take legendary actions')) {
      const creatureName = extractValue('Creature')
      const challengeRating = extractValue('challengeRating')
      const actionsRemaining = extractValue('Actions Remaining')
      const legendaryActions = extractValue('Available Legendary Actions')

      let response = `🦁 **Legendary Action**: ${creatureName} (CR ${challengeRating}) has ${actionsRemaining} actions left`

      if (legendaryActions.includes('attack')) {
        response += `\n⚡ **Timing**: Use attack after player spellcaster acts`
      } else if (legendaryActions.includes('move')) {
        response += `\n⚡ **Timing**: Reposition to optimize next turn`
      } else {
        response += `\n⚡ **Timing**: Use available legendary actions strategically`
      }

      response += `\n🎯 **Target Priority**: Focus on most dangerous or vulnerable targets`

      return response
    }

    if (prompt.includes('creature is potentially dying')) {
      const creatureName = extractValue('Creature')
      const isPC = extractValue('Is Player Character') === 'Player Character'
      const currentHP = extractValue('Current HP').split('/')[0]

      if (isPC) {
        return `💀 **Death Saves**: ${creatureName} is unconscious - start death saving throws\n🎲 **Death Saves**: Roll d20: 1 = 2 failures, 2-9 = failure, 10-19 = success, 20 = regain 1 HP\n⚰️ **Consequence**: 3 failures = death, 3 successes = stable but unconscious`
      } else {
        let response = `💀 **Death Trigger**: ${creatureName} at ${currentHP} HP may die this turn`

        // Contextual death effects based on creature type
        if (creatureName.toLowerCase().includes('dragon')) {
          response += `\n💥 **Special Effects**: Ancient dragons may have death throes or final breath weapon`
        } else if (creatureName.toLowerCase().includes('undead') || creatureName.toLowerCase().includes('lich')) {
          response += `\n💥 **Special Effects**: Undead may explode, curse attackers, or rise again`
        } else if (creatureName.toLowerCase().includes('demon') || creatureName.toLowerCase().includes('devil')) {
          response += `\n💥 **Special Effects**: Fiends may return to their plane or leave a cursed area`
        } else {
          response += `\n💥 **Special Effects**: Check stat block for any death-triggered abilities`
        }

        response += `\n⚰️ **Consequence**: Combat may shift dramatically with this creature's death`
        return response
      }
    }

    if (prompt.includes('Initiative count 20 - Lair Actions')) {
      const encounterName = extractValue('Encounter Location')
      const round = extractValue('Round')
      const lairAbilities = extractValue('Available Lair Actions')

      let response = `🏰 **Lair Action**: Initiative 20 (round ${round}) - ${encounterName} lair activates`

      // Contextual lair actions based on location/creature
      if (encounterName.toLowerCase().includes('dragon') || lairAbilities.includes('dragon')) {
        response += `\n🗺️ **Environmental Effect**: Tremors, falling rocks, or elemental hazards`
      } else if (encounterName.toLowerCase().includes('swamp') || encounterName.toLowerCase().includes('bog')) {
        response += `\n🗺️ **Environmental Effect**: Grasping vines, poisonous gas, or sinking mud`
      } else if (encounterName.toLowerCase().includes('dungeon') || encounterName.toLowerCase().includes('tomb')) {
        response += `\n🗺️ **Environmental Effect**: Magical traps, moving walls, or spectral attacks`
      } else {
        response += `\n🗺️ **Environmental Effect**: ${lairAbilities} - environmental manipulation`
      }

      response += `\n🎯 **Strategic Impact**: Forces tactical repositioning and area denial`

      return response
    }

    if (prompt.includes('Active condition on creature')) {
      const creatureName = extractValue('Creature')
      const conditionName = extractValue('Condition')
      const duration = extractValue('Duration')
      const turnType = extractValue('Turn Type')

      let response = `⚠️ **${conditionName}**`

      // Specific condition effects - keep it short
      switch (conditionName.toLowerCase()) {
        case 'poisoned':
          response += ` - disadv. attacks/checks`
          break
        case 'stunned':
          response += ` - can't act, auto-fail Str/Dex saves`
          break
        case 'paralyzed':
          response += ` - incapacitated, auto-crit if hit`
          break
        case 'charmed':
          response += ` - can't attack charmer`
          break
        case 'frightened':
          response += ` - disadv. while source visible`
          break
        case 'restrained':
          response += ` - speed 0, disadv. Dex`
          break
        default:
          response += ` - check effects`
      }

      if (duration !== 'Unknown') {
        response += ` (${duration} left)`
      }

      return response
    }

    return '🎯 **Reminder**: Check the current combat situation and apply appropriate rules'
  }

  // Helper methods
  private static calculateUrgency(baseUrgency: string, confidence: number): 'low' | 'medium' | 'high' | 'critical' {
    if (confidence < 0.5) {
      // Lower urgency if AI is not confident
      const urgencyMap = { critical: 'high', high: 'medium', medium: 'low', low: 'low' }
      return urgencyMap[baseUrgency as keyof typeof urgencyMap] as 'low' | 'medium' | 'high' | 'critical'
    }
    return baseUrgency as 'low' | 'medium' | 'high' | 'critical'
  }

  private static calculateDisplayDuration(reminderType: ReminderType, urgency: string): number {
    const baseDurations = {
      turn_start: 8000,
      turn_end: 3000,
      round_start: 5000,
      condition_reminder: 6000,
      death_trigger: 0, // Don't auto-hide
      legendary_actions: 10000,
      lair_actions: 0, // Don't auto-hide
      concentration_check: 8000,
      environmental: 12000,
      tactical_suggestion: 15000
    }

    const urgencyMultiplier = {
      low: 1,
      medium: 1,
      high: 1.2,
      critical: 0 // Don't auto-hide critical
    }

    const baseDuration = baseDurations[reminderType] || 8000
    const multiplier = urgencyMultiplier[urgency as keyof typeof urgencyMultiplier] || 1

    return multiplier === 0 ? 0 : baseDuration * multiplier
  }

  private static getDefaultPosition(reminderType: ReminderType): DisplayPosition {
    const positions: Record<ReminderType, DisplayPosition> = {
      turn_start: 'turn-panel',
      turn_end: 'turn-panel',
      round_start: 'round-header',
      condition_reminder: 'creature-card',
      death_trigger: 'center-alert',
      legendary_actions: 'sidebar',
      lair_actions: 'center-alert',
      concentration_check: 'creature-card',
      environmental: 'sidebar',
      tactical_suggestion: 'floating'
    }

    return positions[reminderType] || 'sidebar'
  }

  private static getDefaultTiming(reminderType: ReminderType, urgency: string): 'immediate' | 'delayed-500ms' | 'delayed-1s' | 'delayed-2s' {
    if (urgency === 'critical') return 'immediate'
    if (reminderType === 'tactical_suggestion') return 'delayed-1s'
    if (reminderType === 'environmental') return 'delayed-500ms'
    return 'immediate'
  }

  // Helper methods for formatting parsed abilities

  private static formatCombatAbilities(abilities: any[]): string {
    if (!abilities || abilities.length === 0) return 'Standard actions'

    return abilities
      .map(ability => `${ability.name}${ability.damage ? ` (${ability.damage} damage)` : ''}`)
      .join(', ')
  }

  private static formatLegendaryActions(actions: any[]): string {
    if (!actions || actions.length === 0) return 'None'

    return actions
      .map(action => `${action.name} (${action.cost} action${action.cost > 1 ? 's' : ''})`)
      .join(', ')
  }

  private static formatLairActions(actions: any[]): string {
    if (!actions || actions.length === 0) return 'None'

    return actions
      .map(action => `${action.name} (Initiative 20)`)
      .join(', ')
  }

  private static formatTurnStartAbilities(abilities: any[]): string {
    if (!abilities || abilities.length === 0) return 'None'

    const turnStartAbilities = abilities.filter(ability => ability.trigger === 'turn_start')
    if (turnStartAbilities.length === 0) return 'None'

    return turnStartAbilities
      .map(ability => `${ability.name}${ability.healing ? ` (heals ${ability.healing} HP)` : ''}`)
      .join(', ')
  }

  private static formatRechargeAbilities(abilities: any[]): string {
    if (!abilities || abilities.length === 0) return 'None'

    return abilities
      .map(ability => `${ability.name}: ${ability.isAvailable ? 'Available' : `Recharging (${ability.rechargeOn})`}`)
      .join(', ')
  }

  private static formatRegenerationAbilities(abilities: any[]): string {
    if (!abilities || abilities.length === 0) return 'None'

    return abilities
      .map(ability => `${ability.name} (${ability.healingAmount} HP${ability.condition ? `, ${ability.condition}` : ''})`)
      .join(', ')
  }

  private static formatDeathTriggers(triggers: any[]): string {
    if (!triggers || triggers.length === 0) return 'None'

    return triggers
      .map(trigger => `${trigger.name} (${trigger.trigger === 'on_death' ? 'on death' : 'when reduced to 0 HP'})`)
      .join(', ')
  }

  private static getBreathWeaponStatus(rechargeAbilities: any[]): string {
    if (!rechargeAbilities || rechargeAbilities.length === 0) return 'None'

    const breathWeapon = rechargeAbilities.find(ability =>
      ability.name.toLowerCase().includes('breath') ||
      ability.description.toLowerCase().includes('breath weapon')
    )

    if (!breathWeapon) return 'None'

    return breathWeapon.isAvailable ? 'Available' : `Recharging (${breathWeapon.rechargeOn})`
  }
}