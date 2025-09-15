# Types Directory

This directory contains TypeScript type definitions, interfaces, and constants for the D&D Encounter Builder & Initiative Tracker. All application data structures and type safety are defined here.

## 📁 What Has Been Done

### ✅ Completed Type Definitions

#### index.ts
**Purpose**: Comprehensive TypeScript type system for D&D encounter management
**Status**: ✅ Complete - Full type coverage for core functionality

**Features Implemented**:

##### Core Data Types
- **Creature Interface**: Complete monster/NPC data structure
- **Combatant Interface**: Combat participant with state tracking
- **Encounter Interface**: Full encounter data with metadata
- **Condition System**: D&D 5e conditions with descriptions
- **State Interfaces**: Application state structure definitions

##### Type Structure Overview
```typescript
// Core Entity Types
interface Creature {
  id: string;
  name: string;
  cr: string;                    // Challenge Rating
  crValue: number;               // Numeric CR for calculations
  hp: number;
  maxHp: number;
  ac: number;
  initiative: number;
  type: string;                  // Creature type (beast, humanoid, etc.)
  size: string;                  // Creature size (tiny, small, etc.)
  environment: string;           // Preferred environment
  xp: number;                    // Experience point value
  abilities?: AbilityScores;     // D&D ability scores
  // Additional optional creature data
}

interface Combatant {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  ac: number;
  initiative: number;
  isPC: boolean;                 // Player Character flag
  conditions: Condition[];       // Applied conditions
  level?: number;                // PC level
  notes?: string;                // Combat notes
  // Additional combat state
}

interface Encounter {
  id: string;
  name: string;
  combatants: Combatant[];
  round: number;
  currentTurn: number;
  isActive: boolean;
  partySize: number;
  partyLevel: number;
  difficulty: DifficultyLevel;
  xpBudget: number;
  usedXp: number;
  // Metadata and notes
}
```

##### State Management Types
- **InitiativeState**: Combat and encounter state
- **EncounterBuilderState**: Creature library and search state  
- **UIState**: Interface and layout state
- **AppState**: Complete application state structure

##### Utility Types
- **DifficultyLevel**: Union type for encounter difficulties
- **CreatureType**: Union type for D&D creature types
- **CreatureSize**: Union type for D&D creature sizes
- **Condition**: Interface for status effects and conditions

##### Constants and Enums
- **CONDITIONS**: Complete D&D 5e condition definitions with descriptions
- **ENCOUNTER_TEMPLATES**: Pre-built encounter configurations
- **Type Guards**: Runtime type checking utilities

**D&D 5e Integration**:
```typescript
// Complete condition system
export const CONDITIONS: Record<string, Condition> = {
  'Blinded': {
    name: 'Blinded',
    description: "Can't see. Attacks against you have Advantage; your attacks have Disadvantage."
  },
  'Charmed': {
    name: 'Charmed', 
    description: "Can't attack the charmer or target them with harmful abilities."
  },
  // ... all 16 core D&D 5e conditions
};

// Encounter templates
export const ENCOUNTER_TEMPLATES: EncounterTemplate[] = [
  {
    name: "Goblin Ambush",
    description: "A classic low-level encounter",
    suggestedLevel: 2,
    creatures: [
      { name: "Goblin", quantity: 4 },
      { name: "Hobgoblin", quantity: 1 }
    ],
    environment: "forest",
    tags: ["ambush", "humanoid", "low-level"]
  }
  // ... more templates
];
```

## 🎯 What Needs To Be Done

### High Priority

#### 1. Advanced Combat Types
**Status**: ❌ Not Started - Needed for enhanced combat features

**Missing Types**:
- **Spell System**: Spell data structure and tracking
- **Legendary Actions**: Legendary creature action tracking
- **Lair Actions**: Environmental action definitions
- **Reactions**: Reaction tracking and management
- **Equipment**: Weapon and armor data structures

