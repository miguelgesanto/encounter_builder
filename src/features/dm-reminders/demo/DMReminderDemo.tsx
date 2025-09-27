import React, { useState, useEffect } from 'react'
import { EnhancedCombatTracker, ReminderSystemProvider } from '../components/EnhancedCombatTracker'
import { useCombatStore } from '../../combat-tracker/store/combatStore'
import { Combatant } from '../../combat-tracker/types/combat.types'

/**
 * Demonstration component for the DM Reminder System
 *
 * This component sets up a realistic combat scenario to showcase
 * the AI-powered reminder system in action.
 */
export const DMReminderDemo: React.FC = () => {
  const combatStore = useCombatStore()
  const [selectedCombatant, setSelectedCombatant] = useState<Combatant | null>(null)
  const [showHPModal, setShowHPModal] = useState(false)
  const [hpModalCombatant, setHPModalCombatant] = useState<Combatant | null>(null)

  // Set up demo encounter on component mount
  useEffect(() => {
    setupDemoEncounter()
  }, [])

  const setupDemoEncounter = () => {
    // Clear existing combatants
    combatStore.resetCombat()

    // Add player characters
    const playerCharacters: Omit<Combatant, 'id' | 'createdAt' | 'updatedAt' | 'conditions'>[] = [
      {
        name: 'Kael the Fighter',
        isPC: true,
        level: 5,
        hp: 45,
        maxHp: 52,
        tempHp: 0,
        ac: 18,
        initiative: 15,
        abilities: { str: 16, dex: 12, con: 14, int: 10, wis: 13, cha: 8 },
        actions: [
          { id: '1', name: 'Attack', description: 'Make a melee weapon attack', actionType: 'action' },
          { id: '2', name: 'Second Wind', description: 'Recover hit points', actionType: 'action' }
        ],
        reactions: [
          { id: '1', name: 'Opportunity Attack', description: 'Attack when enemy leaves reach', actionType: 'reaction' }
        ]
      },
      {
        name: 'Luna the Wizard',
        isPC: true,
        level: 5,
        hp: 12,
        maxHp: 30,
        tempHp: 8,
        ac: 12,
        initiative: 8,
        abilities: { str: 8, dex: 14, con: 12, int: 17, wis: 15, cha: 11 },
        actions: [
          { id: '1', name: 'Fire Bolt', description: 'Ranged spell attack', actionType: 'action' },
          { id: '2', name: 'Fireball', description: '8d6 fire damage in 20-ft radius', actionType: 'action' }
        ]
      },
      {
        name: 'Pip the Rogue',
        isPC: true,
        level: 5,
        hp: 35,
        maxHp: 38,
        tempHp: 0,
        ac: 15,
        initiative: 19,
        abilities: { str: 10, dex: 18, con: 13, int: 14, wis: 12, cha: 8 },
        actions: [
          { id: '1', name: 'Sneak Attack', description: 'Extra damage with advantage', actionType: 'action' },
          { id: '2', name: 'Hide', description: 'Attempt to hide', actionType: 'action' }
        ],
        reactions: [
          { id: '1', name: 'Uncanny Dodge', description: 'Halve damage from one attack', actionType: 'reaction' }
        ]
      }
    ]

    // Add monsters with interesting abilities
    const monsters: Omit<Combatant, 'id' | 'createdAt' | 'updatedAt' | 'conditions'>[] = [
      {
        name: 'Ancient Red Dragon',
        isPC: false,
        hp: 350,
        maxHp: 546,
        tempHp: 0,
        ac: 22,
        initiative: 10,
        cr: '24',
        xp: 62000,
        size: 'Gargantuan',
        type: 'dragon',
        abilities: { str: 30, dex: 10, con: 29, int: 18, wis: 15, cha: 23 },
        legendaryActions: [
          { id: '1', name: 'Detect', description: 'Make a Wisdom check', actionType: 'legendary', cost: 1 },
          { id: '2', name: 'Tail Attack', description: 'Make a tail attack', actionType: 'legendary', cost: 1 },
          { id: '3', name: 'Wing Attack', description: 'Beat wings, creatures must save', actionType: 'legendary', cost: 2 }
        ],
        lairActions: [
          { id: '1', name: 'Magma Eruption', description: 'Lava erupts from ground', actionType: 'lair' },
          { id: '2', name: 'Tremor', description: 'Ground shakes violently', actionType: 'lair' }
        ],
        specialAbilities: [
          { id: '1', name: 'Legendary Resistance', description: '3/Day auto-succeed failed save', type: 'legendary_resistance' },
          { id: '2', name: 'Frightful Presence', description: 'Creatures within 120ft must save or be frightened', type: 'passive' }
        ]
      },
      {
        name: 'Red Dragon Wyrmling',
        isPC: false,
        hp: 35,
        maxHp: 75,
        tempHp: 0,
        ac: 17,
        initiative: 12,
        cr: '4',
        xp: 1100,
        size: 'Medium',
        type: 'dragon',
        abilities: { str: 19, dex: 10, con: 17, int: 12, wis: 11, cha: 15 },
        actions: [
          { id: '1', name: 'Bite', description: 'Melee weapon attack', actionType: 'action' },
          { id: '2', name: 'Fire Breath', description: 'Recharge 5-6, 15ft cone', actionType: 'action' }
        ],
        specialAbilities: [
          { id: '1', name: 'Fire Breath', description: 'Recharge on 5-6', type: 'recharge', recharge: '5-6' }
        ]
      },
      {
        name: 'Fire Elemental',
        isPC: false,
        hp: 80,
        maxHp: 102,
        tempHp: 0,
        ac: 13,
        initiative: 13,
        cr: '5',
        xp: 1800,
        size: 'Large',
        type: 'elemental',
        abilities: { str: 10, dex: 17, con: 16, int: 6, wis: 10, cha: 7 },
        specialAbilities: [
          { id: '1', name: 'Fire Form', description: 'Creature touching takes fire damage', type: 'passive' },
          { id: '2', name: 'Water Susceptibility', description: 'Takes damage from water', type: 'passive' }
        ]
      }
    ]

    // Add all combatants
    try {
      [...playerCharacters, ...monsters].forEach(combatantData => {
        combatStore.addCombatant(combatantData)
      })

      // Add some initial conditions for demonstration
      setTimeout(() => {
        const combatants = combatStore.combatants
        if (combatants.length > 0) {
          // Add poisoned condition to the wizard
          const wizard = combatants.find(c => c.name.includes('Luna'))
          if (wizard) {
            combatStore.addCondition(wizard.id, {
              name: 'Poisoned',
              description: 'Disadvantage on attack rolls and ability checks',
              duration: 3,
              source: 'Poison dart trap'
            })

            // Add concentration spell condition
            combatStore.addCondition(wizard.id, {
              name: 'Concentrating on Shield',
              description: 'Maintaining concentration on Shield spell (+5 AC)',
              duration: -1,
              source: 'Shield spell'
            })
          }

          // Add frightened condition to fighter
          const fighter = combatants.find(c => c.name.includes('Kael'))
          if (fighter) {
            combatStore.addCondition(fighter.id, {
              name: 'Frightened',
              description: 'Frightened of the Ancient Red Dragon',
              duration: 2,
              source: 'Frightful Presence'
            })
          }
        }
      }, 500)

      console.log('Demo encounter set up successfully!')
    } catch (error) {
      console.error('Failed to set up demo encounter:', error)
    }
  }

  const handleSelectCombatant = (combatant: Combatant) => {
    setSelectedCombatant(combatant)
  }

  const handleOpenHPModal = (combatant: Combatant, event: React.MouseEvent) => {
    event.stopPropagation()
    setHPModalCombatant(combatant)
    setShowHPModal(true)
  }

  const handleCloseHPModal = () => {
    setShowHPModal(false)
    setHPModalCombatant(null)
  }

  const handleDamage = (amount: number) => {
    if (hpModalCombatant) {
      combatStore.applyDamage(hpModalCombatant.id, amount)
    }
  }

  const handleHealing = (amount: number) => {
    if (hpModalCombatant) {
      combatStore.applyHealing(hpModalCombatant.id, amount)
    }
  }

  const triggerDramaticEvents = () => {
    const combatants = combatStore.combatants

    // Simulate some dramatic combat events
    const wizard = combatants.find(c => c.name.includes('Luna'))
    const dragon = combatants.find(c => c.name.includes('Ancient'))

    if (wizard) {
      // Bring wizard to critical HP
      combatStore.setHP(wizard.id, 3)

      // Add more conditions
      combatStore.addCondition(wizard.id, {
        name: 'Stunned',
        description: 'Incapacitated, automatically fails Strength and Dexterity saves',
        duration: 1,
        source: 'Dragon roar'
      })
    }

    if (dragon) {
      // Damage the dragon to trigger bloodied reminders
      combatStore.setHP(dragon.id, 200)
    }
  }

  return (
    <ReminderSystemProvider
      initialPreferences={{
        enablePredictiveGeneration: true,
        enableTacticalSuggestions: true,
        enableEnvironmentalReminders: true
      }}
    >
      <div className="dm-reminder-demo p-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🧠 DM Reminder System Demo
          </h1>
          <p className="text-gray-600 mb-4">
            Experience the AI-powered DM assistant that provides contextual reminders during combat encounters.
            The system automatically detects combat events and provides intelligent suggestions.
          </p>

          <div className="flex gap-4 mb-4">
            <button
              onClick={setupDemoEncounter}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-medium"
            >
              🔄 Reset Demo Encounter
            </button>

            <button
              onClick={triggerDramaticEvents}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-medium"
            >
              💥 Trigger Dramatic Events
            </button>

            <button
              onClick={() => combatStore.rollInitiativeForAll()}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded font-medium"
            >
              🎲 Roll Initiative
            </button>
          </div>

          {/* Demo Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">How to Test the System:</h3>
            <ol className="text-sm text-blue-800 list-decimal list-inside space-y-1">
              <li>Click "Roll Initiative" to randomize turn order</li>
              <li>Click "Start Combat" to begin the encounter</li>
              <li>Use "Next Turn" to advance through combat rounds</li>
              <li>Watch for AI-generated reminders based on creature conditions, HP levels, and abilities</li>
              <li>Try "Trigger Dramatic Events" to see critical HP and condition reminders</li>
              <li>Use the DM Control Panel to customize reminder preferences</li>
              <li>Test manual reminder triggers for specific scenarios</li>
            </ol>
          </div>

          {/* Features Showcase */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-900 mb-2">🎯 Turn-Based Reminders</h4>
              <p className="text-sm text-green-800">
                Automatically reminds DMs about creature abilities, conditions, and tactical opportunities at the start of each turn.
              </p>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 className="font-semibold text-purple-900 mb-2">🔮 Predictive Intelligence</h4>
              <p className="text-sm text-purple-800">
                Forecasts potential creature deaths, condition expirations, and legendary action opportunities before they happen.
              </p>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h4 className="font-semibold text-orange-900 mb-2">⚡ Contextual Triggers</h4>
              <p className="text-sm text-orange-800">
                Intelligently triggers reminders based on combat events like HP changes, condition applications, and special abilities.
              </p>
            </div>
          </div>
        </div>

        {/* Enhanced Combat Tracker */}
        <EnhancedCombatTracker
          onSelectCombatant={handleSelectCombatant}
          onOpenHPModal={handleOpenHPModal}
          selectedCombatantId={selectedCombatant?.id}
        />

        {/* Simple HP Management Modal */}
        {showHPModal && hpModalCombatant && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">
                Manage HP - {hpModalCombatant.name}
              </h3>

              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  Current HP: {hpModalCombatant.hp}/{hpModalCombatant.maxHp}
                  {hpModalCombatant.tempHp > 0 && ` (+${hpModalCombatant.tempHp} temp)`}
                </p>
              </div>

              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => handleDamage(10)}
                  className="bg-red-500 text-white px-3 py-2 rounded text-sm"
                >
                  -10 HP
                </button>
                <button
                  onClick={() => handleDamage(25)}
                  className="bg-red-600 text-white px-3 py-2 rounded text-sm"
                >
                  -25 HP
                </button>
                <button
                  onClick={() => handleHealing(10)}
                  className="bg-green-500 text-white px-3 py-2 rounded text-sm"
                >
                  +10 HP
                </button>
                <button
                  onClick={() => handleHealing(25)}
                  className="bg-green-600 text-white px-3 py-2 rounded text-sm"
                >
                  +25 HP
                </button>
              </div>

              <button
                onClick={handleCloseHPModal}
                className="w-full bg-gray-200 text-gray-800 py-2 rounded"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* System Statistics (Development) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">System Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="font-medium">Combatants</div>
                <div className="text-gray-600">{combatStore.combatants.length}</div>
              </div>
              <div>
                <div className="font-medium">Active Conditions</div>
                <div className="text-gray-600">{combatStore.combatants.reduce((sum, c) => sum + c.conditions.length, 0)}</div>
              </div>
              <div>
                <div className="font-medium">Current Round</div>
                <div className="text-gray-600">{combatStore.round}</div>
              </div>
              <div>
                <div className="font-medium">Combat Active</div>
                <div className="text-gray-600">{combatStore.isActive ? 'Yes' : 'No'}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ReminderSystemProvider>
  )
}

export default DMReminderDemo