// Monster/creature import parsing utilities

import { Combatant } from '../types/combatant';
import { ImportResult, extractNumber, extractString, sanitizeHPValue, sanitizeACValue, crToXP, validateImportText, sanitizeName, validateCR } from './importUtils';

export interface MonsterImportData {
  name: string;
  hp: number;
  maxHp: number;
  ac: number;
  initiative: number;
  isPC: false;
  conditions: Array<{ name: string; duration?: number }>;
  cr?: string;
  type?: string;
  environment?: string;
  xp?: number;
  tempHp: number;
  size?: string;
  alignment?: string;
  abilities?: {
    str?: number;
    dex?: number;
    con?: number;
    int?: number;
    wis?: number;
    cha?: number;
  };
  saves?: string;
  skills?: string;
  damageResistances?: string;
  damageImmunities?: string;
  conditionImmunities?: string;
  senses?: string;
  languages?: string;
  speed?: string;
  legendaryActions?: Array<{ name: string; description: string; cost?: number }>;
  lairActions?: Array<{ name: string; description: string }>;
  specialAbilities?: Array<{ name: string; description: string }>;
  actions?: Array<{ name: string; description: string }>;
}

export const parseMonster = async (text: string): Promise<ImportResult> => {
  try {
    // Use the enhanced stat block parser for all text-based parsing
    return parseEnhancedStatBlock(text);
  } catch (error) {
    console.error('❌ parseMonster failed:', error);
    return {
      success: false,
      type: 'monster',
      confidence: 'low',
      data: {},
      warnings: [],
      errors: [`Parse error: ${error instanceof Error ? error.message : 'Unknown error'}`],
      source: 'text'
    };
  }
};


// Helper functions for extracting monster data
const extractMonsterName = (text: string): string => {
  // Look for patterns like first line being the name, or "Name: Dragon"
  let name = extractString(text, /^([^.\n]+?)\.?\s*$/m);

  if (!name || name.length > 50) {
    // Try explicit name pattern
    name = extractString(text, /name\s*:?\s*([^\n,]+)/i);
  }

  if (!name) {
    // Take first line if it's reasonable length
    const firstLine = text.split('\n')[0];
    if (firstLine && firstLine.length < 50) {
      name = firstLine.trim().replace(/\.$/, '');
    }
  }

  return name;
};

