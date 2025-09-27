# Smart AI Reminder System Architecture

## Overview

This document outlines the completely refactored AI reminder system that fixes the core architectural issues and provides a proper D&D 5e compliant reminder system for encounter management.

## Core Problems Solved

### 1. **Hardcoded Content Issue** ✅ FIXED
- **Before**: `content: "Lair Actions: Environmental effects"` (hardcoded)
- **After**: Parses actual creature abilities using `CreatureAbilityParser`

### 2. **Incorrect Initiative Timing** ✅ FIXED
- **Before**: No proper D&D initiative order handling
- **After**: `InitiativeTimingEngine` handles proper D&D 5e timing rules

### 3. **Poor Data Parsing** ✅ FIXED
- **Before**: `hasLegendaryActions = currentCreature.legendaryActions?.length > 0`
- **After**: Comprehensive parsing of all creature abilities with proper typing

### 4. **Not Generalizable** ✅ FIXED
- **Before**: Won't work for different creatures
- **After**: Works for any creature with any combination of abilities

## New Architecture Components

### 1. CreatureAbilityParser (`utils/CreatureAbilityParser.ts`)

**Purpose**: Parse creature stat blocks into structured, actionable data

**Features**:
- Parses lair actions (always initiative 20)
- Extracts legendary actions with proper costs
- Identifies turn start/end abilities
- Detects death triggers and special effects
- Handles recharge abilities (breath weapons, etc.)
- Processes regeneration abilities

**Example Usage**:
```typescript
const parsedAbilities = CreatureAbilityParser.parseCreatureAbilities(creature)
// Returns structured data instead of raw text
```

### 2. InitiativeTimingEngine (`utils/InitiativeTimingEngine.ts`)

**Purpose**: Handle proper D&D 5e initiative timing and reminder triggers

**D&D Rules Implemented**:
- **Lair Actions**: Always initiative 20, lose ties
- **Legendary Actions**: After non-legendary creature turns only
- **Turn Order**: Proper initiative sorting with tie-breakers
- **Timing Windows**: Precise reminder timing based on initiative

**Example Usage**:
```typescript
// Check if it's time for lair actions
const isLairTime = InitiativeTimingEngine.isLairActionTime(context, 20)

// Get reminders for specific initiative
const reminders = InitiativeTimingEngine.getRemindersForInitiative(context, 20)
```

### 3. SmartReminderEngine (`engine/SmartReminderEngine.ts`)

**Purpose**: Generate contextual, properly timed reminders using parsed abilities

**Features**:
- Uses parsed creature data instead of hardcoded content
- Respects D&D initiative timing rules
- Generates AI or structured reminders
- Proper reminder grouping and sorting
- Extensible for different reminder types

**Example Usage**:
```typescript
// Generate all reminders for current context
const reminders = await SmartReminderEngine.generateReminders(context, {
  useAI: true,
  enablePredictive: true,
  reminderTypes: ['turn_start', 'legendary_actions', 'lair_actions'],
  groupByType: true
})
```

## D&D 5e Rules Compliance

### Lair Actions
- **Timing**: Initiative count 20 (loses ties)
- **Frequency**: Once per round
- **Triggers**: Only when creature is in its lair
- **Implementation**: `InitiativeTimingEngine.isLairActionTime()`

### Legendary Actions
- **Timing**: At the end of another creature's turn
- **Restrictions**: Only after non-legendary creatures (or PCs)
- **Resource**: 3 legendary actions per round, reset at start of creature's turn
- **Implementation**: `InitiativeTimingEngine.isLegendaryActionTime()`

### Turn Structure
- **Turn Start**: Regeneration, condition effects, special abilities
- **Turn Actions**: Parsed from creature actions
- **Turn End**: End-of-turn effects, condition duration decrements

## Integration Examples

### Basic Usage

```typescript
import { SmartReminderEngine } from '../engine/SmartReminderEngine'
import { ContextAnalyzer } from '../utils/ContextAnalyzer'

// Convert combat state to encounter context
const context = ContextAnalyzer.combatStateToContext(combatState)

// Generate smart reminders
const reminders = await SmartReminderEngine.generateReminders(context, {
  useAI: true,
  reminderTypes: ['turn_start', 'legendary_actions', 'lair_actions']
})

// Display reminders grouped by type
const grouped = SmartReminderEngine.groupRemindersByType(reminders)
```

### Initiative-Specific Reminders

