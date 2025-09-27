# 🧠 Intelligent DM Reminder System

An AI-powered assistant that provides contextual reminders and tactical suggestions during D&D combat encounters. The system uses predictive intelligence to anticipate events and deliver perfectly-timed reminders with zero perceived latency.

## ✨ Key Features

### 🎯 **Context-Aware Reminders**
- **Turn-Based Intelligence**: Automatic reminders for creature abilities, conditions, and tactical opportunities
- **Predictive Forecasting**: Anticipates creature deaths, condition expirations, and legendary actions
- **Smart Triggering**: Event-driven reminders based on HP changes, condition applications, and special abilities
- **Zero Latency**: Pre-generates reminders before they're needed for instant display

### 🤖 **AI-Powered Intelligence**
- **Specialized Prompts**: Custom AI templates for different reminder types (turn start, conditions, legendary actions, etc.)
- **Contextual Understanding**: Analyzes combat situation to provide relevant tactical suggestions
- **Dynamic Content**: Generates personalized reminders based on creature abilities and current situation
- **Fallback System**: Graceful degradation with pre-built reminders when AI is unavailable

### 🎨 **Flexible Display System**
- **Multiple Positions**: Turn panels, center alerts, sidebar, creature cards, floating overlays
- **Urgency-Based Styling**: Visual hierarchy based on reminder importance (low, medium, high, critical)
- **Smart Grouping**: Intelligently groups related reminders to avoid UI clutter
- **Customizable Timing**: Configurable display durations and trigger delays

### ⚡ **Performance Optimized**
- **Intelligent Caching**: 15-minute self-cleaning cache with relevancy scoring
- **Background Processing**: Pre-generation queue ensures smooth performance
- **Memory Management**: Automatic cleanup and optimization
- **Predictive Loading**: Prefetches reminders for likely future scenarios

## 🏗️ Architecture Overview

```
📁 dm-reminders/
├── 📄 types/reminder.types.ts          # Core type definitions
├── 🔧 hooks/useDMReminderEngine.ts     # Main engine hook
├── ⚙️ engine/PredictiveReminderEngine.ts # Prediction and generation
├── 🎯 triggers/ReminderTriggerManager.ts # Smart triggering system
├── 🤖 agents/ReminderAIAgent.ts        # AI integration
├── 💾 cache/ReminderCache.ts           # Performance caching
├── 🎨 components/                      # UI components
│   ├── ReminderOverlaySystem.tsx       # Display system
│   ├── ReminderControlPanel.tsx        # Controls and settings
│   └── EnhancedCombatTracker.tsx       # Integrated tracker
├── 🔍 utils/ContextAnalyzer.ts         # Context analysis
├── 🎮 demo/DMReminderDemo.tsx          # Demo and testing
└── 📚 index.ts                         # Public API exports
```

## 🚀 Quick Start

### Basic Integration

```tsx
import { EnhancedCombatTracker, ReminderSystemProvider } from '@/features/dm-reminders'

function App() {
  return (
    <ReminderSystemProvider
      initialPreferences={{
        enablePredictiveGeneration: true,
        enableTacticalSuggestions: true,
        enableEnvironmentalReminders: true
      }}
    >
      <EnhancedCombatTracker />
    </ReminderSystemProvider>
  )
}
```

### Hook Usage

```tsx
import { useDMReminderEngine } from '@/features/dm-reminders'

function CombatInterface() {
  const reminderEngine = useDMReminderEngine({
    enabledReminderTypes: ['turn_start', 'death_trigger', 'legendary_actions'],
    enablePredictiveGeneration: true
  })

  useEffect(() => {
    if (combatStarted) {
      reminderEngine.startEngine()
    }
  }, [combatStarted])

  return (
    <div>
      {/* Your combat UI */}
      <ReminderOverlaySystem
        reminders={reminderEngine.activeReminders}
        onDismiss={reminderEngine.dismissReminder}
      />
    </div>
  )
}
```

### Higher-Order Component

```tsx
import { withDMReminders } from '@/features/dm-reminders'

const EnhancedCombatTracker = withDMReminders(YourCombatComponent)

// Usage
<EnhancedCombatTracker enableReminders={true} />
```

## 🎮 Demo and Testing

Run the interactive demo to see the system in action:

```tsx
import { DMReminderDemo } from '@/features/dm-reminders/demo'

// The demo includes:
// - Pre-configured encounter with PCs and monsters
// - Realistic combat scenarios with conditions
// - All reminder types and display positions
// - Interactive controls for testing
```

## 🎯 Reminder Types

