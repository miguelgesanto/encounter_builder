# 📋 Phase 1 To-Do: Foundation & Core UX

## 🚨 CRITICAL: Preserve All Existing Functionality
**The app works perfectly as-is. These changes improve code quality and performance WITHOUT changing user experience.**

---

## ✅ Task 1: Add React.memo Optimization (30 minutes)
**Goal:** 60-80% reduction in unnecessary re-renders
**Preserve:** All existing click handlers, state updates, and visual behavior

### **Step 1.1: Extract CombatCard Component**
Create new file: `src/components/CombatCard.tsx`

```typescript
import React from 'react';
import { ConditionsTracker } from './ConditionsTracker';

interface CombatCardProps {
  combatant: any; // Keep existing combatant structure
  index: number;
  currentTurn: number;
  onUpdateCreature: (id: string, field: string, value: any) => void;
  onRemoveCreature: (id: string) => void;
  onAddCondition: (combatantId: string, condition: string) => void;
  onRemoveCondition: (combatantId: string, conditionIndex: number) => void;
  onOpenHPModal: (combatant: any, event: React.MouseEvent) => void;
  onHandleCombatantClick: (combatant: any) => void;
}

const CombatCard: React.FC<CombatCardProps> = React.memo(({
  combatant,
  index,
  currentTurn,
  onUpdateCreature,
  onRemoveCreature,
  onAddCondition,
  onRemoveCondition,
  onOpenHPModal,
  onHandleCombatantClick
}) => {
  return (
    <div 
      key={combatant.id} 
      onClick={() => onHandleCombatantClick(combatant)}
      className={`
        flex items-center rounded-2xl px-4 py-2 text-white font-sans gap-3 mb-2 
        transition-all duration-200 cursor-pointer hover:shadow-lg
        ${index === currentTurn 
          ? 'bg-red-900 border-2 border-red-500 shadow-red-500/20' 
          : 'bg-gray-900 hover:bg-gray-800'
        }
      `}
    >
      {/* Initiative Section */}
      <div className="flex items-center gap-1">
        <span className="text-xl">🎲</span>
        <div className="bg-gray-800 rounded-lg px-3 py-2 min-w-[60px]">
          <input
            type="number"
            value={combatant.initiative}
            onChange={(e) => onUpdateCreature(combatant.id, 'initiative', parseInt(e.target.value) || 0)}
            className="bg-transparent border-none text-white font-bold text-center w-full text-lg focus:outline-none"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </div>

      {/* Combatant Info Section */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <input
            type="text"
            value={combatant.name}
            onChange={(e) => onUpdateCreature(combatant.id, 'name', e.target.value)}
            className="bg-transparent border-none text-white font-bold text-base flex-1 focus:outline-none"
            onClick={(e) => e.stopPropagation()}
          />
          {combatant.isPC ? (
            combatant.level && (
              <span className="bg-green-900 text-green-300 px-2 py-1 rounded text-xs font-medium">
                Lvl {combatant.level}
              </span>
            )
          ) : (
            combatant.cr && (
              <span className="bg-amber-900 text-amber-300 px-2 py-1 rounded text-xs font-medium">
                CR {combatant.cr}
              </span>
            )
          )}
        </div>
        
        {combatant.conditions.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {combatant.conditions.map((condition: any, condIndex: number) => (
              <span
                key={condIndex}
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveCondition(combatant.id, condIndex);
                }}
                className="bg-red-900 text-red-300 px-2 py-1 rounded text-xs cursor-pointer hover:bg-red-800 transition-colors flex items-center gap-1"
                title={`${condition.name}: Click to remove`}
              >
                <span>⚠️</span>
                {condition.name}
              </span>
            ))}
            <ConditionsTracker
              conditions={combatant.conditions}
              onAddCondition={(condition) => onAddCondition(combatant.id, condition)}
              onRemoveCondition={(index) => onRemoveCondition(combatant.id, index)}
            />
          </div>
        )}
      </div>

      {/* Stats Section */}
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1 text-xs text-red-400 mb-1">
            <span>❤️</span>
            <span>HP</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenHPModal(combatant, e);
            }}
            className="bg-gray-800 hover:bg-gray-700 rounded-lg px-3 py-2 min-w-[70px] text-center transition-colors"
          >
            <div className="text-white font-bold text-sm">
              {combatant.hp}/{combatant.maxHp}
            </div>
            {combatant.tempHp > 0 && (
              <div className="text-blue-400 text-xs">
                +{combatant.tempHp}
              </div>
            )}
          </button>
        </div>

        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1 text-xs text-blue-400 mb-1">
            <span>🛡️</span>
            <span>AC</span>
          </div>
          <div className="bg-gray-800 rounded-lg px-3 py-2 min-w-[50px]">
            <input
              type="number"
              value={combatant.ac}
              onChange={(e) => onUpdateCreature(combatant.id, 'ac', parseInt(e.target.value) || 0)}
              className="bg-transparent border-none text-white font-bold text-center w-full text-sm focus:outline-none"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      </div>

      {/* Close Button */}
      <button
        onClick={(e) => { 
          e.stopPropagation(); 
          onRemoveCreature(combatant.id); 
        }}
        className="bg-red-600 hover:bg-red-700 text-white rounded-md px-2 py-1 text-sm font-bold transition-colors"
      >
        ×
      </button>
    </div>
  );
});

CombatCard.displayName = 'CombatCard';

export default CombatCard;
```

