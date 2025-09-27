import React, { useState, useEffect, useCallback } from 'react'
import { Plus, Dice1, Play, Heart, Shield, User, Swords, Lightbulb } from 'lucide-react'
import { CreatureBrowser } from './components/CreatureBrowser'
import { Sidebar } from './components/Sidebar'
import { ConditionsTracker } from './components/ConditionsTracker'
import { PCForm } from './components/PCForm'
import { EnhancedRightPanel } from './components/EnhancedRightPanel'
import { SaveLoadManager, SavedEncounter } from './components/SaveLoadManager'
import { HPModal } from './components/HPModal'
import { QuickAddModal } from './components/QuickAddModal'
import CombatCard from './components/CombatCard'
import DMReminderCard from './components/DMReminderCard'
import AIReminderCard from './components/AIReminderCard'
// import { useAIReminders } from './features/dm-reminders/hooks/useAIReminders' // Temporarily disabled due to dependencies
import { Combatant, SavedEncounter as SavedEncounterType } from './types/combatant'
import { STORAGE_KEYS } from './constants/ui'
import { useInitiative } from './hooks/useInitiative'
import { useEncounterBalance } from './hooks/useEncounterBalance'
import { useEncounterStore } from './stores/encounterStore'
import { checkForLairActions, getCurrentCreature, hasActiveReminders } from './utils/reminder-logic'
// AI-assisted DM reminder system
import { ReminderAIAgent } from './features/dm-reminders/agents/ReminderAIAgent'
import { ReminderContent, DisplayedReminder } from './features/dm-reminders/types/reminder.types'
// Generalizable ability parsing
import {
  processRechargeRolls,
  initializeRechargeAbilities,
  processRegeneration,
  generateRegenerationReminder
} from './utils/abilityParser'
// Advanced D&D mechanics
import {
  generateSpellDurationReminder,
  isConcentrationNearExpiry,
  generateSavingThrowReminder,
  COMMON_SAVE_DCS
} from './utils/concentrationUtils'
import {
  analyzeConditionInteractions,
  generateConditionReminder,
  generateDeathSaveReminder
} from './utils/combatMechanics'
import {
  generateSpecialAbilityReminders,
  generateContextualAbilityReminders
} from './utils/specialAbilityParser'
import {
  getContextualReminders
} from './utils/reminder-logic'