const extractHP = (text: string): number => {
  // Look for various HP patterns in stat blocks
  let hp = extractNumber(text, /hit points?\s*(\d+)/i);

  if (!hp) {
    hp = extractNumber(text, /hp\s*(\d+)/i);
  }

  if (!hp) {
    // Look for pattern like "Hit Points 58 (9d8 + 18)"
    hp = extractNumber(text, /hit points?\s*(\d+)\s*\(/i);
  }

  return hp;
};

const extractAC = (text: string): number => {
  return extractNumber(text, /armor class\s*(\d+)/i, 10);
};

const extractCR = (text: string): string => {
  // Look for Challenge Rating patterns
  let cr = extractString(text, /challenge\s*(?:rating)?\s*([^\s,\n(]+)/i);

  if (!cr) {
    cr = extractString(text, /cr\s*([^\s,\n(]+)/i);
  }

  // Handle fractions
  if (cr) {
    cr = cr.replace(/one[\s-]?half|1\/2/i, '1/2');
    cr = cr.replace(/one[\s-]?quarter|1\/4/i, '1/4');
    cr = cr.replace(/one[\s-]?eighth|1\/8/i, '1/8');
  }

  return cr;
};

const extractType = (text: string): string => {
  // Look for creature type patterns
  const typePattern = /(?:medium|small|large|huge|gargantuan|tiny)\s+([\w\s]+?)(?:,|\.|$)/i;
  let type = extractString(text, typePattern);

  if (!type) {
    // Common creature types
    const types = ['aberration', 'beast', 'celestial', 'construct', 'dragon', 'elemental',
                   'fey', 'fiend', 'giant', 'humanoid', 'monstrosity', 'ooze', 'plant',
                   'undead'];

    for (const t of types) {
      if (text.toLowerCase().includes(t)) {
        type = t;
        break;
      }
    }
  }

  return type;
};

const extractSize = (text: string): string => {
  const sizes = ['tiny', 'small', 'medium', 'large', 'huge', 'gargantuan'];

  for (const size of sizes) {
    if (text.toLowerCase().includes(size)) {
      return size;
    }
  }

  return 'medium'; // Default size
};

const extractAlignment = (text: string): string => {
  const alignments = [
    'lawful good', 'neutral good', 'chaotic good',
    'lawful neutral', 'true neutral', 'chaotic neutral',
    'lawful evil', 'neutral evil', 'chaotic evil',
    'unaligned', 'any alignment'
  ];

  for (const alignment of alignments) {
    if (text.toLowerCase().includes(alignment)) {
      return alignment;
    }
  }

  return 'unaligned';
};

const extractEnvironment = (text: string): string => {
  const environments = [
    'arctic', 'coast', 'desert', 'forest', 'grassland', 'hill',
    'mountain', 'swamp', 'underdark', 'underwater', 'urban'
  ];

  for (const env of environments) {
    if (text.toLowerCase().includes(env)) {
      return env;
    }
  }

  return 'any';
};


// Enhanced stat block parser that handles all D&D creature features
export const parseEnhancedStatBlock = (text: string): ImportResult => {
  const warnings: string[] = [];
  const errors: string[] = [];

  try {
    const validation = validateImportText(text);
    if (!validation.isValid) {
      errors.push(...validation.errors);
      return {
        success: false,
        type: 'monster',
        confidence: 'low',
        data: {},
        warnings,
        errors,
        source: 'text'
      };
    }

    // Extract all monster components
    const name = sanitizeName(extractMonsterName(text));
    const hp = extractHP(text);
    const ac = extractAC(text);
    const rawCR = extractCR(text);
    const type = extractType(text);
    const size = extractSize(text);
    const alignment = extractAlignment(text);
    const environment = extractEnvironment(text);

    // Enhanced ability score extraction
    const abilities = extractAbilityScores(text);
    const speed = extractSpeed(text);
    const saves = extractSavingThrows(text);
    const skills = extractSkills(text);
    const damageResistances = extractDamageResistances(text);
    const damageImmunities = extractDamageImmunities(text);
    const conditionImmunities = extractConditionImmunities(text);
    const senses = extractSenses(text);
    const languages = extractLanguages(text);

    // Extract special abilities and actions
    const specialAbilities = extractSpecialAbilities(text);
    const actions = extractActions(text);
    const legendaryActions = extractLegendaryActions(text);
    const lairActions = extractLairActions(text);

    // Validate and normalize CR
    const crValidation = validateCR(rawCR);
    warnings.push(...crValidation.warnings);
    const cr = crValidation.normalized;

    if (!name) {
      errors.push('Could not find monster name');
    }

    if (!hp) {
      warnings.push('HP not found, using default value');
    }

    if (!ac) {
      warnings.push('AC not found, using default value');
    }

    const xp = crToXP(cr);

    const monsterData: MonsterImportData = {
      name,
      hp: sanitizeHPValue(hp),
      maxHp: sanitizeHPValue(hp),
      ac: sanitizeACValue(ac),
      initiative: 0,
      isPC: false,
      conditions: [],
      cr,
      type: type || 'humanoid',
      environment: environment || 'any',
      xp,
      tempHp: 0,
      size,
      alignment,
      abilities,
      speed,
      saves,
      skills,
      damageResistances,
      damageImmunities,
      conditionImmunities,
      senses,
      languages,
      specialAbilities,
      actions,
      legendaryActions,
      lairActions
    };

    return {
      success: true,
      type: 'monster',
      confidence: 'high',
      data: monsterData,
      warnings,
      errors,
      source: 'text'
    };

  } catch (error) {
    errors.push(`Failed to parse monster: ${error instanceof Error ? error.message : 'Unknown error'}`);

    return {
      success: false,
      type: 'monster',
      confidence: 'low',
      data: {},
      warnings,
      errors,
      source: 'text'
    };
  }
};

// Parse multiple monsters from bulk text
export const parseBulkMonsters = (text: string): ImportResult[] => {
  // For URL import, we don't support bulk - just return empty array
  if (text.trim().startsWith('http')) {
    return [];
  }

  // Split by double newlines or separator lines
  const sections = text.split(/\n\s*\n|\n\s*[-=]{3,}\s*\n/);

  return sections
    .filter(section => section.trim().length > 20)
    .map(section => parseMonster(section))
    .filter(result => result.success);
};

// Enhanced parsing functions for detailed stat blocks

const extractAbilityScores = (text: string) => {
  const abilities = { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };

  // Look for standard stat block format with headers on one line and scores on the next
  const headerMatch = text.match(/STR\s+DEX\s+CON\s+INT\s+WIS\s+CHA/i);
  if (headerMatch) {
    const afterHeaders = text.substring(headerMatch.index! + headerMatch[0].length);
    const scoreMatch = afterHeaders.match(/(\d+)\s*\([+-]?\d+\)\s+(\d+)\s*\([+-]?\d+\)\s+(\d+)\s*\([+-]?\d+\)\s+(\d+)\s*\([+-]?\d+\)\s+(\d+)\s*\([+-]?\d+\)\s+(\d+)\s*\([+-]?\d+\)/);

    if (scoreMatch) {
      abilities.str = parseInt(scoreMatch[1]) || 10;
      abilities.dex = parseInt(scoreMatch[2]) || 10;
      abilities.con = parseInt(scoreMatch[3]) || 10;
      abilities.int = parseInt(scoreMatch[4]) || 10;
      abilities.wis = parseInt(scoreMatch[5]) || 10;
      abilities.cha = parseInt(scoreMatch[6]) || 10;
    }
  }

  // Fallback: try to find inline format
  if (abilities.str === 10) {
    const inlineMatch = text.match(/STR\s+DEX\s+CON\s+INT\s+WIS\s+CHA\s+(\d+)\s*\([+-]?\d+\)\s+(\d+)\s*\([+-]?\d+\)\s+(\d+)\s*\([+-]?\d+\)\s+(\d+)\s*\([+-]?\d+\)\s+(\d+)\s*\([+-]?\d+\)\s+(\d+)\s*\([+-]?\d+\)/i);
    if (inlineMatch) {
      abilities.str = parseInt(inlineMatch[1]) || 10;
      abilities.dex = parseInt(inlineMatch[2]) || 10;
      abilities.con = parseInt(inlineMatch[3]) || 10;
      abilities.int = parseInt(inlineMatch[4]) || 10;
      abilities.wis = parseInt(inlineMatch[5]) || 10;
      abilities.cha = parseInt(inlineMatch[6]) || 10;
    }
  }

  return abilities;
};

const extractSpeed = (text: string): string => {
  const match = text.match(/Speed\s+([^.]*)/i);
  return match ? match[1].trim() : '30 ft.';
};

const extractSavingThrows = (text: string): string => {
  const match = text.match(/Saving Throws\s+([^.]*)/i);
  return match ? match[1].trim() : '';
};

const extractSkills = (text: string): string => {
  const match = text.match(/Skills\s+([^.]*)/i);
  return match ? match[1].trim() : '';
};

const extractDamageResistances = (text: string): string => {
  const match = text.match(/Damage Resistances\s+([^.]*)/i);
  return match ? match[1].trim() : '';
};

const extractDamageImmunities = (text: string): string => {
  const match = text.match(/Damage Immunities\s+([^.]*)/i);
  return match ? match[1].trim() : '';
};

const extractConditionImmunities = (text: string): string => {
  const match = text.match(/Condition Immunities\s+([^.]*)/i);
  return match ? match[1].trim() : '';
};

const extractSenses = (text: string): string => {
  const match = text.match(/Senses\s+([^.]*)/i);
  return match ? match[1].trim() : 'passive Perception 10';
};

const extractLanguages = (text: string): string => {
  const match = text.match(/Languages\s+([^.]*)/i);
  return match ? match[1].trim() : '—';
};

const extractSpecialAbilities = (text: string): Array<{ name: string; description: string }> => {
  const abilities: Array<{ name: string; description: string }> = [];

  // Look for abilities between languages and actions sections
  const sections = text.split(/(?=Actions?|Legendary Actions?|Lair Actions?)/i);
  const abilitySection = sections[0];

  // Match pattern: "Name. Description"
  const abilityMatches = abilitySection.match(/([A-Z][^.]*?)\.\s+([^.]*?(?:\.|$))/g);

  if (abilityMatches) {
    for (const match of abilityMatches) {
      const parts = match.split(/\.\s+/);
      if (parts.length >= 2) {
        const name = parts[0].trim();
        const description = parts.slice(1).join('. ').trim();

        // Skip if it looks like a stat line
        if (!name.match(/STR|DEX|CON|INT|WIS|CHA|Speed|Armor Class|Hit Points|Challenge/i)) {
          abilities.push({ name, description });
        }
      }
    }
  }

  return abilities;
};

const extractActions = (text: string): Array<{ name: string; description: string }> => {
  const actions: Array<{ name: string; description: string }> = [];

  // Find the Actions section
  const actionsMatch = text.match(/Actions?\s+(.*?)(?=Legendary Actions?|Lair Actions?|$)/is);

  if (actionsMatch) {
    const actionsText = actionsMatch[1];

    // Match pattern: "Name. Description"
    const actionMatches = actionsText.match(/([A-Z][^.]*?)\.\s+([^.]*?(?:\.|$))/g);

    if (actionMatches) {
      for (const match of actionMatches) {
        const parts = match.split(/\.\s+/);
        if (parts.length >= 2) {
          const name = parts[0].trim();
          const description = parts.slice(1).join('. ').trim();
          actions.push({ name, description });
        }
      }
    }
  }

  return actions;
};

const extractLegendaryActions = (text: string): Array<{ name: string; description: string; cost?: number }> => {
  const legendaryActions: Array<{ name: string; description: string; cost?: number }> = [];

  // Find the Legendary Actions section
  const legendaryMatch = text.match(/Legendary Actions?\s*\n?(.*?)(?=\n\n|\nLair Actions?|\n[A-Z][a-z]+\s[A-Z]|$)/s);

  if (legendaryMatch) {
    const legendaryText = legendaryMatch[1];

    // Split by lines and process each action
    const lines = legendaryText.split('\n').filter(line => line.trim());

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Skip the description line
      if (line.toLowerCase().includes('the dragon can take') || line.toLowerCase().includes('choosing from')) {
        continue;
      }

      // Look for action pattern: "Name. Description" or "Name (Costs X). Description"
      const actionMatch = line.match(/^([A-Z][^.(]*?)(?:\s*\(Costs?\s+(\d+)\s+Actions?\))?\.\s*(.*)$/);

      if (actionMatch) {
        const name = actionMatch[1].trim();
        const cost = actionMatch[2] ? parseInt(actionMatch[2]) : 1;
        const description = actionMatch[3].trim();

        legendaryActions.push({ name, description, cost });
      }
    }
  }

  return legendaryActions;
};

const extractLairActions = (text: string): Array<{ name: string; description: string }> => {
  const lairActions: Array<{ name: string; description: string }> = [];

  // Find the Lair Actions section
  const lairMatch = text.match(/Lair Actions?\s*\n?(.*?)$/s);

  if (lairMatch) {
    const lairText = lairMatch[1];

    // Split by lines and process each action
    const lines = lairText.split('\n').filter(line => line.trim());

    for (const line of lines) {
      const trimmedLine = line.trim();

      // Skip description lines
      if (trimmedLine.toLowerCase().includes('on initiative count') || trimmedLine.toLowerCase().includes('following effects')) {
        continue;
      }

      // Look for bullet point actions: "• Action description."
      const bulletMatch = trimmedLine.match(/^[•*-]\s*(.+)$/);
      if (bulletMatch) {
        const actionText = bulletMatch[1].trim();
        // Try to extract a name from the beginning of the action
        const firstWords = actionText.split(' ').slice(0, 3).join(' ');
        const name = firstWords.charAt(0).toUpperCase() + firstWords.slice(1);
        lairActions.push({ name, description: actionText });
      }
    }
  }

  return lairActions;
};

// Example stat blocks for common creatures
const getExampleDragonStatBlock = (name: string): string => {
  return `${name}
Huge dragon, chaotic evil

Armor Class 19 (Natural Armor)
Hit Points 256 (19d12 + 133)
Speed 40 ft., climb 40 ft., fly 80 ft.

STR     DEX     CON     INT     WIS     CHA
27 (+8) 10 (+0) 25 (+7) 16 (+3) 13 (+1) 21 (+5)

Saving Throws Dex +6, Con +13, Wis +7, Cha +11
Skills Perception +13, Stealth +6
Damage Immunities Fire
Senses Blindsight 60 ft., Darkvision 120 ft., passive Perception 23
Languages Common, Draconic
Challenge 17 (18,000 XP)

Legendary Resistance (3/Day). If the dragon fails a saving throw, it can choose to succeed instead.

Actions
Multiattack. The dragon can use its Frightful Presence. It then makes three attacks: one with its bite and two with its claws.

Bite. Melee Weapon Attack: +14 to hit, reach 10 ft., one target. Hit: 19 (2d10 + 8) piercing damage plus 7 (2d6) fire damage.

Claw. Melee Weapon Attack: +14 to hit, reach 5 ft., one target. Hit: 15 (2d6 + 8) slashing damage.

Fire Breath (Recharge 5–6). The dragon exhales fire in a 60-foot cone. Each creature in that area must make a DC 21 Dexterity saving throw, taking 63 (18d6) fire damage on a failed save, or half as much damage on a successful one.

Legendary Actions
The dragon can take 3 legendary actions, choosing from the options below. Only one legendary action option can be used at a time and only at the end of another creature's turn.

Detect. The dragon makes a Wisdom (Perception) check.
Tail Attack. The dragon makes a tail attack.
Wing Attack (Costs 2 Actions). The dragon beats its wings.

Lair Actions
On initiative count 20, the dragon takes a lair action to cause one of the following effects:
• Magma erupts from a point within 120 feet, dealing 21 (6d6) fire damage to creatures within 20 feet.
• The dragon creates an opaque wall of stone within 120 feet.`;
};

const getExampleTrollStatBlock = (): string => {
  return `Troll
Large giant, chaotic evil

Armor Class 15 (Natural Armor)
Hit Points 84 (8d12 + 32)
Speed 30 ft.

STR     DEX     CON     INT     WIS     CHA
18 (+4) 13 (+1) 20 (+5) 7 (-2)  9 (-1)  7 (-2)

Skills Perception +2
Senses Darkvision 60 ft., passive Perception 12
Languages Giant
Challenge 5 (1,800 XP)

Keen Smell. The troll has advantage on Wisdom (Perception) checks that rely on smell.

Regeneration. The troll regains 10 hit points at the start of its turn. If the troll takes acid or fire damage, this trait doesn't function at the start of the troll's next turn. The troll dies only if it starts its turn with 0 hit points and doesn't regenerate.

Actions
Multiattack. The troll makes three attacks: one with its bite and two with its claws.

Bite. Melee Weapon Attack: +7 to hit, reach 5 ft., one target. Hit: 7 (1d6 + 4) piercing damage.

Claw. Melee Weapon Attack: +7 to hit, reach 5 ft., one target. Hit: 11 (2d6 + 4) slashing damage.`;
};

const getExampleOwlbearStatBlock = (): string => {
  return `Owlbear
Large monstrosity, unaligned

Armor Class 13 (Natural Armor)
Hit Points 59 (7d10 + 21)
Speed 40 ft.

STR     DEX     CON     INT     WIS     CHA
20 (+5) 12 (+1) 17 (+3) 3 (-4)  12 (+1) 7 (-2)

Skills Perception +3
Senses Darkvision 60 ft., passive Perception 13
Languages —
Challenge 3 (700 XP)

Keen Sight and Smell. The owlbear has advantage on Wisdom (Perception) checks that rely on sight or smell.

Actions
Multiattack. The owlbear makes two attacks: one with its beak and one with its claws.

Beak. Melee Weapon Attack: +7 to hit, reach 5 ft., one target. Hit: 10 (1d10 + 5) piercing damage.

Claw. Melee Weapon Attack: +7 to hit, reach 5 ft., one target. Hit: 14 (2d8 + 5) slashing damage.`;
};

const getExampleStatBlock = (name: string): string => {
  return `${name}
Medium humanoid, neutral evil

Armor Class 15 (Chain Shirt, Shield)
Hit Points 58 (9d8 + 18)
Speed 30 ft.

STR     DEX     CON     INT     WIS     CHA
16 (+3) 13 (+1) 14 (+2) 10 (+0) 11 (+0) 10 (+0)

Skills Athletics +5, Intimidation +2
Senses passive Perception 10
Languages Common
Challenge 5 (1,800 XP)

Brave. The ${name.toLowerCase()} has advantage on saving throws against being frightened.

Actions
Multiattack. The ${name.toLowerCase()} makes two melee attacks.

Longsword. Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 7 (1d8 + 3) slashing damage, or 8 (1d10 + 3) slashing damage if used with two hands.`;
};

// Convert monster import data to Combatant format
export const importDataToCombatant = (importData: MonsterImportData): Combatant => {
  console.log('🔄 importDataToCombatant called with:', importData);
  console.log('🔍 importData abilities:', importData.abilities);
  console.log('🔍 importData actions:', importData.actions);

  const id = Date.now().toString() + Math.random();

  const combatant = {
    id,
    name: importData.name,
    hp: importData.hp,
    maxHp: importData.maxHp,
    ac: importData.ac,
    initiative: importData.initiative,
    isPC: false,
    conditions: importData.conditions,
    cr: importData.cr,
    type: importData.type,
    environment: importData.environment,
    xp: importData.xp,
    tempHp: importData.tempHp,
    abilities: importData.abilities,
    speed: importData.speed,
    saves: importData.saves,
    skills: importData.skills,
    damageResistances: importData.damageResistances,
    damageImmunities: importData.damageImmunities,
    conditionImmunities: importData.conditionImmunities,
    senses: importData.senses,
    languages: importData.languages,
    specialAbilities: importData.specialAbilities,
    actions: importData.actions,
    legendaryActions: importData.legendaryActions,
    lairActions: importData.lairActions,
    importSource: 'text' as const,
    importedAt: new Date().toISOString()
  };

  console.log('✅ Created combatant:', combatant);
  console.log('✅ Combatant abilities:', combatant.abilities);
  console.log('✅ Combatant actions:', combatant.actions);

  return combatant;
};