### **Step 1.2: Update app.tsx to use CombatCard**
Replace the existing combatants.map section in app.tsx with:

```typescript
// Add import at top of app.tsx
import CombatCard from './components/CombatCard';

// Replace the existing {combatants.map(...)} section with:
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
  />
))}
```

**Testing:** Verify all clicks, inputs, and state updates work exactly the same.

---

## ✅ Task 2: Extract TypeScript Interfaces (1 hour)
**Goal:** Replace any types and inconsistent interfaces
**Preserve:** All existing data structures and component props

### **Step 2.1: Create Core Types**
Create file: `src/types/combatant.ts`

```typescript
export interface Condition {
  name: string;
  duration?: number;
}

export interface Combatant {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  ac: number;
  initiative: number;
  isPC: boolean;
  level?: number;
  conditions: Condition[];
  cr?: string;
  type?: string;
  environment?: string;
  xp?: number;
  tempHp?: number;
}

export interface SavedEncounter {
  id: string;
  name: string;
  combatants: Combatant[];
  round: number;
  currentTurn: number;
  notes: string;
  savedAt: string;
}
```

### **Step 2.2: Update Component Interfaces**
Update `src/components/CombatCard.tsx`:

```typescript
// Replace the interface at top with:
import { Combatant } from '../types/combatant';

interface CombatCardProps {
  combatant: Combatant;
  index: number;
  currentTurn: number;
  onUpdateCreature: (id: string, field: keyof Combatant, value: any) => void;
  onRemoveCreature: (id: string) => void;
  onAddCondition: (combatantId: string, condition: string) => void;
  onRemoveCondition: (combatantId: string, conditionIndex: number) => void;
  onOpenHPModal: (combatant: Combatant, event: React.MouseEvent) => void;
  onHandleCombatantClick: (combatant: Combatant) => void;
}
```

### **Step 2.3: Update app.tsx Types**
Add imports and update state types in app.tsx:

```typescript
// Add imports at top
import { Combatant, SavedEncounter } from './types/combatant';

// Update state declarations (keep existing initial values):
const [combatants, setCombatants] = useState<Combatant[]>([
  // Keep your existing initial combatants exactly as they are
]);
const [savedEncounters, setSavedEncounters] = useState<SavedEncounter[]>([]);
const [selectedCombatant, setSelectedCombatant] = useState<Combatant | null>(null);
const [hpModalCombatant, setHpModalCombatant] = useState<Combatant | null>(null);
```

**Testing:** Ensure TypeScript compiles without errors and all functionality works.

---

## ✅ Task 3: Extract Constants & Magic Numbers (30 minutes)
**Goal:** Centralize hardcoded values for maintainability
**Preserve:** All existing calculations and default values

### **Step 3.1: Create Constants Files**
Create file: `src/constants/dnd5e.ts`