### **Core Combat Reminders**
- `turn_start` - Beginning of creature turns with ability reminders
- `turn_end` - End-of-turn effects and condition updates
- `round_start` - New round events and initiative count 20
- `condition_reminder` - Active condition effects and duration warnings
- `death_trigger` - Creature death events and special death abilities

### **Advanced Features**
- `legendary_actions` - Legendary creature action opportunities
- `lair_actions` - Environment-based lair actions on initiative 20
- `concentration_check` - Spell concentration saves when damaged
- `environmental` - Terrain hazards and environmental effects
- `tactical_suggestion` - AI-generated combat strategy hints

## 🎨 Display Positions

- **`turn-panel`** - Next to current creature (turn reminders)
- **`center-alert`** - Full-screen overlay (critical events)
- **`sidebar`** - Persistent panel (ongoing reminders)
- **`creature-card`** - On specific creature cards (conditions)
- **`round-header`** - At top of interface (round events)
- **`floating`** - Contextual overlays (tactical suggestions)

## ⚙️ Configuration Options

```tsx
interface ReminderPreferences {
  enabledReminderTypes: ReminderType[]
  displayPositions: Record<ReminderType, DisplayPosition>
  urgencyThresholds: Record<ReminderType, UrgencyLevel>
  autoHideDurations: Record<ReminderType, number>
  enablePredictiveGeneration: boolean
  maxCachedReminders: number
  enableTacticalSuggestions: boolean
  enableEnvironmentalReminders: boolean
}
```

## 🤖 AI Integration

### API Setup (Optional)
The system includes AI integration for dynamic reminder generation:

```typescript
// For production use, add your Anthropic API key
const response = await fetch("https://api.anthropic.com/v1/messages", {
  headers: { "x-api-key": process.env.ANTHROPIC_API_KEY }
})
```

### Mock Mode
The system works perfectly in mock mode with pre-built responses for development and testing.

## 🔧 Advanced Usage

### Custom Reminder Types

```tsx
const customReminderType: AIPromptTemplate = {
  id: 'custom_spell_reminder',
  name: 'Spell Reminder',
  template: 'Custom prompt for spell-related reminders...',
  variables: ['spellName', 'casterLevel', 'components'],
  reminderType: 'custom_spell_reminder' as ReminderType,
  maxTokens: 200
}

// Register with AI agent
ReminderAIAgent.registerTemplate(customReminderType)
```

### Performance Monitoring

```tsx
const cacheStats = reminderEngine.getCacheStats()
console.log(`Cache hit rate: ${cacheStats.hitRate}`)
console.log(`Memory usage: ${cacheStats.memoryUsage} bytes`)
console.log(`Average generation time: ${cacheStats.averageGenerationTime}ms`)
```

### Event Handling

```tsx
reminderEngine.on('reminder-generated', (reminder) => {
  console.log('New reminder generated:', reminder.type)
})

reminderEngine.on('context-changed', (change) => {
  console.log('Combat context changed:', change.type)
})
```

## 🎯 Best Practices

### Performance
- Enable predictive generation for smoother experience
- Use appropriate cache sizes based on encounter complexity
- Monitor memory usage for long sessions

### User Experience
- Start with essential reminder types, expand based on DM preference
- Use appropriate urgency levels to avoid alert fatigue
- Customize display positions based on table layout

### Customization
- Adjust auto-hide durations based on reading speed
- Enable/disable tactical suggestions based on group experience
- Configure reminder verbosity for different play styles

## 🐛 Troubleshooting

### Common Issues

**Reminders not appearing:**
- Check if reminder engine is started
- Verify reminder types are enabled in preferences
- Ensure combat state is properly initialized

**Performance issues:**
- Reduce cache size for memory-constrained environments
- Disable predictive generation if experiencing lag
- Check for memory leaks in long-running sessions

**AI integration problems:**
- System falls back to mock responses automatically
- Check API key configuration for production use
- Monitor API rate limits and error responses

## 📈 Future Enhancements

- **Voice Integration**: Spoken reminder delivery for hands-free operation
- **Custom Campaigns**: AI learning from specific campaign patterns
- **Multi-Language**: Localized reminders in multiple languages
- **Mobile Interface**: Touch-optimized reminder displays
- **Analytics**: Combat flow analysis and optimization suggestions

## 🤝 Contributing

The reminder system is designed to be extensible. Key extension points:

- **Custom Reminder Types**: Add new reminder categories
- **Display Components**: Create custom reminder UI elements
- **AI Prompts**: Develop specialized prompt templates
- **Trigger Conditions**: Implement custom triggering logic
- **Cache Strategies**: Optimize for specific use cases

## 📝 License

This DM Reminder System is part of the encounter builder project and follows the same licensing terms.