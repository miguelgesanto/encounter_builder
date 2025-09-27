import { ReminderType, EncounterContext, ReminderContent, DisplayedReminder } from '../types/reminder.types'

/**
 * Plugin interface for extending the reminder system with new types
 */
export interface ReminderPlugin {
  id: string
  name: string
  version: string
  reminderTypes: ReminderType[]

  // Plugin lifecycle
  initialize(): Promise<void>
  destroy(): Promise<void>

  // Reminder generation
  canHandle(reminderType: ReminderType): boolean
  generateReminder(reminderType: ReminderType, context: EncounterContext): Promise<ReminderContent | null>

  // Optional hooks
  onReminderDisplayed?(reminder: DisplayedReminder): void
  onReminderDismissed?(reminderId: string): void
  onContextChanged?(context: EncounterContext): void
}

/**
 * Plugin manager for registering and managing reminder plugins
 */
export class ReminderPluginManager {
  private plugins = new Map<string, ReminderPlugin>()
  private typeHandlers = new Map<ReminderType, ReminderPlugin[]>()

  /**
   * Register a new reminder plugin
   */
  async registerPlugin(plugin: ReminderPlugin): Promise<void> {
    try {
      await plugin.initialize()

      this.plugins.set(plugin.id, plugin)

      // Register type handlers
      plugin.reminderTypes.forEach(type => {
        if (!this.typeHandlers.has(type)) {
          this.typeHandlers.set(type, [])
        }
        this.typeHandlers.get(type)!.push(plugin)
      })

      console.log(`✅ Registered reminder plugin: ${plugin.name} v${plugin.version}`)
    } catch (error) {
      console.error(`❌ Failed to register plugin ${plugin.name}:`, error)
      throw error
    }
  }

  /**
   * Unregister a plugin
   */
  async unregisterPlugin(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId)
    if (!plugin) return

    try {
      await plugin.destroy()

      // Remove from type handlers
      plugin.reminderTypes.forEach(type => {
        const handlers = this.typeHandlers.get(type) || []
        const index = handlers.indexOf(plugin)
        if (index > -1) {
          handlers.splice(index, 1)
        }
      })

      this.plugins.delete(pluginId)
      console.log(`✅ Unregistered reminder plugin: ${plugin.name}`)
    } catch (error) {
      console.error(`❌ Failed to unregister plugin ${plugin.name}:`, error)
    }
  }

  /**
   * Generate reminder using appropriate plugin
   */
  async generateReminder(reminderType: ReminderType, context: EncounterContext): Promise<ReminderContent | null> {
    const handlers = this.typeHandlers.get(reminderType) || []

    // Try each handler in order until one succeeds
    for (const handler of handlers) {
      if (handler.canHandle(reminderType)) {
        try {
          const result = await handler.generateReminder(reminderType, context)
          if (result) return result
        } catch (error) {
          console.error(`Plugin ${handler.name} failed to generate ${reminderType}:`, error)
          // Continue to next handler
        }
      }
    }

    return null
  }

  /**
   * Get all registered plugins
   */
  getPlugins(): ReminderPlugin[] {
    return Array.from(this.plugins.values())
  }

  /**
   * Get supported reminder types
   */
  getSupportedTypes(): ReminderType[] {
    return Array.from(this.typeHandlers.keys())
  }

  /**
   * Broadcast event to all plugins
   */
  broadcastEvent(event: 'displayed' | 'dismissed' | 'context-changed', data: any): void {
    this.plugins.forEach(plugin => {
      try {
        switch (event) {
          case 'displayed':
            plugin.onReminderDisplayed?.(data)
            break
          case 'dismissed':
            plugin.onReminderDismissed?.(data)
            break
          case 'context-changed':
            plugin.onContextChanged?.(data)
            break
        }
      } catch (error) {
        console.error(`Plugin ${plugin.name} event handler failed:`, error)
      }
    })
  }
}

/**
 * Example custom reminder plugins
 */

// Weather and Environmental Effects Plugin
export class WeatherPlugin implements ReminderPlugin {
  id = 'weather-plugin'
  name = 'Weather & Environmental Effects'
  version = '1.0.0'
  reminderTypes: ReminderType[] = ['environmental']

  async initialize(): Promise<void> {
    console.log('Weather plugin initialized')
  }

  async destroy(): Promise<void> {
    console.log('Weather plugin destroyed')
  }

  canHandle(reminderType: ReminderType): boolean {
    return reminderType === 'environmental'
  }