```typescript
// D&D 5e Rules Constants
export const XP_BY_CR: Record<string, number> = {
  '0': 10,
  '1/8': 25,
  '1/4': 50,
  '1/2': 100,
  '1': 200,
  '2': 450,
  '3': 700,
  '4': 1100,
  '5': 1800,
  '6': 2300,
  '7': 2900,
  '8': 3900,
  '9': 5000,
  '10': 5900,
};

export const DIFFICULTY_THRESHOLDS = {
  1: { easy: 25, medium: 50, hard: 75, deadly: 100 },
  2: { easy: 50, medium: 100, hard: 150, deadly: 200 },
  3: { easy: 75, medium: 150, hard: 225, deadly: 400 },
  4: { easy: 125, medium: 250, hard: 375, deadly: 500 },
  5: { easy: 250, medium: 500, hard: 750, deadly: 1100 },
  6: { easy: 300, medium: 600, hard: 900, deadly: 1400 },
  7: { easy: 350, medium: 750, hard: 1100, deadly: 1700 },
  8: { easy: 450, medium: 900, hard: 1400, deadly: 2100 },
  9: { easy: 550, medium: 1100, hard: 1600, deadly: 2400 },
  10: { easy: 600, medium: 1200, hard: 1900, deadly: 2800 },
};

export const DEFAULT_VALUES = {
  PC_HP: 25,
  PC_AC: 16,
  PC_LEVEL: 5,
  INITIATIVE_MODIFIER: 2,
} as const;
```

Create file: `src/constants/ui.ts`

```typescript
// UI Constants
export const ANIMATION = {
  DURATION: 200,
  TRANSITION: 'transition-all duration-200',
} as const;

export const COLORS = {
  CURRENT_TURN: 'bg-red-900 border-2 border-red-500 shadow-red-500/20',
  NORMAL: 'bg-gray-900 hover:bg-gray-800',
  PC_CHIP: 'bg-green-900 text-green-300',
  NPC_CHIP: 'bg-amber-900 text-amber-300',
  CONDITION: 'bg-red-900 text-red-300',
} as const;

export const STORAGE_KEYS = {
  SAVED_ENCOUNTERS: 'dnd-saved-encounters',
  CURRENT_ENCOUNTER: 'dnd-current-encounter',
} as const;
```

### **Step 3.2: Update Components to Use Constants**
Update `src/components/CombatCard.tsx`:

```typescript
// Add imports at top
import { COLORS, ANIMATION } from '../constants/ui';

// Update className in main div:
className={`
  flex items-center rounded-2xl px-4 py-2 text-white font-sans gap-3 mb-2 
  cursor-pointer hover:shadow-lg ${ANIMATION.TRANSITION}
  ${index === currentTurn ? COLORS.CURRENT_TURN : COLORS.NORMAL}
`}

// Update chip classNames:
<span className={`${COLORS.PC_CHIP} px-2 py-1 rounded text-xs font-medium`}>
<span className={`${COLORS.NPC_CHIP} px-2 py-1 rounded text-xs font-medium`}>
<span className={`${COLORS.CONDITION} px-2 py-1 rounded text-xs cursor-pointer hover:bg-red-800 transition-colors flex items-center gap-1`}>
```

Update app.tsx to use constants in the newPC default state:

```typescript
// Add import at top
import { DEFAULT_VALUES } from './constants/dnd5e';
import { STORAGE_KEYS } from './constants/ui';

// Update newPC initial state:
const [newPC, setNewPC] = useState({ 
  name: '', 
  hp: DEFAULT_VALUES.PC_HP, 
  ac: DEFAULT_VALUES.PC_AC, 
  initiative: 0, 
  level: DEFAULT_VALUES.PC_LEVEL 
});

// Update localStorage keys:
const saved = localStorage.getItem(STORAGE_KEYS.SAVED_ENCOUNTERS);
localStorage.setItem(STORAGE_KEYS.CURRENT_ENCOUNTER, JSON.stringify({
```

**Testing:** Verify all default values and styling work exactly the same.

---

## ✅ Task 4: Extract Business Logic Hooks (3 hours)
**Goal:** Move D&D calculations out of components
**Preserve:** All existing calculation results and behavior

### **Step 4.1: Create Initiative Hook**
Create file: `src/hooks/useInitiative.ts`

