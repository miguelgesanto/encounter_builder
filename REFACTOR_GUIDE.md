# D&D Encounter Builder - Refactoring Guide

## 📋 Overview

This guide outlines the refactoring of the D&D Encounter Builder to follow modern React best practices, improve scalability, and enhance maintainability.

## 🏗️ New Architecture

### Feature-Based Organization

```
src/
├── features/                     # Domain-driven feature modules
│   ├── combat-tracker/           # Combat and initiative tracking
│   ├── creature-browser/         # Monster search and management
│   ├── stat-block/              # Creature stat display
│   └── conditions/              # Status effect management
├── shared/                      # Reusable components and utilities
│   ├── components/ui/           # Design system components
│   ├── hooks/                   # Shared custom hooks
│   └── types/                   # Common type definitions
└── stores/                      # Global state management
```

### Key Improvements

1. **Separation of Concerns**: Business logic separated from UI components
2. **Custom Hooks**: Reusable logic extracted into composable hooks
3. **Compound Components**: Complex components broken down using compound patterns
4. **Type Safety**: Comprehensive TypeScript coverage
5. **State Management**: Zustand for predictable state management
6. **Error Boundaries**: Graceful error handling and recovery

## 🚀 Migration Steps

### Phase 1: Setup (Completed ✅)

1. Create new folder structure
2. Set up type definitions
3. Create utility functions
4. Set up Zustand store

### Phase 2: Component Migration (In Progress 🔄)

#### Before (Old CombatCard):
```tsx
// Monolithic component with mixed concerns
const CombatCard = ({ combatant, index, currentTurn, onUpdate... }) => {
  const [validationErrors, setValidationErrors] = useState({})

  // 300+ lines of mixed UI and logic
  const handleInitiativeUpdate = (value) => { /* ... */ }
  const getHPStatusColor = (hp, maxHp) => { /* ... */ }

  return (
    <div className="...">
      {/* Complex JSX with inline handlers */}
    </div>
  )
}
```

#### After (New Architecture):
```tsx
// Compound component with extracted logic
const CombatCard = ({ combatant, isActive, children, onClick }) => {
  const cardLogic = useCombatCard(combatant) // Business logic in hook

  return (
    <CombatCardProvider value={{ combatant, isActive, ...cardLogic }}>
      <div className="..." onClick={() => onClick?.(combatant)}>
        {children}
      </div>
    </CombatCardProvider>
  )
}

// Usage with compound components
<CombatCard combatant={combatant} isActive={isActive}>
  <CombatCard.Header />
  <CombatCard.Stats />
  <CombatCard.Conditions />
  <CombatCard.Actions />
</CombatCard>
```

### Phase 3: State Management Migration

#### Before (Prop Drilling):
```tsx
const App = () => {
  const [combatants, setCombatants] = useState([])
  const [currentTurn, setCurrentTurn] = useState(0)
  // ... many more state variables

  return (
    <CombatTracker
      combatants={combatants}
      currentTurn={currentTurn}
      onUpdateCombatant={updateCombatant}
      // ... many more props
    />
  )
}
```

#### After (Zustand Store):
```tsx
const useCombat = () => {
  const store = useCombatStore()
  return {
    combatants: store.sortedCombatants,
    currentTurn: store.currentTurn,
    nextTurn: store.nextTurn,
    // ... clean interface
  }
}

const CombatTracker = () => {
  const { combatants, currentTurn, nextTurn } = useCombat()
  // Component focuses on rendering, logic in hook
}
```

## 🎯 Benefits Achieved

### 1. **Maintainability**
- **Before**: 600+ line monolithic components
- **After**: Focused components under 100 lines each

### 2. **Reusability**
- **Before**: Tightly coupled components
- **After**: Composable hooks and compound components

### 3. **Type Safety**
- **Before**: Basic TypeScript usage
- **After**: Comprehensive type system with guards and utilities

### 4. **Performance**
- **Before**: Unnecessary re-renders and calculations
- **After**: Memoized computations and optimized updates

### 5. **Developer Experience**
- **Before**: Hard to find and modify features
- **After**: Clear feature boundaries and predictable patterns

## 📖 Usage Examples

### Combat Management
```tsx
const MyComponent = () => {
  const {
    startCombat,
    nextTurn,
    addCombatant,
    isActive,
    currentCombatant
  } = useCombat()

  // Clean, focused API
}
```

### Individual Combatant Management
```tsx
const CombatantCard = ({ combatant }) => {
  const {
    applyDamage,
    rollInitiative,
    addCondition,
    hpStatus
  } = useCombatCard(combatant)

  // All business logic handled by hook
}
```

### Error Handling
```tsx
const App = () => (
  <ErrorBoundary>
    <CombatErrorBoundary>
      <CombatTracker />
    </CombatErrorBoundary>
  </ErrorBoundary>
)
```

## 🔄 Migration Timeline

- **Phase 1**: ✅ Architecture Setup (Completed)
- **Phase 2**: 🔄 Component Migration (In Progress)
- **Phase 3**: ⏳ Full Integration Testing
- **Phase 4**: ⏳ Performance Optimization
- **Phase 5**: ⏳ Documentation and Training

## 🧪 Testing Strategy

### Custom Hooks Testing
```tsx
import { renderHook, act } from '@testing-library/react'
import { useCombatCard } from '../hooks/useCombatCard'

test('should apply damage correctly', () => {
  const { result } = renderHook(() => useCombatCard(mockCombatant))

  act(() => {
    result.current.applyDamage(10)
  })

  expect(result.current.combatant.hp).toBe(15)
})
```

### Component Testing
```tsx
import { render, screen } from '@testing-library/react'
import { CombatCard } from '../components/CombatCard'

test('should display combatant information', () => {
  render(
    <CombatCard combatant={mockCombatant}>
      <CombatCard.Header />
      <CombatCard.Stats />
    </CombatCard>
  )

  expect(screen.getByText('Test Combatant')).toBeInTheDocument()
})
```

## 📚 Next Steps

1. **Complete Component Migration**: Migrate remaining legacy components
2. **Add Comprehensive Tests**: Unit and integration tests for all features
3. **Performance Monitoring**: Add metrics and optimization where needed
4. **Documentation**: Complete component and hook documentation
5. **Team Training**: Ensure team understands new patterns and conventions

## 🤝 Contributing

When adding new features:

1. **Follow the feature-based structure**
2. **Extract business logic into custom hooks**
3. **Use compound components for complex UI**
4. **Add proper TypeScript types**
5. **Include error boundaries where appropriate**
6. **Write tests for hooks and components**

This refactor provides a solid foundation for scaling the D&D Encounter Builder while maintaining code quality and developer experience.