# Data Directory

This directory contains all data management classes and utilities for the D&D Encounter Builder. These modules handle monster data, encounter data, and any other game-related information.

## 📁 What Has Been Done

### ✅ Completed Data Modules

#### MonsterDatabase.js
**Purpose**: Manage monster data and provide search/filter capabilities
**Status**: ✅ Complete - Fully functional with room for expansion

**Features Implemented**:
- **Monster Storage**: In-memory storage of monster objects
- **Default Monsters**: 20+ pre-loaded D&D 5e SRD monsters (CR 0-5)
- **Search Functionality**: Text-based search across name, type, and description
- **Filtering System**: Filter by CR, type, size with multiple criteria support
- **CRUD Operations**: Add, remove, and update monsters
- **Statistics**: Generate database statistics and metrics
- **Data Validation**: Ensure monster objects have required fields

**Monster Data Structure**:
```javascript
{
    name: "Goblin",
    size: "Small",
    type: "Humanoid", 
    challengeRating: 0.25,
    armorClass: 15,
    hitPoints: 7,
    speed: "30 ft.",
    abilities: { str: 8, dex: 14, con: 10, int: 10, wis: 8, cha: 8 },
    skills: "Stealth +6",
    senses: "Darkvision 60 ft., Passive Perception 9",
    languages: "Common, Goblin",
    description: "Small, black-hearted humanoids...",
    // Optional fields: damageResistances, damageImmunities, etc.
}
```

**How It Works**:
1. **Initialization**: Loads default monster data on first run
2. **Search**: Uses JavaScript string methods for text matching
3. **Filtering**: Applies multiple filters simultaneously with AND logic
4. **Extensibility**: Designed to support custom monster addition

**Current Monster Coverage**:
- CR 0: 3 monsters (Awakened Shrub, Badger, Cat)
- CR 1/8: 3 monsters (Bandit, Commoner, Giant Rat)
- CR 1/4: 3 monsters (Goblin, Kobold, Skeleton)
- CR 1/2: 3 monsters (Orc, Scout, Warhorse)
- CR 1: 3 monsters (Brown Bear, Dire Wolf, Hobgoblin)
- CR 2-5: 5+ monsters (Ogre, Owlbear, Ankheg, etc.)

## 🎯 What Needs To Be Done

### High Priority

#### 1. Expanded Monster Database
**Status**: 🔄 In Progress - Need more monsters

**Missing Content**:
- CR 6-10 monsters (Hill Giant, Troll, etc.)
- CR 11-15 monsters (Adult Dragons, high-level threats)
- More variety in CR 0-5 range
- Specialized monster types (Undead, Fiends, Celestials)

**Implementation Needed**:
```javascript
// Add to getDefaultMonsters() method
{
    name: "Adult Red Dragon",
    challengeRating: 17,
    // ... complete stat block
}
```

#### 2. Custom Monster Support
**Status**: ❌ Not Started - High Priority

**Features Needed**:
- Import monsters from JSON files
- Export custom monsters
- Monster validation system
- Conflict resolution for duplicate names

**Proposed Implementation**:
```javascript
async importMonstersFromFile(file) {
    // Parse JSON file
    // Validate monster data
    // Add to database with conflict handling
}

exportCustomMonsters() {
    // Filter custom vs default monsters
    // Export as JSON
}
```

#### 3. Monster Artwork Integration
**Status**: ❌ Not Started - Medium Priority

**Features Needed**:
- Image URLs in monster data
- Default artwork fallbacks
- Image caching system
- Token/portrait support

### Medium Priority

#### 4. Advanced Search Features
**Status**: ❌ Not Started

**Features Needed**:
- Tag-based searching
- Complex queries (CR range, multiple types)
- Search history and saved filters
- Autocomplete suggestions

#### 5. Monster Relationships
**Status**: ❌ Not Started

**Features Needed**:
- Monster variants (Young/Adult/Ancient Dragons)
- Related monsters grouping
- Monster ecology information

#### 6. Data Versioning
**Status**: ❌ Not Started

**Features Needed**:
- Track monster data version
- Update mechanism for monster changes
- Backward compatibility

### Low Priority

#### 7. External Data Sources
**Status**: ❌ Not Started

**Features Needed**:
- D&D Beyond API integration
- Open5e API integration
- Community monster sharing

#### 8. Monster Templates
**Status**: ❌ Not Started

**Features Needed**:
- Template system for creating variants
- Apply templates to base monsters
- Common templates (Undead, Fiendish, etc.)

## 🏗️ Data Architecture

### Current Structure
```
MonsterDatabase
├── monsters: Array<Monster>          # In-memory monster storage
├── initialized: Boolean              # Initialization state
├── getMonsters(): Monster[]          # Get all monsters
├── searchMonsters(query): Monster[]  # Text search
├── getFilteredMonsters(filters)      # Advanced filtering
└── getStats()                        # Database statistics
```

### Planned Expansions
```
DataManager (Future)
├── MonsterDatabase
├── SpellDatabase
├── ItemDatabase
└── RuleDatabase
```

## 🔧 Development Guidelines

### Adding New Monsters
1. **Follow SRD Guidelines**: Only include SRD or custom content
2. **Complete Stat Blocks**: Include all necessary fields
3. **Consistent Formatting**: Match existing data structure
4. **Validation**: Ensure CR and XP values are correct

### Monster Data Validation
```javascript
const requiredFields = [
    'name', 'size', 'type', 'challengeRating', 
    'armorClass', 'hitPoints'
];

// All monsters must have these fields
// Optional fields can be undefined/null
```

### Performance Considerations
- **Memory Usage**: Store only essential data in memory
- **Search Performance**: Consider indexing for large databases
- **Loading Time**: Lazy load monster details when needed

### Data Integrity
- **Unique Names**: Prevent duplicate monster names
- **Valid CRs**: Ensure challenge ratings match 5e rules
- **Consistent Types**: Use standard D&D creature types

## 🚀 Extending the Data Layer

### Adding New Data Types
1. Create new database class following MonsterDatabase pattern
2. Implement standard methods (init, search, filter)
3. Add to main data manager
4. Update components to use new data

### External API Integration
1. Create API client classes
2. Implement caching strategy
3. Handle offline scenarios
4. Rate limiting and error handling

### Custom Content Management
1. Separate custom from official content
2. Import/export functionality
3. Version control for custom content
4. Sharing mechanisms

## 📊 Current Metrics

- **Total Monsters**: 20+ creatures
- **CR Range**: 0 to 5
- **Data Size**: ~15KB in JSON format
- **Types Covered**: Beast, Humanoid, Undead, Giant, Monstrosity
- **Search Performance**: <1ms for current dataset

## 🔮 Future Data Features

### Advanced Monster Data
- **Lair Actions**: For legendary creatures
- **Regional Effects**: Environmental modifications
- **Variants**: Different versions of same creature
- **Ecology**: Habitat and behavior information

### Campaign Integration
- **Encounter History**: Track which monsters were used
- **Monster Availability**: Campaign-specific monster lists
- **Custom Scaling**: Adjust monsters for different party levels

---

*Data is the foundation - keep it clean, validated, and well-structured!*