```typescript
import { useCallback } from 'react';
import { Combatant } from '../types/combatant';

export const useInitiative = () => {
  const rollInitiative = useCallback((combatant: Combatant): number => {
    const roll = Math.floor(Math.random() * 20) + 1;
    const modifier = combatant.isPC ? 2 : 0; // Keep existing logic
    return roll + modifier;
  }, []);

  const rollAllInitiative = useCallback((combatants: Combatant[]): Combatant[] => {
    return combatants.map(combatant => ({
      ...combatant,
      initiative: rollInitiative(combatant)
    }));
  }, [rollInitiative]);

  const sortByInitiative = useCallback((combatants: Combatant[]): Combatant[] => {
    return [...combatants].sort((a, b) => b.initiative - a.initiative);
  }, []);

  return {
    rollInitiative,
    rollAllInitiative,
    sortByInitiative,
  };
};
```

### **Step 4.2: Create Encounter Balance Hook**
Create file: `src/hooks/useEncounterBalance.ts`

```typescript
import { useCallback } from 'react';
import { Combatant } from '../types/combatant';
import { DIFFICULTY_THRESHOLDS } from '../constants/dnd5e';

export const useEncounterBalance = () => {
  const calculateDifficulty = useCallback((combatants: Combatant[]) => {
    const party = combatants.filter(c => c.isPC);
    const enemies = combatants.filter(c => !c.isPC);
    
    if (party.length === 0) return { difficulty: 'No Party', xp: 0 };
    
    const avgLevel = Math.round(party.reduce((sum, pc) => sum + (pc.level || 5), 0) / party.length);
    const totalXP = enemies.reduce((sum, enemy) => sum + (enemy.xp || 0), 0);
    
    const thresholds = DIFFICULTY_THRESHOLDS[Math.min(avgLevel, 10)] || DIFFICULTY_THRESHOLDS[5];
    const partyThreshold = {
      easy: thresholds.easy * party.length,
      medium: thresholds.medium * party.length,
      hard: thresholds.hard * party.length,
      deadly: thresholds.deadly * party.length
    };
    
    let difficulty = 'trivial';
    if (totalXP >= partyThreshold.deadly) difficulty = 'deadly';
    else if (totalXP >= partyThreshold.hard) difficulty = 'hard';
    else if (totalXP >= partyThreshold.medium) difficulty = 'medium';
    else if (totalXP >= partyThreshold.easy) difficulty = 'easy';
    
    return { difficulty, xp: totalXP };
  }, []);

  return { calculateDifficulty };
};
```

### **Step 4.3: Update app.tsx to Use Hooks**
Add imports and replace inline functions:

```typescript
// Add imports at top
import { useInitiative } from './hooks/useInitiative';
import { useEncounterBalance } from './hooks/useEncounterBalance';

// Inside App component, replace existing functions:
const { rollInitiative, rollAllInitiative, sortByInitiative } = useInitiative();
const { calculateDifficulty } = useEncounterBalance();

// Remove the old inline function definitions and use the hook functions:
const rollAllInitiativeHandler = () => {
  const updatedCombatants = rollAllInitiative(combatants);
  setCombatants(updatedCombatants);
};

const sortByInitiativeHandler = () => {
  const sortedCombatants = sortByInitiative(combatants);
  setCombatants(sortedCombatants);
  setCurrentTurn(0);
};

// Update the rollInitiative call in CombatCard:
// (This is already passed as onUpdateCreature, no change needed)
```

**Testing:** Verify all D&D calculations return identical results to before.

---

## ✅ Task 5: Add Input Validation (1 hour)
**Goal:** Prevent invalid data entry with user feedback
**Preserve:** Allow all currently valid inputs, just prevent invalid ones

### **Step 5.1: Create Validation Utilities**
Create file: `src/utils/validation.ts`

