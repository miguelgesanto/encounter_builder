# Combat Tracker Feature

## 🎯 Overview

The **Combat Tracker** feature module handles individual combatant management, HP tracking, condition application, and combat-specific UI components for D&D 5e encounters. This module was extracted from the original monolithic App.tsx to provide focused, reusable combat management functionality.

## 📂 Module Structure

```
features/combat-tracker/
├── components/              # UI components for combat tracking
│   ├── CombatCard.tsx             # Individual combatant display card
│   ├── ConditionsTracker.tsx      # Condition management interface
│   ├── HPModal.tsx               # HP/damage management modal
│   ├── CombatantList.tsx         # List of all combatants
│   └── CombatStats.tsx           # Combat statistics display
├── hooks/                   # Feature-specific hooks
│   ├── useCombatants.ts          # Combatant state management
│   ├── useConditionManager.ts    # D&D 5e condition logic
│   ├── useHPManager.ts           # HP/damage/healing logic
│   └── useCombatValidation.ts    # Input validation for combat data
├── stores/                  # Feature-specific state
│   └── combatStore.ts            # Zustand store for combat state
├── types/                   # Feature-specific TypeScript types
│   └── combat.ts                 # Combat-related type definitions
├── utils/                   # Feature-specific utilities
│   ├── hpCalculator.ts           # HP damage/healing calculations
│   └── conditionEffects.ts      # D&D 5e condition effect logic
├── index.ts                # Feature module exports
└── README.md               # This file
```

## 🚀 What Has Been Done

### ✅ Architecture Refactoring
- **✅ Feature Extraction**: Isolated combat tracking logic from monolithic App.tsx
- **✅ Component Modularity**: Split combat functionality into focused components
- **✅ UI/UX Fixes**: Fixed removal button icon from ⚔️ to ✕ (cross)
- **✅ Type Safety**: Created combat-specific TypeScript interfaces
- **✅ Performance**: Optimized with React.memo and proper event handling

### ✅ UI/UX Improvements from Original Design
- **✅ Icon Fix**: Changed removal buttons from ⚔️ (sword) to ✕ (cross) as requested
- **✅ Button Positioning**: Maintained preferred button layouts and positions
- **✅ Adventure Theme**: Enhanced adventure aesthetic with consistent gradients
- **✅ Accessibility**: Added ARIA labels, keyboard navigation, and screen reader support
- **✅ Input Validation**: Real-time validation with error messaging
- **✅ Turn Highlighting**: Improved current turn visual indicators

## 🏗️ Component Architecture

### Primary Components

#### `CombatCard.tsx` ✅ IMPLEMENTED
**Purpose**: Individual combatant display with all combat-relevant information
**Status**: **COMPLETE** - Fully implemented with UI improvements
**Props**:
```typescript
interface CombatCardProps {
  combatant: Combatant;
  isCurrentTurn: boolean;
  onUpdateCombatant: (id: string, field: keyof Combatant, value: any) => void;
  onRemoveCombatant: (id: string) => void;
  onAddCondition: (combatantId: string, condition: string) => void;
  onRemoveCondition: (combatantId: string, conditionIndex: number) => void;
  onOpenHPModal: (combatant: Combatant, event: React.MouseEvent) => void;
  onRollInitiative: (id: string) => void;
  onClick: (combatant: Combatant) => void;
  isSelected?: boolean;
}
```

**Key Features Implemented**:
- ✅ Initiative display and editing with validation
- ✅ Name editing with character limits
- ✅ HP display with modal trigger for detailed management  
- ✅ AC editing with validation
- ✅ Condition tracking integration
- ✅ PC vs Monster visual distinction (level vs CR badges)
- ✅ Current turn highlighting with glow effects
- ✅ **FIXED**: Remove button uses ✕ instead of ⚔️
- ✅ Accessibility with ARIA labels and keyboard navigation

#### `ConditionsTracker.tsx`
**Purpose**: D&D 5e condition management interface
**Status**: Not implemented
**Tasks**:
- Condition dropdown with D&D 5e condition list
- Condition application and removal
- Condition effect tooltips and explanations
- Duration tracking (future enhancement)

#### `HPModal.tsx`
**Purpose**: Detailed HP management with damage/healing interface
**Status**: Not implemented
**Tasks**:
- Current/max/temporary HP display
- Quick damage/healing buttons
- Custom damage/healing input
- Death saving throw tracking
- HP history log

### Custom Hooks

#### `useCombatants.ts`
**Purpose**: Central combatant state management
**Status**: Not implemented
**Returns**:
```typescript
interface CombatantsState {
  combatants: Combatant[];
  addCombatant: (combatant: Combatant) => void;
  removeCombatant: (id: string) => void;
  updateCombatant: (id: string, field: keyof Combatant, value: any) => void;
  getCombatantById: (id: string) => Combatant | undefined;
  validateCombatant: (combatant: Combatant) => ValidationResult;
}
```

#### `useConditionManager.ts`
**Purpose**: D&D 5e condition logic and effects
**Status**: Not implemented
**Features**:
- Condition application and removal
- Automatic condition effect calculation
- Condition duration tracking
- Condition interaction rules (e.g., unconscious includes incapacitated)

## 🎯 What Needs to be Done

### 🚧 Priority 1: Complete Core Components