  async generateReminder(reminderType: ReminderType, context: EncounterContext): Promise<ReminderContent | null> {
    if (reminderType !== 'environmental') return null

    // Generate weather-based reminders
    const weatherEffects = [
      'Heavy rain reduces visibility to 100 feet',
      'Strong winds impose disadvantage on ranged attacks',
      'Extreme cold: Constitution saves or exhaustion',
      'Thick fog heavily obscures the area',
      'Lightning storm: metal armor attracts strikes'
    ]

    const effect = weatherEffects[context.round % weatherEffects.length]

    return {
      id: `weather_${Date.now()}`,
      content: `🌪️ **Environmental Effect**: ${effect}\n\n*Weather changes can dramatically affect combat tactics*`,
      type: 'environmental',
      urgency: 'medium',
      displayDuration: 15000,
      position: 'sidebar',
      timing: 'delayed-1s',
      dismissible: true,
      context: { weatherType: 'storm', round: context.round }
    }
  }
}

// Spell Duration Tracker Plugin
export class SpellTrackerPlugin implements ReminderPlugin {
  id = 'spell-tracker-plugin'
  name = 'Spell Duration Tracker'
  version = '1.0.0'
  reminderTypes: ReminderType[] = ['concentration_check', 'turn_end']

  private spellDurations = new Map<string, number>()

  async initialize(): Promise<void> {
    console.log('Spell tracker plugin initialized')
  }

  async destroy(): Promise<void> {
    this.spellDurations.clear()
  }

  canHandle(reminderType: ReminderType): boolean {
    return ['concentration_check', 'turn_end'].includes(reminderType)
  }

  async generateReminder(reminderType: ReminderType, context: EncounterContext): Promise<ReminderContent | null> {
    const concentratingCreatures = context.creatures.filter(c => c.concentratingOn)

    if (concentratingCreatures.length === 0) return null

    const reminders: string[] = []

    concentratingCreatures.forEach(creature => {
      const spell = creature.concentratingOn
      if (typeof spell === 'object' && spell.duration) {
        reminders.push(`${creature.name}: ${spell.spellName} (${spell.duration})`)
      }
    })

    if (reminders.length === 0) return null

    return {
      id: `spell_duration_${Date.now()}`,
      content: `✨ **Active Concentration Spells**:\n${reminders.map(r => `• ${r}`).join('\n')}\n\n*Remember concentration checks on damage*`,
      type: 'concentration_check',
      urgency: 'medium',
      displayDuration: 10000,
      position: 'sidebar',
      timing: 'immediate',
      dismissible: true
    }
  }
}

// Custom Combat Mechanics Plugin
export class CustomMechanicsPlugin implements ReminderPlugin {
  id = 'custom-mechanics-plugin'
  name = 'Custom Combat Mechanics'
  version = '1.0.0'
  reminderTypes: ReminderType[] = ['tactical_suggestion']

  async initialize(): Promise<void> {
    console.log('Custom mechanics plugin initialized')
  }

  async destroy(): Promise<void> {
    console.log('Custom mechanics plugin destroyed')
  }

  canHandle(reminderType: ReminderType): boolean {
    return reminderType === 'tactical_suggestion'
  }

  async generateReminder(reminderType: ReminderType, context: EncounterContext): Promise<ReminderContent | null> {
    if (context.round < 3) return null // Only for longer combats

    const currentCreature = context.creatures[context.currentTurn]
    if (!currentCreature) return null

    const suggestions: string[] = []

    // Action economy suggestions
    if (currentCreature.isPC) {
      suggestions.push('Consider using bonus action and movement')
      suggestions.push('Check for opportunity attacks before moving')
    } else {
      suggestions.push('Use positioning to limit player options')
      suggestions.push('Focus fire on wounded targets')
    }

    // HP-based suggestions
    const hpPercent = currentCreature.hp / currentCreature.maxHp
    if (hpPercent < 0.3) {
      suggestions.push(currentCreature.isPC ?
        'Consider defensive actions or healing' :
        'Desperate tactics - go for maximum damage'
      )
    }

    const suggestion = suggestions[Math.floor(Math.random() * suggestions.length)]

    return {
      id: `tactical_${Date.now()}`,
      content: `💡 **Tactical Suggestion**: ${suggestion}\n\n*Round ${context.round} - Combat is heating up!*`,
      type: 'tactical_suggestion',
      urgency: 'low',
      displayDuration: 20000,
      position: 'floating',
      timing: 'delayed-2s',
      dismissible: true
    }
  }
}

// Singleton plugin manager instance
export const pluginManager = new ReminderPluginManager()

// Register default plugins
async function initializeDefaultPlugins() {
  await pluginManager.registerPlugin(new WeatherPlugin())
  await pluginManager.registerPlugin(new SpellTrackerPlugin())
  await pluginManager.registerPlugin(new CustomMechanicsPlugin())
}

// Call this during app initialization
initializeDefaultPlugins().catch(console.error)