```typescript
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export const validateHP = (value: string, maxHP?: number): ValidationResult => {
  const num = parseInt(value);
  
  if (isNaN(num)) {
    return { isValid: false, error: 'HP must be a number' };
  }
  
  if (num < 0) {
    return { isValid: false, error: 'HP cannot be negative' };
  }
  
  if (num > 999) {
    return { isValid: false, error: 'HP cannot exceed 999' };
  }
  
  if (maxHP && num > maxHP * 2) {
    return { isValid: false, error: 'HP too high for this creature' };
  }
  
  return { isValid: true };
};

export const validateAC = (value: string): ValidationResult => {
  const num = parseInt(value);
  
  if (isNaN(num)) {
    return { isValid: false, error: 'AC must be a number' };
  }
  
  if (num < 1 || num > 30) {
    return { isValid: false, error: 'AC must be between 1 and 30' };
  }
  
  return { isValid: true };
};

export const validateInitiative = (value: string): ValidationResult => {
  const num = parseInt(value);
  
  if (isNaN(num)) {
    return { isValid: false, error: 'Initiative must be a number' };
  }
  
  if (num < -10 || num > 50) {
    return { isValid: false, error: 'Initiative must be between -10 and 50' };
  }
  
  return { isValid: true };
};

export const validateName = (value: string): ValidationResult => {
  if (!value.trim()) {
    return { isValid: false, error: 'Name is required' };
  }
  
  if (value.length > 50) {
    return { isValid: false, error: 'Name must be 50 characters or less' };
  }
  
  return { isValid: true };
};
```

### **Step 5.2: Add Validation to Inputs**
Update `src/components/CombatCard.tsx` to include validation:

```typescript
// Add imports
import { useState } from 'react';
import { validateHP, validateAC, validateInitiative, validateName } from '../utils/validation';

// Inside CombatCard component, add validation state:
const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

// Create validated update handlers:
const handleHPUpdate = (value: string) => {
  const validation = validateHP(value, combatant.maxHp);
  if (validation.isValid) {
    onUpdateCreature(combatant.id, 'hp', parseInt(value));
    setValidationErrors(prev => ({ ...prev, [`${combatant.id}-hp`]: '' }));
  } else {
    setValidationErrors(prev => ({ ...prev, [`${combatant.id}-hp`]: validation.error || '' }));
  }
};

const handleACUpdate = (value: string) => {
  const validation = validateAC(value);
  if (validation.isValid) {
    onUpdateCreature(combatant.id, 'ac', parseInt(value));
    setValidationErrors(prev => ({ ...prev, [`${combatant.id}-ac`]: '' }));
  } else {
    setValidationErrors(prev => ({ ...prev, [`${combatant.id}-ac`]: validation.error || '' }));
  }
};

const handleInitiativeUpdate = (value: string) => {
  const validation = validateInitiative(value);
  if (validation.isValid) {
    onUpdateCreature(combatant.id, 'initiative', parseInt(value));
    setValidationErrors(prev => ({ ...prev, [`${combatant.id}-initiative`]: '' }));
  } else {
    setValidationErrors(prev => ({ ...prev, [`${combatant.id}-initiative`]: validation.error || '' }));
  }
};

const handleNameUpdate = (value: string) => {
  const validation = validateName(value);
  if (validation.isValid) {
    onUpdateCreature(combatant.id, 'name', value);
    setValidationErrors(prev => ({ ...prev, [`${combatant.id}-name`]: '' }));
  } else {
    setValidationErrors(prev => ({ ...prev, [`${combatant.id}-name`]: validation.error || '' }));
  }
};

// Update the input elements:
// Initiative input:
<input
  type="number"
  value={combatant.initiative}
  onChange={(e) => handleInitiativeUpdate(e.target.value)}
  className={`bg-transparent border-none text-white font-bold text-center w-full text-lg focus:outline-none ${
    validationErrors[`${combatant.id}-initiative`] ? 'text-red-400' : ''
  }`}
  onClick={(e) => e.stopPropagation()}
  title={validationErrors[`${combatant.id}-initiative`] || ''}
/>

// Name input:
<input
  type="text"
  value={combatant.name}
  onChange={(e) => handleNameUpdate(e.target.value)}
  className={`bg-transparent border-none text-white font-bold text-base flex-1 focus:outline-none ${
    validationErrors[`${combatant.id}-name`] ? 'text-red-400' : ''
  }`}
  onClick={(e) => e.stopPropagation()}
  title={validationErrors[`${combatant.id}-name`] || ''}
/>

// AC input:
<input
  type="number"
  value={combatant.ac}
  onChange={(e) => handleACUpdate(e.target.value)}
  className={`bg-transparent border-none text-white font-bold text-center w-full text-sm focus:outline-none ${
    validationErrors[`${combatant.id}-ac`] ? 'text-red-400' : ''
  }`}
  onClick={(e) => e.stopPropagation()}
  title={validationErrors[`${combatant.id}-ac`] || ''}
/>
```

**Testing:** Try entering invalid values - they should show red text and display error in tooltip, but valid values should work exactly as before.