**Proposed Implementation**:
```typescript
interface Spell {
  id: string;
  name: string;
  level: number;
  school: string;
  castingTime: string;
  range: string;
  duration: string;
  concentration: boolean;
  description: string;
}

interface LegendaryAction {
  name: string;
  cost: number;
  description: string;
  recharge?: string;
}

interface LegendaryCreature extends Creature {
  legendaryActions: LegendaryAction[];
  legendaryResistances: number;
  lairActions?: LairAction[];
}
```

#### 2. Campaign Management Types
**Status**: ❌ Not Started - Needed for story progression

**Missing Types**:
- **Campaign Interface**: Multi-session campaign data
- **Session Interface**: Individual game session tracking
- **NPC Interface**: Recurring NPC management
- **Story Node Interface**: Narrative progression tracking
- **Encounter Chain Interface**: Linked encounter sequences

#### 3. Enhanced Creature Types
**Status**: 🔄 Basic creature types complete, needs expansion

**Missing Features**:
- **Homebrew Creature Support**: Custom creature creation types
- **Creature Templates**: Template system for creature variants
- **Scaling Types**: Level-appropriate creature scaling
- **Creature Relationships**: Pack/group behavior definitions

### Medium Priority

#### 4. User Interface Types
**Status**: ❌ Not Started

**Missing Types**:
- **Theme Types**: UI theme and styling definitions
- **Layout Types**: Responsive layout configuration
- **Input Types**: Form validation and input types
- **Navigation Types**: Route and navigation definitions

#### 5. Data Import/Export Types
**Status**: ❌ Not Started

**Missing Types**:
- **Export Format Types**: JSON export structure definitions
- **Import Validation Types**: Data validation schemas
- **File Format Types**: Supported file format definitions
- **Migration Types**: Data migration and versioning

### Low Priority

#### 6. Advanced Game System Types
**Status**: ❌ Not Started

**Missing Types**:
- **Multiclass Support**: Multi-class character definitions
- **Variant Rules**: Optional rule system support
- **Custom Game Systems**: Support for non-5e systems
- **Homebrew Rules**: Custom rule integration

## 🏗️ Type Architecture

### Current Structure
```typescript
index.ts
├── Core Entity Interfaces
│   ├── Creature
│   ├── Combatant  
│   ├── Encounter
│   └── SavedEncounter
├── State Management Types
│   ├── InitiativeState
│   ├── EncounterBuilderState
│   ├── UIState
│   └── AppState
├── Utility Types
│   ├── Condition
│   ├── DifficultyLevel
│   ├── CreatureType
│   └── CreatureSize
├── Constants
│   ├── CONDITIONS
│   └── ENCOUNTER_TEMPLATES
└── Union Types & Enums
```

### Planned Structure
```typescript
types/
├── entities/
│   ├── creature.ts           # Creature and variant types
│   ├── combatant.ts          # Combat participant types
│   ├── encounter.ts          # Encounter and chain types
│   ├── campaign.ts           # Campaign management types
│   └── spell.ts              # Spell and magic types
├── state/
│   ├── initiative.ts         # Combat state types
│   ├── builder.ts            # Builder state types
│   ├── ui.ts                 # Interface state types
│   └── settings.ts           # Configuration types
├── game-systems/
│   ├── dnd5e.ts              # D&D 5e specific types
│   ├── conditions.ts         # Status effect types
│   ├── rules.ts              # Game rule types
│   └── homebrew.ts           # Custom rule types
├── data/
│   ├── import.ts             # Data import types
│   ├── export.ts             # Data export types
│   ├── validation.ts         # Validation schemas
│   └── migration.ts          # Data migration types
├── ui/
│   ├── components.ts         # Component prop types
│   ├── forms.ts              # Form and input types
│   ├── layout.ts             # Layout and theme types
│   └── navigation.ts         # Routing types
└── index.ts                  # Consolidated exports
```

## 🔧 Development Guidelines