```typescript
// Generate reminders for lair actions (initiative 20)
const lairReminders = await SmartReminderEngine.generateRemindersForInitiative(
  context,
  20,
  { reminderTypes: ['lair_actions'] }
)

// Check if legendary actions should trigger
const currentCreature = context.creatures[context.currentTurn]
if (InitiativeTimingEngine.isLegendaryActionTime(context, currentCreature.id)) {
  const legendaryReminders = await SmartReminderEngine.generateReminders(context, {
    reminderTypes: ['legendary_actions']
  })
}
```

### Creature Ability Analysis

```typescript
import { CreatureAbilityParser } from '../utils/CreatureAbilityParser'

// Parse all abilities from a creature
const abilities = CreatureAbilityParser.parseCreatureAbilities(creature)

// Check specific ability types
if (abilities.lairActions.length > 0) {
  console.log('Creature has lair actions:', abilities.lairActions)
}

if (abilities.deathTriggers.length > 0) {
  console.log('Creature has death triggers:', abilities.deathTriggers)
}

// Check regeneration
abilities.regenerationAbilities.forEach(regen => {
  if (regen.triggersOnTurnStart) {
    console.log(`Regenerates ${regen.healingAmount} HP at turn start`)
  }
})
```

## Comparison: Before vs After

### Before (Hardcoded System)

```typescript
// BAD: Hardcoded content
content: `**${currentCreature.name}** (NPC) - Turn ${turnIndex + 1}

**Special Abilities:**
Lair Actions: Environmental effects`

// BAD: Not using actual creature data
const hasLegendaryActions = currentCreature.legendaryActions?.length > 0
```

### After (Smart System)

```typescript
// GOOD: Uses parsed abilities
const parsedAbilities = CreatureAbilityParser.parseCreatureAbilities(creature)

// GOOD: Generates contextual content
const content = parsedAbilities.lairActions
  .map(action => `${action.name}: ${action.environmentalEffect}`)
  .join('\n')

// GOOD: Proper D&D timing
if (InitiativeTimingEngine.isLairActionTime(context, 20)) {
  // Generate lair action reminders
}
```

## Performance Considerations

### Caching
- Parsed abilities are cached per creature
- Initiative order calculated once per round
- AI reminders cached by context hash

### Background Processing
- Pre-generate reminders for upcoming turns
- Predictive analysis for likely events
- Lazy loading of non-critical reminders

### Memory Management
- Cleanup old reminders automatically
- Limit reminder history
- Efficient data structures for large encounters

## Future Enhancements

### Phase 2 Features
1. **Spell Tracking**: Concentration, spell slots, durations
2. **Environmental Effects**: Dynamic terrain, weather, hazards
3. **Combat Statistics**: Damage tracking, action economy analysis
4. **AI Learning**: Improve suggestions based on DM preferences

### Phase 3 Features
1. **Multi-Encounter Tracking**: Campaign-level reminders
2. **Custom Rules**: House rules and variant systems
3. **Player Integration**: PC-specific reminders and suggestions
4. **Advanced AI**: Natural language processing for complex abilities

## Testing Strategy

### Unit Tests
- `CreatureAbilityParser`: Test parsing different creature types
- `InitiativeTimingEngine`: Verify D&D timing rules
- `SmartReminderEngine`: Test reminder generation logic

### Integration Tests
- Full reminder workflow
- Error handling and fallbacks
- Performance with large encounters

### User Acceptance Tests
- DM workflow scenarios
- Real encounter testing
- Accessibility and usability

## Migration Guide

### From Old System
1. Replace hardcoded reminder generation with `SmartReminderEngine`
2. Update timing logic to use `InitiativeTimingEngine`
3. Parse creature abilities with `CreatureAbilityParser`
4. Use proper D&D initiative order

### Breaking Changes
- Reminder timing now follows D&D rules strictly
- Content format changed from hardcoded to dynamic
- New reminder types and categories
- Different reminder IDs and context structure

## Conclusion

The new Smart AI Reminder System provides:

1. **Proper D&D 5e Compliance**: Follows official timing rules
2. **Actual Creature Data**: Parses real abilities instead of hardcoded text
3. **Generalizable Architecture**: Works with any creature and abilities
4. **Intelligent Grouping**: Organizes reminders like the working static system
5. **Extensible Design**: Easy to add new reminder types and features

This architecture solves all the identified issues while maintaining the performance and user experience expectations of a modern D&D encounter management tool.