---

## ✅ Task 6: Essential UX Fixes (45 minutes)
**Goal:** MVP-critical design improvements
**Preserve:** All existing visual layout, just fix critical usability issues

### **Step 6.1: Fix Color Semantic Meaning**
Update `src/constants/ui.ts`:

```typescript
export const COLORS = {
  // Changed: Use blue for current turn instead of red
  CURRENT_TURN: 'bg-blue-900 border-2 border-blue-500 shadow-blue-500/20',
  NORMAL: 'bg-gray-900 hover:bg-gray-800',
  
  // Keep red only for danger/remove actions
  DANGER: 'bg-red-600 hover:bg-red-700',
  
  // Keep existing chip colors
  PC_CHIP: 'bg-green-900 text-green-300',
  NPC_CHIP: 'bg-amber-900 text-amber-300',
  CONDITION: 'bg-red-900 text-red-300',
} as const;
```

### **Step 6.2: Ensure Touch Target Sizing**
Update `src/components/CombatCard.tsx` - add minimum sizes to interactive elements:

```typescript
// Update button and input styles to ensure 44px minimum:
// HP button:
className="bg-gray-800 hover:bg-gray-700 rounded-lg px-3 py-2 min-w-[70px] min-h-[44px] text-center transition-colors"

// Close button:
className={`${COLORS.DANGER} text-white rounded-md px-3 py-2 text-sm font-bold transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center`}

// Input containers should maintain their current sizes but ensure touch targets work
```

### **Step 6.3: Add Basic Error Boundary**
Create file: `src/components/ErrorBoundary.tsx`:

```typescript
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-800 flex items-center justify-center p-4">
          <div className="text-center text-white">
            <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
            <p className="mb-4">The encounter builder encountered an error.</p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: undefined });
                window.location.reload();
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

Update `src/main.tsx` to wrap the app:

```typescript
// Add import
import ErrorBoundary from './components/ErrorBoundary';

// Wrap the App component:
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
```

**Testing:** Verify app looks identical but current turn uses blue instead of red, and all touch targets are properly sized.

---

## 🧪 Testing Checklist for Each Task

After completing each task, verify:

### **Functionality (Must Work Exactly the Same):**
- [ ] Add/remove combatants works
- [ ] Edit names, HP, AC, initiative works  
- [ ] Add/remove conditions works
- [ ] Turn progression works (next turn, reset)
- [ ] Initiative rolling and sorting works
- [ ] HP modal opens and functions
- [ ] Save/load encounters works
- [ ] All existing keyboard shortcuts work
- [ ] All existing click behaviors work

### **Visual (Should Look the Same or Better):**
- [ ] Layout is identical or more polished
- [ ] Colors are appropriate (blue for current turn, red for danger)
- [ ] Touch targets are at least 44px
- [ ] Hover states work on all interactive elements
- [ ] Mobile/tablet experience is good

### **Performance (Should Be Faster):**
- [ ] Cards don't re-render unnecessarily
- [ ] Typing in inputs feels responsive
- [ ] No console errors in browser dev tools
- [ ] TypeScript compiles without errors

---

## 📝 Files That Will Be Created/Modified

### **New Files:**
- `src/components/CombatCard.tsx`
- `src/components/ErrorBoundary.tsx`
- `src/types/combatant.ts`
- `src/constants/dnd5e.ts`
- `src/constants/ui.ts`
- `src/hooks/useInitiative.ts`
- `src/hooks/useEncounterBalance.ts`
- `src/utils/validation.ts`

### **Modified Files:**
- `src/app.tsx` (use new components and hooks)
- `src/main.tsx` (add error boundary)

### **Deleted Files:**
- None (preserve all existing functionality)

---

## ⚠️ Important Notes

1. **Keep All Existing Data Structures:** Don't change how data is stored or passed around
2. **Preserve All Event Handlers:** Every click, input change, and keyboard event should work the same
3. **Maintain Visual Consistency:** Only make changes that improve usability, don't redesign
4. **Test After Each Task:** Don't move to the next task until current one is fully working
5. **Backup Before Starting:** Make sure you can revert if something breaks

**Estimated Total Time:** 6-8 hours over 1-2 weeks
**Expected Outcome:** Same functionality with better performance, maintainability, and user experience