#### ❌ ConditionsTracker.tsx
- **Status**: Not implemented
- **Dependencies**: D&D 5e condition data, useConditionManager hook
- **Tasks**:
  - Condition dropdown with search/filter
  - Condition pill display with remove buttons
  - Condition tooltips with rule explanations
  - Visual styling for harmful vs beneficial conditions

#### ❌ HPModal.tsx
- **Status**: Not implemented
- **Dependencies**: useHPManager hook
- **Tasks**:
  - Modal positioning and responsive design
  - Quick damage buttons (1, 5, 10, etc.)
  - Custom damage/healing input fields
  - Temporary HP management
  - Death saving throw interface

### 🚧 Priority 2: Hook Implementation

#### ❌ useCombatants.ts
- **Status**: Not implemented
- **Tasks**:
  - Combatant CRUD operations with validation
  - State synchronization with encounter store
  - Performance optimization with React.memo patterns
  - Error handling and validation feedback

#### ❌ useConditionManager.ts
- **Status**: Not implemented
- **Tasks**:
  - D&D 5e condition definitions and effects
  - Condition interaction rules
  - Duration tracking and countdown
  - Automatic condition removal

#### ❌ useHPManager.ts
- **Status**: Not implemented
- **Tasks**:
  - Damage/healing calculations
  - Temporary HP logic
  - Death saving throw automation
  - HP validation and constraints

### 🚧 Priority 3: Advanced Features

#### ❌ Combat Statistics
- **Status**: Not implemented
- **Tasks**:
  - Damage dealt/received tracking
  - Healing effectiveness metrics
  - Condition application statistics
  - Combat performance analytics

#### ❌ Enhanced Visual Feedback
- **Status**: Not implemented
- **Tasks**:
  - Damage/healing animations
  - HP bar visual indicators
  - Condition effect highlighting
  - Turn transition animations

## 🧪 Testing Strategy

### Unit Tests Required
- **❌ CombatCard**: Combatant display and interaction
- **❌ ConditionsTracker**: Condition application and removal
- **❌ HPModal**: Damage/healing calculations
- **❌ useCombatants**: State management operations

### Integration Tests Required
- **❌ Combat Workflow**: Full combatant management cycle
- **❌ Condition Effects**: Condition application and rule interactions
- **❌ HP Management**: Damage, healing, and death save sequences

## 📊 Performance Considerations

### Current Performance Targets
- **Target**: <50ms response time for combatant updates
- **Target**: Support 50+ combatants without rendering lag
- **Target**: Smooth animations for combat feedback

### Optimizations Implemented
- **✅ React.memo**: CombatCard prevents unnecessary re-renders
- **✅ Event Propagation**: Proper handling prevents event bubbling issues
- **✅ Input Validation**: Real-time validation with debounced updates
- **✅ Conditional Rendering**: Only render visible/active components

## 🔗 Feature Dependencies

### Depends On (Imports)
- `../types/combatant` - Shared combatant interface
- `../components/adventure` - Adventure-themed UI components
- `../utils/validation` - Shared input validation utilities

### Depended On By (Exports)
- `app/App.tsx` - Main application combat management
- `features/initiative-tracker` - Combatant data for initiative display
- `features/encounter-builder` - Combatant management for encounters

## 🎨 UI Theme Integration

### Visual Design Improvements ✅ COMPLETED
Based on user feedback about the current look and feel:

#### **Fixed Issues**:
- **✅ Remove Button Icon**: Changed from ⚔️ (sword) to ✕ (cross)
- **✅ Button Positioning**: Maintained preferred layout with HP/AC controls on right
- **✅ Icon Consistency**: Used proper Lucide icons (Heart, Shield, Dice6, X)

#### **Enhanced Adventure Theme**:
- **✅ Gradient Backgrounds**: Warm amber/orange gradients for cards
- **✅ Turn Highlighting**: Glowing border effects for current turn
- **✅ Status Badges**: Different colors for PC levels vs Monster CR
- **✅ Typography**: Adventure-themed fonts for headings

#### **Improved Color Coding**:
```typescript
// PC vs Monster distinction
PC Badge: emerald gradient (⭐ Lvl X)
Monster Badge: red gradient (💀 CR X)

// HP Status indication
Healthy: Green text/backgrounds
Wounded: Yellow text/backgrounds  
Critical: Red text/backgrounds with pulse animation
Temporary HP: Blue accent color
```

## 🏁 Definition of Done

This feature module will be complete when:

1. **✅ Architecture**: Feature is fully self-contained with clear boundaries
2. **✅ CombatCard**: Primary component implemented with UI improvements
3. **❌ Functionality**: All combat tracking features work identically to original
4. **❌ Performance**: Meets response time targets for combatant updates
5. **❌ Testing**: Comprehensive unit and integration test coverage
6. **❌ Integration**: Seamless coordination with initiative and encounter features

**Current Status**: **Core component (CombatCard) complete with UI improvements. Next priority: ConditionsTracker and HPModal components.**

## 🎯 Immediate Next Steps

1. **Implement ConditionsTracker.tsx** - Essential for condition management
2. **Create HPModal.tsx** - Critical for combat HP tracking
3. **Build useCombatants hook** - Central state management
4. **Add comprehensive input validation** - Ensure data integrity
5. **Implement adventure-themed shared components** - AdventureCard, AdventureButton, etc.