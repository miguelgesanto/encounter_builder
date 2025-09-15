# Conditions & Status Effects System

## 🎯 Purpose
Comprehensive D&D 5e condition tracking with automation, duration management, and turn-based effects processing.

## ✅ Current Features

### Basic Conditions
- **16 D&D 5e conditions** with official descriptions
- **Visual indicators** with color-coded badges
- **Hover tooltips** for condition details
- **One-click application** from dropdown menu
- **Easy removal** with click-to-remove interface

### Condition Definitions
- Blinded, Charmed, Deafened, Frightened
- Grappled, Incapacitated, Invisible, Paralyzed
- Petrified, Poisoned, Prone, Restrained
- Stunned, Unconscious, Exhaustion, Concentration

## 🚧 Phase 2: Duration & Automation (Next)

### Duration Tracking
- **Condition duration** input (rounds/turns)
- **Automatic countdown** at end of turn
- **Expiration notifications** when conditions end
- **Save vs condition** prompts for appropriate effects
- **Concentration checks** with automatic DC calculation

### Turn-Based Effects
- **Start of turn effects** (e.g., poison damage, regeneration)
- **End of turn effects** (e.g., condition saves, duration reduction)
- **Ongoing damage** tracking with damage types
- **Automatic HP adjustments** for recurring effects

### Advanced Condition Management
- **Custom conditions** for homebrew effects
- **Condition stacking** rules (exhaustion levels)
- **Condition immunity** tracking per creature
- **Condition interactions** (e.g., unconscious → prone)

## 📋 Phase 3: Advanced Automation

### Effect Processing
- **Automatic advantage/disadvantage** application
- **Speed modifications** (grappled, prone, exhaustion)
- **Action restrictions** (incapacitated, stunned)
- **Saving throw modifications** 
- **Attack roll modifications**

### Spell Effect Integration
- **Spell duration tracking** (concentration, timed)
- **Spell effect automation** (common spell conditions)
- **Upcast scaling** for spell effects
- **Spell slot tracking** integration

### Notification System
- **Turn notifications** for active effects
- **Damage reminders** for ongoing effects
- **Save prompts** at appropriate times
- **Effect expiration alerts**

## 🎮 Phase 4: Interactive Features

### Condition Shortcuts
- **Quick condition sets** (common combinations)
- **Condition templates** for spells/abilities
- **Bulk condition application** to multiple targets
- **Condition copying** between creatures

### Visual Enhancements
- **Condition animations** for visual feedback
- **Status overlays** on creature cards
- **Color-coded severity** indicators
- **Icon-based condition display**

## 🔧 Technical Implementation

### Data Structure
```typescript
interface Condition {
  name: string;
  description: string;
  duration?: number;
  durationType: 'rounds' | 'turns' | 'permanent' | 'concentration';
  source?: string; // Spell/ability that caused it
  severity?: number; // For conditions like exhaustion
  effects: {
    advantage?: string[]; // What gets advantage
    disadvantage?: string[]; // What gets disadvantage
    speedModifier?: number;
    actionRestrictions?: string[];
    savingThrowMods?: Record<string, number>;
  };
  ongoingDamage?: {
    amount: string; // Dice expression like "1d6"
    type: string; // Damage type
    saveEnds?: { ability: string; dc: number };
  };
}
```

### Automation Hooks
- `onTurnStart(creature, conditions)` - Process start-of-turn effects
- `onTurnEnd(creature, conditions)` - Process end-of-turn effects  
- `onConditionApplied(creature, condition)` - Initial application
- `onConditionRemoved(creature, condition)` - Cleanup effects

## 📚 How It Works

### Current Implementation
1. **Selection**: Click "+ Condition" to open dropdown
2. **Application**: Click condition name to apply
3. **Display**: Visual badges show active conditions
4. **Removal**: Click X on condition badge to remove
5. **Information**: Hover for condition descriptions

### Planned Workflow
1. **Duration Input**: Set rounds/turns when applying
2. **Auto-Processing**: System handles turn-based updates
3. **Notifications**: Alerts for saves, damage, expiration
4. **Integration**: Conditions affect rolls and actions automatically

## 🎯 What's Left to Do

### Immediate (Phase 2)
- [ ] Add duration input fields
- [ ] Implement turn-based countdown
- [ ] Create notification system
- [ ] Add start/end turn effect processing

### Short-term (Phase 3)
- [ ] Automatic advantage/disadvantage application
- [ ] Ongoing damage tracking
- [ ] Concentration check automation
- [ ] Save vs condition prompts

### Long-term (Phase 4)
- [ ] Custom condition creation
- [ ] Spell effect templates
- [ ] Bulk condition management
- [ ] Advanced visual indicators

## 🔗 Integration Points

**Initiative Tracker**: Processes conditions each turn
**Dice Roller**: Applies advantage/disadvantage automatically  
**Creature Stats**: Modifies displayed values based on conditions
**Spell Tracker**: Links spell effects to conditions
**Campaign Log**: Records condition applications for session notes