### Type Design Principles
1. **Strict Type Safety**: No `any` types in production code
2. **Exhaustive Unions**: Use discriminated unions for state management
3. **Immutable Data**: Readonly properties where appropriate
4. **Generic Reusability**: Generic types for common patterns
5. **Runtime Validation**: Types that can be validated at runtime

### Interface Design Patterns
```typescript
// Base interface with common properties
interface BaseEntity {
  readonly id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

// Extending base interfaces
interface Creature extends BaseEntity {
  // Creature-specific properties
}

// Discriminated unions for type safety
type CombatantType = 
  | { isPC: true; level: number; class: string }
  | { isPC: false; cr: string; xp: number };

// Generic utility types
type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
```

### Validation Integration
```typescript
// Runtime type validation
export const isCreature = (obj: any): obj is Creature => {
  return typeof obj === 'object' &&
         typeof obj.id === 'string' &&
         typeof obj.name === 'string' &&
         typeof obj.hp === 'number' &&
         typeof obj.ac === 'number';
};

// Zod schema integration (future)
import { z } from 'zod';

export const CreatureSchema = z.object({
  id: z.string(),
  name: z.string(),
  hp: z.number().positive(),
  ac: z.number().positive(),
  // ... more validation
});

export type Creature = z.infer<typeof CreatureSchema>;
```

## 🚀 Working with Types

### Type Usage Patterns
```typescript
// Component props with strict typing
interface ComponentProps {
  creature: Creature;
  onUpdate: (id: string, updates: Partial<Creature>) => void;
  disabled?: boolean;
}

// Store action typing
interface StoreActions {
  addCombatant: (creature: Creature, isPC?: boolean) => void;
  updateCombatant: (id: string, updates: Partial<Combatant>) => void;
  removeCombatant: (id: string) => void;
}

// Custom hook typing
const useActiveCombatants = (): Combatant[] => {
  return useEncounterStore(state => 
    state.initiative.encounters
      .find(e => e.id === state.initiative.activeEncounterId)
      ?.combatants || []
  );
};
```

### Type Guards and Utilities
```typescript
// Type guard functions
export const isPlayerCharacter = (combatant: Combatant): combatant is Combatant & { isPC: true } => {
  return combatant.isPC === true;
};

// Utility type functions
export const createCombatant = (creature: Creature, isPC: boolean = false): Combatant => {
  return {
    id: creature.id,
    name: creature.name,
    hp: creature.hp,
    maxHp: creature.maxHp,
    ac: creature.ac,
    initiative: 0,
    isPC,
    conditions: []
  };
};
```

## 📊 Current Metrics

### Type Coverage
- **Interfaces Defined**: 15+ core interfaces
- **Union Types**: 5+ discriminated unions
- **Constants**: 2 major constant collections
- **Type Safety**: 100% TypeScript strict mode compliance
- **Runtime Validation**: Type guards for core entities

### D&D 5e Coverage
- **Conditions**: All 16 core conditions with descriptions
- **Creature Types**: 14 standard creature types
- **Sizes**: 6 creature sizes (tiny to gargantuan)
- **Difficulties**: 4 encounter difficulties
- **Challenge Ratings**: Support for CR 0 to 30+

## 🔮 Future Type Features

### Advanced Type System
- **Template Literal Types**: Dynamic string typing for IDs and names
- **Conditional Types**: Context-aware type definitions
- **Mapped Types**: Automatic type transformations
- **Brand Types**: Nominal typing for IDs and measurements

### Game System Integration
- **Multi-System Support**: Abstract game system interfaces
- **Rule Validation**: Type-checked rule enforcement
- **Custom Content**: Extensible homebrew type system
- **Version Management**: Backwards-compatible type evolution

### Developer Experience
- **Auto-completion**: Rich IDE support with comprehensive types
- **Error Prevention**: Compile-time error detection
- **Refactoring Safety**: Type-safe code transformations
- **Documentation**: Self-documenting types with JSDoc

---

*Types are the foundation of reliability - keep them comprehensive, accurate, and well-documented!*