const App: React.FC = () => {
  const { rollInitiative, rollAllInitiative, sortByInitiative } = useInitiative();
  const { calculateDifficulty } = useEncounterBalance();

  // Get UI state from Zustand store for panel management
  const {
    ui: { leftSidebarCollapsed, rightPanelCollapsed },
    initiative: { selectedCombatantId },
    toggleLeftSidebar,
    toggleRightPanel,
    nextTurn: storeNextTurn,
    setSelectedCombatant: setStoreSelectedCombatant
  } = useEncounterStore();

  const [combatants, setCombatants] = useState<Combatant[]>([
    {
      id: '1',
      name: 'Goblin',
      hp: parseInt('7'),
      maxHp: parseInt('7'),
      ac: parseInt('15'),
      initiative: parseInt('12'),
      isPC: false,
      conditions: [{ name: 'Poisoned' }, { name: 'Prone' }],
      cr: '1/4',
      type: 'humanoid',
      environment: 'forest',
      xp: parseInt('50'),
      tempHp: parseInt('0')
    },
    {
      id: '2',
      name: 'Fighter (PC)',
      hp: parseInt('25'),
      maxHp: parseInt('25'),
      ac: parseInt('18'),
      initiative: parseInt('15'),
      isPC: true,
      level: parseInt('5'),
      conditions: [],
      tempHp: parseInt('0'),
      concentratingOn: {
        spellName: 'Bless',
        spellLevel: 1,
        duration: 'Concentration, up to 1 minute',
        startedRound: 1,
        dc: 13
      },
      abilities: {
        str: 16,
        dex: 14,
        con: 15,
        int: 10,
        wis: 12,
        cha: 13
      }
    },
    {
      id: '3',
      name: 'Ancient Red Dragon',
      hp: parseInt('546'),
      maxHp: parseInt('546'),
      ac: parseInt('22'),
      initiative: parseInt('20'),
      isPC: false,
      conditions: [],
      cr: '24',
      type: 'dragon',
      environment: 'mountain',
      xp: parseInt('62000'),
      tempHp: parseInt('0'),
      legendaryActionsRemaining: 3,
      actions: [
        { name: 'Multiattack', description: 'Makes three attacks: one bite and two claw attacks' },
        { name: 'Bite', description: 'Melee weapon attack, 2d10 + 10 piercing plus 2d6 fire damage' },
        { name: 'Claw', description: 'Melee weapon attack, 2d6 + 10 slashing damage' },
        { name: 'Tail', description: 'Melee weapon attack, 2d8 + 10 bludgeoning damage' },
        { name: 'Frightful Presence', description: 'Each creature within 120 feet must make a DC 21 Wisdom saving throw' },
        { name: 'Fire Breath', description: 'Recharge 5-6. 90-foot cone, DC 24 Dexterity save, 91 (26d6) fire damage' }
      ],
      legendaryActions: [
        { name: 'Detect', description: 'Makes a Wisdom (Perception) check', cost: 1 },
        { name: 'Tail Attack', description: 'Makes a tail attack', cost: 1 },
        { name: 'Wing Attack', description: 'Beats wings, creatures make saving throws', cost: 2 }
      ],
      lairActions: [
        { name: 'Magma Eruption', description: 'Volcanic fissures erupt' },
        { name: 'Tremor', description: 'Lair shakes violently' }
      ],
      rechargeAbilities: [
        { name: 'Fire Breath', isAvailable: true, rechargeOn: '5-6', description: 'Recharge 5-6. 90-foot cone, DC 24 Dexterity save, 91 (26d6) fire damage' }
      ]
    },
    {
      id: '4',
      name: 'Lich',
      hp: parseInt('135'),
      maxHp: parseInt('135'),
      ac: parseInt('17'),
      initiative: parseInt('14'),
      isPC: false,
      conditions: [],
      cr: '21',
      type: 'undead',
      environment: 'dungeon',
      xp: parseInt('33000'),
      tempHp: parseInt('0'),
      legendaryActionsRemaining: 3,
      legendaryActions: [
        { name: 'Cantrip', description: 'Casts a cantrip', cost: 1 },
        { name: 'Paralyzing Touch', description: 'Makes a paralyzing touch attack', cost: 2 },
        { name: 'Frightening Gaze', description: 'Targets creature with frightening gaze', cost: 2 },
        { name: 'Disrupt Life', description: 'Damages all living creatures nearby', cost: 3 }
      ],
      lairActions: [
        { name: 'Tainted Ground', description: 'Area becomes difficult terrain' },
        { name: 'Undead Servants', description: 'Summons skeleton or zombie' }
      ]
    },
    {
      id: '5',
      name: 'Troll',
      hp: parseInt('60'), // Reduced to show regeneration
      maxHp: parseInt('84'),
      ac: parseInt('15'),
      initiative: parseInt('8'),
      isPC: false,
      conditions: [],
      cr: '5',
      type: 'giant',
      environment: 'swamp',
      xp: parseInt('1800'),
      tempHp: parseInt('0'),
      specialAbilities: [
        {
          name: 'Keen Smell',
          description: 'The troll has advantage on Wisdom (Perception) checks that rely on smell.'
        },
        {
          name: 'Regeneration',
          description: 'The troll regains 10 hit points at the start of its turn. If the troll takes acid or fire damage, this trait doesn\'t function at the start of the troll\'s next turn. The troll dies only if it starts its turn with 0 hit points and doesn\'t regenerate.'
        }
      ],
      actions: [
        {
          name: 'Multiattack',
          description: 'The troll makes three attacks: one with its bite and two with its claws.'
        },
        {
          name: 'Bite',
          description: 'Melee Weapon Attack: +7 to hit, reach 5 ft., one target. Hit: 7 (1d6 + 4) piercing damage.'
        },
        {
          name: 'Claw',
          description: 'Melee Weapon Attack: +7 to hit, reach 5 ft., one target. Hit: 11 (2d6 + 4) slashing damage.'
        }
      ]
    },
  ])
  const [currentTurn, setCurrentTurn] = useState(0)
  const [round, setRound] = useState(1)

  // State for viewing creature stat blocks without adding to encounter
  const [viewingCreature, setViewingCreature] = useState<Combatant | null>(null)

  // Derive selected combatant from store state and local combatants
  const selectedCombatant = selectedCombatantId
    ? combatants.find(c => c.id === selectedCombatantId) || viewingCreature
    : viewingCreature
  const [encounterNotes, setEncounterNotes] = useState('')
  const [encounterName, setEncounterName] = useState('Goblin Ambush')
  const [showQuickAddModal, setShowQuickAddModal] = useState(false)
  const [showHPModal, setShowHPModal] = useState(false)
  const [hpModalCombatant, setHpModalCombatant] = useState<Combatant | null>(null)
  const [modalPosition, setModalPosition] = useState<{ x: number; y: number } | null>(null)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [showLoadDialog, setShowLoadDialog] = useState(false)
  const [saveEncounterName, setSaveEncounterName] = useState('')
  const [savedEncounters, setSavedEncounters] = useState<SavedEncounterType[]>([])
  const [showReminders, setShowReminders] = useState(true)
  const [activeReminders, setActiveReminders] = useState<Combatant[]>([])
  const [aiReminders, setAiReminders] = useState<DisplayedReminder[]>([])
  const [isAiReminderMode, setIsAiReminderMode] = useState(true)
  const [isGeneratingReminders, setIsGeneratingReminders] = useState(false)

  // Load saved encounters from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SAVED_ENCOUNTERS)
    if (saved) {
      try {
        setSavedEncounters(JSON.parse(saved))
      } catch (e) {
        console.error('Error loading saved encounters:', e)
      }
    }
  }, [])

  // Save encounters to localStorage whenever the list changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SAVED_ENCOUNTERS, JSON.stringify(savedEncounters))
  }, [savedEncounters])

  // Simple AI reminder generation (working version)
  const generateSimpleAIReminders = useCallback(async (turnIndex: number, currentRound: number) => {
    console.log('🔄 Generating simple AI reminders for turn', turnIndex, 'round', currentRound)

    if (!showReminders || combatants.length === 0) {
      setAiReminders([])
      return
    }

    setIsGeneratingReminders(true)

    try {
      const newReminders: DisplayedReminder[] = []
      const currentCreature = combatants[turnIndex]
      const previousCreature = turnIndex > 0 ? combatants[turnIndex - 1] : null

      // 1. INITIATIVE 20 EFFECTS - Check if we crossed initiative 20
      const crossedInitiative20 = previousCreature
        ? (previousCreature.initiative > 20 && currentCreature.initiative < 20)
        : (turnIndex === 0) // Start of combat

      if (crossedInitiative20) {
        console.log('🏰 Initiative 20 effects triggered!')

        // Find all creatures with lair actions
        combatants.forEach(creature => {
          if (creature.lairActions && creature.lairActions.length > 0) {
            const lairContent = `**${creature.name}** (NPC) - Turn ${turnIndex + 1}\n\n**Special Abilities:**\nInitiative 20 - Lair Actions\nChoose one: ${creature.lairActions.map(action => action.name).join(', ')}`

            newReminders.push({
              id: `lair_${creature.id}_${Date.now()}`,
              content: lairContent,
              type: 'lair_actions',
              urgency: 'critical',
              displayDuration: 8000,
              position: 'turn-panel',
              timing: 'immediate',
              dismissible: true,
              isVisible: true,
              startTime: Date.now()
            })
          }
        })
      }

      // 2. CURRENT CREATURE'S TURN - Start of turn abilities
      const currentTurnCreature = combatants[turnIndex]
      if (currentTurnCreature) {
        const startOfTurnLines: string[] = []

        // Conditions
        if (currentTurnCreature.conditions && currentTurnCreature.conditions.length > 0) {
          currentTurnCreature.conditions.forEach(condition => {
            const conditionName = typeof condition === 'object' ? condition.name : condition
            startOfTurnLines.push(`${conditionName} condition active`)
          })
        }

        // Concentration
        if (currentTurnCreature.concentratingOn) {
          startOfTurnLines.push(`Concentrating on ${currentTurnCreature.concentratingOn}`)
        }

        // Special Abilities - simplified
        if (currentTurnCreature.specialAbilities && currentTurnCreature.specialAbilities.length > 0) {
          currentTurnCreature.specialAbilities.forEach(ability => {
            const name = ability.name.toLowerCase()
            if (name.includes('regenerat')) {
              startOfTurnLines.push(`Regeneration: heals at start of turn`)
            } else if (name.includes('legendary resistance')) {
              startOfTurnLines.push(`Legendary Resistance available`)
            } else if (name.includes('magic resistance')) {
              startOfTurnLines.push(`Magic Resistance: advantage on saves`)
            } else {
              startOfTurnLines.push(`${ability.name}: special ability active`)
            }
          })
        }

        // Important Actions - simplified
        if (currentTurnCreature.actions && currentTurnCreature.actions.length > 0) {
          currentTurnCreature.actions.forEach(action => {
            const name = action.name.toLowerCase()
            const desc = action.description.toLowerCase()

            if (desc.includes('recharge')) {
              startOfTurnLines.push(`${action.name}: recharge ability available`)
            } else if (name.includes('multiattack')) {
              startOfTurnLines.push(`Multiattack: can make multiple attacks`)
            }
          })
        }

        // Legendary Actions Reset
        if (currentTurnCreature.legendaryActions && currentTurnCreature.legendaryActions.length > 0) {
          startOfTurnLines.push(`Legendary Actions: 3 actions reset`)
        }

        // Create start-of-turn card if there's content
        if (startOfTurnLines.length > 0) {
          const startTurnContent = `**${currentTurnCreature.name}** ${currentTurnCreature.isPC ? '(PC)' : '(NPC)'} - Turn ${turnIndex + 1}\n\n**Special Abilities:**\n${startOfTurnLines.join('\n')}`

          newReminders.push({
            id: `start_turn_${currentTurnCreature.id}_${Date.now()}`,
            content: startTurnContent,
            type: 'start_of_turn',
            urgency: 'medium',
            displayDuration: 8000,
            position: 'turn-panel',
            timing: 'immediate',
            dismissible: true,
            isVisible: true,
            startTime: Date.now()
          })
        }
      }

      // 3. LEGENDARY ACTIONS - Check ALL creatures with legendary actions (except current creature)
      combatants.forEach(creature => {
        const isCurrentCreature = creature.id === currentTurnCreature?.id

        if (!isCurrentCreature && creature.legendaryActions && creature.legendaryActions.length > 0) {
          const actionCount = creature.legendaryActionsRemaining || 3
          const legendaryContent = `**${creature.name}** (NPC) - Turn ${turnIndex + 1}\n\n**Special Abilities:**\nLegendary Actions: ${actionCount} remaining\nCan use between other turns`

          newReminders.push({
            id: `legendary_${creature.id}_${Date.now()}`,
            content: legendaryContent,
            type: 'legendary_actions',
            urgency: 'high',
            displayDuration: 8000,
            position: 'turn-panel',
            timing: 'immediate',
            dismissible: true,
            isVisible: true,
            startTime: Date.now()
          })
        }
      })

      console.log('✅ Generated', newReminders.length, 'simple AI reminders')
      setAiReminders(newReminders)

    } catch (error) {
      console.error('❌ Error generating simple AI reminders:', error)
      setAiReminders([])
    } finally {
      setIsGeneratingReminders(false)
    }
  }, [combatants, showReminders])

  // Update reminders when combatants change or reminders setting changes
  useEffect(() => {
    console.log('📱 useEffect triggered - AI mode:', isAiReminderMode, 'showReminders:', showReminders)
    if (isAiReminderMode) {
      generateSimpleAIReminders(currentTurn, round)
    } else {
      updateReminders(currentTurn, round)
    }
  }, [combatants, showReminders, currentTurn, round, isAiReminderMode, generateSimpleAIReminders])

  const saveEncounter = () => {
    if (!saveEncounterName.trim()) return

    const savedEncounter: SavedEncounterType = {
      id: Date.now().toString(),
      name: saveEncounterName.trim(),
      combatants,
      round,
      currentTurn,
      notes: encounterNotes,
      savedAt: new Date().toISOString()
    }

    setSavedEncounters(prev => [...prev, savedEncounter])
    setShowSaveDialog(false)
    setSaveEncounterName('')
  }

  const loadSavedEncounter = (encounter: SavedEncounterType) => {
    loadEncounter(encounter)
    setShowLoadDialog(false)
  }

  const deleteEncounter = (encounterId: string) => {
    setSavedEncounters(prev => prev.filter(enc => enc.id !== encounterId))
  }

  const rollAllInitiativeHandler = () => {
    const updatedCombatants = rollAllInitiative(combatants);
    setCombatants(updatedCombatants);
  };

  const sortByInitiativeHandler = () => {
    const sortedCombatants = sortByInitiative(combatants);
    setCombatants(sortedCombatants);
    setCurrentTurn(0);
  };

  const nextTurn = () => {
    if (combatants.length === 0) return
    let nextIndex = currentTurn + 1
    let nextRound = round
    if (nextIndex >= combatants.length) {
      nextIndex = 0
      nextRound = round + 1
      setRound(nextRound)
    }

    // Update combatant state when it becomes their turn
    setCombatants(prev => prev.map((combatant, index) => {
      if (index === nextIndex) {
        // Reset legendary actions at start of creature's turn
        let updates: Partial<Combatant> = {}
        if (combatant.legendaryActions && combatant.legendaryActions.length > 0) {
          updates.legendaryActionsRemaining = 3
        }

        // Process recharge abilities (generalizable for any creature)
        const { combatant: updatedCombatant, messages } = processRechargeRolls(combatant)

        // Log recharge messages
        messages.forEach(message => console.log(message))

        return { ...updatedCombatant, ...updates }
      }
      return combatant
    }))

    setCurrentTurn(nextIndex)

    // Update reminders after turn change
    if (isAiReminderMode) {
      generateSimpleAIReminders(nextIndex, nextRound)
    } else {
      updateReminders(nextIndex, nextRound)
    }

    // Trigger store nextTurn to handle auto-collapse
    storeNextTurn()
  }

  // Legendary action reminders function - shows after any creature's turn ends
  const updateLegendaryActionReminders = () => {
    console.log('🦁 updateLegendaryActionReminders called')

    if (!showReminders) {
      console.log('⚠️ Reminders disabled')
      return
    }

    // Find all legendary creatures that have remaining legendary actions
    const legendaryCreatureReminders = combatants
      .filter(creature =>
        creature.legendaryActions &&
        creature.legendaryActions.length > 0 &&
        (creature.legendaryActionsRemaining || 3) > 0
      )
      .map(creature => ({
        id: `legendary_${creature.id}_${Date.now()}`,
        content: `🦁 **${creature.name}** can use legendary actions (${creature.legendaryActionsRemaining || 3}/3 remaining)\n\nLegendary Actions:\n${creature.legendaryActions?.map(action => `• ${action.name} (${action.cost || 1} action${(action.cost || 1) > 1 ? 's' : ''}): ${action.description}`).join('\n') || ''}`,
        type: 'legendary_actions' as const,
        urgency: 'medium' as const,
        displayDuration: 10000,
        position: 'turn-panel' as const,
        timing: 'immediate' as const,
        dismissible: true,
        isVisible: true,
        startTime: Date.now()
      }))

    if (legendaryCreatureReminders.length > 0) {
      console.log('✅ Adding', legendaryCreatureReminders.length, 'legendary action reminders')
      setAiReminders(prev => [...prev, ...legendaryCreatureReminders])
    } else {
      console.log('💭 No legendary creatures with remaining actions found')
    }
  }

  // AI-powered reminder update function
  // Helper function to convert static reminders to AI-enhanced content
  const generateEnhancedReminderContent = (reminder: any, creature: Combatant, turnIndex: number): string => {
    const header = `**${creature.name}** (${creature.isPC ? 'PC' : 'NPC'}) - Round ${currentRound}`
    const content = `**Special Abilities:**\n${reminder.name}: ${reminder.description}`
    return `${header}\n\n${content}`
  }

  // Basic reminder update function (fallback)
  const updateReminders = (turnIndex: number, currentRound: number) => {
    if (!showReminders || combatants.length === 0) {
      setActiveReminders([])
      return
    }

    const currentCreature = getCurrentCreature(combatants, turnIndex)
    if (!currentCreature) {
      setActiveReminders([])
      return
    }

    const initiative = currentCreature.initiative

    // Check for lair actions first (highest priority) - at top of round
    const lairCreatures = checkForLairActions(initiative, combatants)
    if (lairCreatures.length > 0) {
      setActiveReminders(lairCreatures)
      return
    }

    // Check for creature-specific reminders
    if (hasActiveReminders(currentCreature, turnIndex, initiative, combatants)) {
      setActiveReminders([currentCreature])
    } else {
      // Check for legendary actions for other creatures
      const legendaryCreatures = combatants.filter(creature =>
        creature.id !== currentCreature.id && hasActiveReminders(creature, turnIndex, initiative, combatants)
      )
      if (legendaryCreatures.length > 0) {
        setActiveReminders(legendaryCreatures.slice(0, 1)) // Show only one at a time
      } else {
        setActiveReminders([])
      }
    }
  }

  const openHPModal = (combatant: Combatant, event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect()
    setModalPosition({
      x: rect.left,
      y: rect.bottom
    })
    setHpModalCombatant(combatant)
    setShowHPModal(true)
  }

  const updateCombatantHP = (id: string, newHp: number, newMaxHp: number, newTempHp?: number) => {
    setCombatants(prev => prev.map(c =>
      c.id === id ? {
        ...c,
        hp: parseInt(String(newHp)) || 0,
        maxHp: parseInt(String(newMaxHp)) || 0,
        tempHp: parseInt(String(newTempHp)) || 0
      } : c
    ))
  }

  const addCreatureFromDatabase = (creature: any) => {
    console.log('🔄 addCreatureFromDatabase called with:', creature);
    console.log('🔍 creature.abilities:', creature.abilities);
    console.log('🔍 creature.actions:', creature.actions);

    // If the creature already has a full Combatant structure (from imports), use it
    // Otherwise, build a basic one for simple database creatures
    let newCreature: Combatant = creature.id ? {
      // This is a fully imported creature, preserve all data
      ...creature,
      id: Date.now().toString() + Math.random(), // Generate new ID
      initiative: 0, // Reset initiative
      conditions: creature.conditions || [] // Ensure conditions array exists
    } : {
      // This is a simple database creature, build basic structure
      id: Date.now().toString() + Math.random(),
      name: creature.name,
      hp: creature.hp,
      maxHp: creature.hp || creature.maxHp,
      ac: creature.ac,
      initiative: 0,
      isPC: false,
      conditions: [],
      cr: creature.cr,
      type: creature.type,
      environment: creature.environment,
      xp: creature.xp,
      tempHp: 0
    }

    // Apply generalizable ability parsing to detect recharge abilities
    newCreature = initializeRechargeAbilities(newCreature)

    console.log('✅ Created newCreature:', newCreature);
    console.log('✅ newCreature.abilities:', newCreature.abilities);
    console.log('✅ newCreature.actions:', newCreature.actions);
    console.log('✅ newCreature.rechargeAbilities:', newCreature.rechargeAbilities);

    setCombatants(prev => [...prev, newCreature])
  }

  const addPC = (pcData: any) => {
    const newPC: Combatant = {
      id: Date.now().toString() + Math.random(),
      ...pcData,
      initiative: 0,
      conditions: [],
      tempHp: 0
    }
    setCombatants(prev => [...prev, newPC])
  }

  const addCreatureFromModal = (creatureData: any) => {
    let newCreature: Combatant = {
      id: Date.now().toString() + Math.random(),
      ...creatureData,
      conditions: [],
      tempHp: creatureData.tempHp || 0
    }

    // Apply generalizable ability parsing to detect recharge abilities
    newCreature = initializeRechargeAbilities(newCreature)

    setCombatants(prev => [...prev, newCreature])
  }

  const updateCreature = (id: string, field: keyof Combatant, value: any) => {
    setCombatants(prev => prev.map(c =>
      c.id === id ? { ...c, [field]: value } : c
    ))
  }

  const removeCreature = (id: string) => {
    setCombatants(prev => prev.filter(c => c.id !== id))
    if (selectedCombatant?.id === id) {
      setStoreSelectedCombatant(null)
    }
  }

  const addCondition = (combatantId: string, conditionName: string) => {
    setCombatants(prev => prev.map(c =>
      c.id === combatantId 
        ? { ...c, conditions: [...c.conditions, { name: conditionName }] }
        : c
    ))
  }

  const removeCondition = (combatantId: string, conditionIndex: number) => {
    setCombatants(prev => prev.map(c =>
      c.id === combatantId 
        ? { ...c, conditions: c.conditions.filter((_, i) => i !== conditionIndex) }
        : c
    ))
  }

  const handleCombatantClick = (combatant: Combatant) => {
    setViewingCreature(null) // Clear any temp viewing creature
    setStoreSelectedCombatant(selectedCombatantId === combatant.id ? null : combatant.id)
  }

  const loadEncounter = (encounter: SavedEncounterType) => {
    // Ensure all numeric values are properly parsed when loading
    const fixedCombatants = encounter.combatants.map(c => {
      let combatant: Combatant = {
        ...c,
        hp: parseInt(String(c.hp)) || 0,
        maxHp: parseInt(String(c.maxHp)) || 0,
        ac: parseInt(String(c.ac)) || 0,
        initiative: parseInt(String(c.initiative)) || 0,
        tempHp: parseInt(String(c.tempHp)) || 0,
        level: c.level ? parseInt(String(c.level)) : undefined,
        xp: c.xp ? parseInt(String(c.xp)) : undefined
      }

      // Apply generalizable ability parsing to detect recharge abilities if not already present
      if (!combatant.rechargeAbilities || combatant.rechargeAbilities.length === 0) {
        combatant = initializeRechargeAbilities(combatant)
      }

      return combatant
    })

    setCombatants(fixedCombatants)
    setRound(parseInt(String(encounter.round)) || 1)
    setCurrentTurn(parseInt(String(encounter.currentTurn)) || 0)
    setEncounterNotes(encounter.notes)
    setEncounterName(encounter.name)
    setStoreSelectedCombatant(null)
  }

  const difficultyData = calculateDifficulty(combatants)

  return (
    <div className="flex h-screen bg-dnd-primary">
      {/* Left Sidebar */}
      <div className={`${leftSidebarCollapsed ? 'w-12' : 'w-80'} sidebar-dnd flex flex-col transition-all duration-1000 overflow-hidden`}>
        <Sidebar title="⚔️ Encounter Builder" collapsed={leftSidebarCollapsed} onToggle={toggleLeftSidebar}>
          <div className="space-y-4">
            {/* Difficulty Display */}
            <div className="card-dnd p-4">
              <div className="text-sm font-medium text-dnd-secondary mb-2 flex items-center gap-2">
                <Swords className="w-4 h-4" />
                Encounter Difficulty
              </div>
              <div className={`text-2xl font-bold mb-1 difficulty-${difficultyData.difficulty}`}>
                {difficultyData.difficulty.charAt(0).toUpperCase() + difficultyData.difficulty.slice(1)}
              </div>
              <div className="text-xs text-dnd-muted">{difficultyData.xp} XP Total</div>
            </div>

            <CreatureBrowser
              onAddCreature={addCreatureFromDatabase}
              onShowStatBlock={(creature) => {
                // Create a temporary combatant for stat block viewing without adding to encounter
                const tempCombatant: Combatant = creature.id ? {
                  ...creature,
                  id: `temp-${Date.now()}`,
                  initiative: 0,
                  conditions: creature.conditions || []
                } : {
                  id: `temp-${Date.now()}`,
                  name: creature.name,
                  hp: creature.hp || 1,
                  maxHp: creature.maxHp || creature.hp || 1,
                  ac: creature.ac || 10,
                  initiative: 0,
                  isPC: false,
                  conditions: [],
                  cr: creature.cr || '1',
                  type: creature.type || 'unknown',
                  tempHp: 0
                };
                setViewingCreature(tempCombatant);
                setStoreSelectedCombatant(`temp-${Date.now()}`);
                // Open right panel if it's collapsed
                if (rightPanelCollapsed) {
                  toggleRightPanel();
                }
              }}
            />
          </div>
        </Sidebar>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="header-dnd p-4">
          <div className="flex items-center justify-between mb-4">
            <SaveLoadManager
              combatants={combatants}
              round={round}
              currentTurn={currentTurn}
              encounterNotes={encounterNotes}
              encounterName={encounterName}
              onLoad={loadEncounter}
              onEncounterNameChange={setEncounterName}
              onShowSaveDialog={() => {
                setSaveEncounterName(encounterName)
                setShowSaveDialog(true)
              }}
              onShowLoadDialog={() => setShowLoadDialog(true)}
            />
            <div className="text-lg font-semibold text-dnd-primary flex items-center gap-2">
              🎲 Round {round}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button onClick={rollAllInitiativeHandler} className="btn-dnd btn-dnd-warning flex items-center gap-1 px-2 py-1 text-sm">
              <Dice1 className="w-3 h-3" />
              Roll All
            </button>
            <button onClick={sortByInitiativeHandler} className="btn-dnd btn-dnd-primary flex items-center gap-1 px-2 py-1 text-sm">
              Sort Initiative
            </button>
            <button onClick={nextTurn} className="btn-dnd btn-dnd-warning flex items-center gap-1 px-2 py-1 text-sm" disabled={combatants.length === 0}>
              <Play className="w-3 h-3" />
              Next Turn
            </button>
            <button onClick={() => { setRound(1); setCurrentTurn(0); setActiveReminders([]); setAiReminders([]) }} className="btn-dnd btn-dnd-secondary flex items-center gap-1 px-2 py-1 text-sm">
              Reset
            </button>
            <button
              onClick={() => setShowReminders(!showReminders)}
              className={`px-2 py-1 text-sm rounded-lg flex items-center gap-1 transition-colors ${
                showReminders ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
              title="Toggle DM Reminders"
            >
              <Lightbulb className="w-3 h-3" />
              DM Reminders
            </button>
            <button
              onClick={() => {
                console.log('🔄 Toggling AI mode from', isAiReminderMode, 'to', !isAiReminderMode)
                setIsAiReminderMode(!isAiReminderMode)
              }}
              className={`px-2 py-1 text-sm rounded-lg flex items-center gap-1 transition-colors ${
                isAiReminderMode ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
              title={`Toggle AI-Assisted Reminders (Currently: ${isAiReminderMode ? 'AI' : 'Basic'})`}
            >
              🤖
              {isAiReminderMode ? 'AI Mode' : 'Basic Mode'}
            </button>
          </div>
        </div>


        {/* Initiative List */}
        <div className="flex-1 overflow-y-auto p-4 scrollbar-dnd">
          {/* DM Reminder Cards */}
          {showReminders && isAiReminderMode && (
            <>
              {console.log('🖥️ Rendering AI reminders:', {
                showReminders,
                isAiReminderMode,
                aiRemindersLength: aiReminders.length,
                isGenerating: isGeneratingReminders
              })}

              {/* Loading indicator */}
              {isGeneratingReminders && (
                <div className="card-dnd mb-2 border-l-4 border-blue-500 bg-blue-50">
                  <div className="px-2 py-1 text-xs text-blue-700 flex items-center gap-2">
                    <div className="animate-spin w-3 h-3 border border-blue-600 border-t-transparent rounded-full"></div>
                    Generating AI reminders...
                  </div>
                </div>
              )}

              {/* Reminder cards */}
              {aiReminders.map(reminder => {
                console.log('🎴 Rendering individual reminder card:', reminder.id, reminder.type)
                return (
                  <AIReminderCard
                    key={reminder.id}
                    reminder={reminder}
                    onDismiss={() => setAiReminders(prev => prev.filter(r => r.id !== reminder.id))}
                  />
                )
              })}
            </>
          )}

          {showReminders && !isAiReminderMode && activeReminders.map(creature => (
            <DMReminderCard
              key={`reminder-${creature.id}`}
              creature={creature}
              currentTurn={currentTurn}
              round={round}
              initiative={creature.initiative}
              onDismiss={() => setActiveReminders(prev => prev.filter(c => c.id !== creature.id))}
              allCombatants={combatants}
            />
          ))}

          <div className="space-y-2">
            {combatants.map((combatant, index) => (
              <CombatCard
                key={combatant.id}
                combatant={combatant}
                index={index}
                currentTurn={currentTurn}
                onUpdateCreature={updateCreature}
                onRemoveCreature={removeCreature}
                onAddCondition={addCondition}
                onRemoveCondition={removeCondition}
                onOpenHPModal={openHPModal}
                onHandleCombatantClick={handleCombatantClick}
                onRollInitiative={rollInitiative}
                selectedCombatant={selectedCombatant}
              />
            ))}
          </div>

          {combatants.length === 0 && (
            <div className="text-center text-dnd-muted py-16">
              <div className="text-4xl mb-4">⚔️</div>
              <p className="text-lg">No combatants added yet</p>
              <p className="text-sm">Click the + button below to add combatants</p>
            </div>
          )}

          {/* Add Combatant Button */}
          <div className="text-center pt-4">
            <button
              onClick={() => setShowQuickAddModal(true)}
              className="btn-dnd btn-dnd-success px-6 py-3 text-lg flex items-center gap-2 mx-auto"
              title="Add new combatant"
            >
              <Plus className="w-5 h-5" />
              Add Combatant
            </button>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <EnhancedRightPanel
        collapsed={rightPanelCollapsed}
        onToggle={toggleRightPanel}
        selectedCombatant={selectedCombatant}
        encounterNotes={encounterNotes}
        onNotesChange={setEncounterNotes}
        onSelectCombatant={(combatant) => {
          setViewingCreature(null) // Clear any temp viewing creature
          setStoreSelectedCombatant(combatant?.id || null)
        }}
      />

      {/* Modals */}
      <QuickAddModal
        isOpen={showQuickAddModal}
        onClose={() => setShowQuickAddModal(false)}
        onAddCreature={addCreatureFromModal}
      />

      {hpModalCombatant && (
        <HPModal
          isOpen={showHPModal}
          onClose={() => {
            setShowHPModal(false)
            setHpModalCombatant(null)
            setModalPosition(null)
          }}
          combatant={hpModalCombatant}
          onUpdateHP={updateCombatantHP}
          position={modalPosition}
        />
      )}

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 flex items-center justify-center z-[9999] bg-black bg-opacity-70 backdrop-blur-sm">
          <div className="bg-white border border-gray-300 rounded-lg p-6 w-96 mx-4 shadow-2xl">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Save Encounter</h3>
            <input
              type="text"
              placeholder="Enter encounter name..."
              value={saveEncounterName}
              onChange={(e) => setSaveEncounterName(e.target.value)}
              className="w-full bg-gray-50 text-gray-900 px-3 py-2 mb-4 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowSaveDialog(false)
                  setSaveEncounterName('')
                }}
                className="btn-dnd btn-dnd-secondary px-4 py-2 rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveEncounter}
                disabled={!saveEncounterName.trim()}
                className="btn-dnd btn-dnd-primary px-4 py-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Load Dialog */}
      {showLoadDialog && (
        <div className="fixed inset-0 flex items-center justify-center z-[9999] bg-black bg-opacity-70 backdrop-blur-sm">
          <div className="bg-white border border-gray-300 rounded-lg p-6 w-96 max-h-96 overflow-hidden mx-4 shadow-2xl">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Load Encounter</h3>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {savedEncounters.length === 0 ? (
                <div className="text-gray-500 text-center py-8">No saved encounters</div>
              ) : (
                savedEncounters.map((encounter) => (
                  <div key={encounter.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{encounter.name}</div>
                      <div className="text-sm text-gray-600">
                        {encounter.combatants.length} combatants • Round {encounter.round} • {new Date(encounter.savedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => loadSavedEncounter(encounter)}
                        className="btn-dnd btn-dnd-primary px-2 py-1 text-sm rounded transition-colors"
                      >
                        Load
                      </button>
                      <button
                        onClick={() => deleteEncounter(encounter.id)}
                        className="btn-dnd btn-dnd-danger px-2 py-1 text-sm rounded transition-colors"
                        title="Delete encounter"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowLoadDialog(false)}
                className="btn-dnd btn-dnd-secondary px-4 py-2 rounded transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App