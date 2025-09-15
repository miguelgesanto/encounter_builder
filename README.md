# D&D Encounter Builder & Initiative Tracker

A modern React application for D&D 5e encounter building and initiative tracking, built following 2024-2025 React architecture best practices.

## 🎯 Project Status

### ✅ Phase 1: Foundation & Core Features (COMPLETE)
- **Complete**: Modern React architecture with feature-based organization
- **Complete**: TypeScript-first development with strict mode
- **Complete**: Encounter building with creature database (10+ monsters)
- **Complete**: Initiative tracking system with turn management
- **Complete**: Real-time encounter difficulty calculation
- **Complete**: Player character management with levels
- **Complete**: Condition tracking with D&D 5e rules (16 conditions)
- **Complete**: Save/load encounter functionality
- **Complete**: Local storage persistence
- **Complete**: Responsive design with collapsible sidebars

### 🚧 Phase 2: Advanced Combat Management (IN PROGRESS)
- **Next**: Condition duration tracking and countdown
- **Next**: Start/end of turn effect processing
- **Next**: Turn notification system with prominent current turn display
- **Planned**: Enhanced damage/healing interface with quick buttons
- **Planned**: Death saving throws automation
- **Planned**: Concentration check automation
- **Planned**: Expanded creature database (100+ monsters)
- **Planned**: Advanced search and filtering
- **Planned**: Encounter templates and presets

### 📋 Phase 3: Automation & Intelligence (Future)
- **Planned**: Automatic advantage/disadvantage application
- **Planned**: Action economy tracking (Action, Bonus, Reaction)
- **Planned**: Environmental effects and hazards
- **Planned**: Dice integration with attack/damage automation
- **Planned**: Monster AI assistance and tactical suggestions
- **Planned**: Spell effect automation and duration management
- **Planned**: Legendary actions and lair actions
- **Planned**: Combat analytics and effectiveness tracking

### 🔧 Phase 4: Collaboration & Integration (Advanced)
- **Planned**: Real-time multiplayer with WebSocket integration
- **Planned**: IndexedDB for offline-first functionality
- **Planned**: Player view mode with limited information
- **Planned**: VTT integration (Roll20, Foundry VTT)
- **Planned**: Character sheet integration
- **Planned**: Campaign management and encounter chaining
- **Planned**: External API integration (D&D Beyond)
- **Planned**: Mobile app optimization

### 🎯 Phase 5: Advanced Features & AI (Long-term)
- **Planned**: AI-powered encounter suggestions
- **Planned**: Homebrew content creation tools
- **Planned**: Community encounter sharing
- **Planned**: Advanced analytics dashboard
- **Planned**: Voice command integration
- **Planned**: Streaming overlay support
- **Planned**: Multi-system support (Pathfinder, etc.)

## 🏗️ Architecture

This project follows modern React best practices:

- **Feature-based organization** instead of technical boundaries
- **TypeScript strict mode** for type safety
- **Custom hooks** for business logic separation
- **Compound components** for complex UI patterns
- **Performance-first** styling with Tailwind CSS
- **Zero-runtime** CSS approach (no CSS-in-JS)

## 🚀 Quick Start

### Option 1: Modern Development (Recommended)
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

### Option 2: Simple Local Server
```bash
# Install simple server
npm install -g http-server

# Run from project directory
http-server . -p 3000

# Open http://localhost:3000
```

### Usage
1. The application loads with a sample encounter
2. Use the left sidebar to add creatures and player characters
3. Manage initiative and track combat in the center panel
4. View creature details in the right panel

## 📁 Project Structure

```
src/
├── app/                 # Application layer
├── features/           # Feature-based modules
│   ├── encounter-builder/
│   └── initiative-tracker/
├── components/         # Shared components
├── hooks/             # Shared custom hooks
├── stores/            # Global state management
├── types/             # TypeScript type definitions
└── utils/             # Shared utilities
```

## 🛠️ Technology Stack

- **React 18** with Hooks and Concurrent Features
- **TypeScript 5.0+** with strict mode
- **Tailwind CSS** for styling
- **Zustand** for state management
- **LocalStorage** for persistence (IndexedDB planned)
- **No build system** (browser-native for simplicity)

## 🎮 Features

### Current Features (Phase 1 Complete)
- **🏗️ Encounter Building**: Add creatures from database or create custom ones
- **⚙️ Initiative Tracking**: Roll initiative, sort by order, track turns and rounds
- **🎯 Difficulty Calculation**: Real-time encounter difficulty based on D&D 5e rules
- **🏥 Condition Management**: Apply and track 16 D&D 5e conditions with explanations
- **💾 Save/Load**: Persist encounters to local storage
- **👥 Player Characters**: Add and manage PC stats with level tracking
- **📱 Responsive Design**: Works on desktop and tablet with collapsible sidebars
- **🔍 Search & Filter**: Find creatures by name, CR, and type
- **⚡ Real-time Updates**: Instant difficulty recalculation as encounter changes

### Upcoming Features (Phase 2)
- **⏱️ Duration Tracking**: Automatic condition countdown and expiration
- **🎨 Turn Notifications**: Prominent current turn display with alerts
- **🩸 Start/End Turn Effects**: Automatic processing of ongoing effects
- **❤️‍🩹 Enhanced Damage**: Quick damage buttons and healing interface
- **☠️ Death Saves**: Automatic tracking for unconscious characters
- **🎲 Concentration**: Automatic concentration check prompts
- **📚 Expanded Database**: 100+ monsters with full stat blocks
- **🎨 Encounter Templates**: Pre-built encounters for quick setup

### Advanced Features (Phase 3+)
- **🤖 Combat Automation**: Auto-apply advantage/disadvantage from conditions
- **🎭 Action Economy**: Track actions, bonus actions, reactions per turn
- **🌍 Environmental Effects**: Terrain, weather, and hazard management
- **🎲 Integrated Dice**: Attack rolls, damage, and saves within the app
- **🧠 AI Assistance**: Smart tactical suggestions for monsters
- **✨ Spell Automation**: Automatic spell effect application and tracking
- **💉 Legendary Actions**: Support for powerful monster abilities
- **📈 Combat Analytics**: Track damage, healing, and encounter effectiveness

## 🔄 Development Workflow

The project uses a modular architecture where each feature is self-contained:

1. **Feature modules** contain all related components, hooks, and logic
2. **Shared components** are used across multiple features
3. **Custom hooks** extract business logic from components
4. **Type definitions** ensure type safety across the application

## 📖 Documentation

Each folder contains its own README with specific implementation details:

- [Features](src/features/README.md) - Feature module documentation
- [Components](src/components/README.md) - Shared component library
- [Stores](src/stores/README.md) - State management patterns
- [Utils](src/utils/README.md) - Utility functions and helpers

## 🤝 Contributing

This project follows modern React patterns and D&D 5e rules. When contributing:

1. Follow the feature-based architecture
2. Use TypeScript with strict mode
3. Extract business logic into custom hooks
4. Follow D&D 5e official rules for game mechanics
5. Add tests for complex game logic

## 📜 License

MIT License - Feel free to use this for your D&D games!

---

**Note**: This is a learning project demonstrating modern React architecture patterns for complex gaming applications. The focus is on clean, maintainable code that can scale from a simple encounter builder to a full TTRPG assistant.