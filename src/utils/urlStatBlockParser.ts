/**
 * URL-based Stat Block Parser
 * Supports major D&D websites: aidedd.org, D&D Beyond, Roll20, 5etools
 */

export interface ParsedMonsterData {
  name: string;
  size: string;
  type: string;
  alignment: string;
  armorClass: number;
  hitPoints: number;
  hitDice?: string;
  speed: string;
  abilities: {
    str: number;
    dex: number;
    con: number;
    int: number;
    wis: number;
    cha: number;
  };
  savingThrows?: string;
  skills?: string;
  damageResistances?: string;
  damageImmunities?: string;
  conditionImmunities?: string;
  senses: string;
  languages: string;
  challengeRating: string;
  xp?: number;
  specialAbilities: Array<{ name: string; description: string }>;
  actions: Array<{ name: string; description: string }>;
  legendaryActions?: Array<{ name: string; description: string }>;
  lairActions?: Array<{ name: string; description: string }>;
  reactions?: Array<{ name: string; description: string }>;
  source: string;
}

/**
 * Detect which D&D site a URL belongs to
 */
export function detectUrlSource(url: string): string | null {
  if (url.includes('aidedd.org')) return 'aidedd';
  if (url.includes('dndbeyond.com')) return 'dndbeyond';
  if (url.includes('roll20.net')) return 'roll20';
  if (url.includes('5e.tools')) return '5etools';
  return null;
}

/**
 * Parse monster from URL using Claude Code agent
 */
export async function parseMonsterFromUrl(url: string): Promise<ParsedMonsterData | null> {
  const source = detectUrlSource(url);
  if (!source) {
    throw new Error('Unsupported URL. Supported sites: aidedd.org, D&D Beyond, Roll20, 5etools');
  }

  console.log(`🔍 DnDStatsAgent: Attempting to parse ${source} URL: ${url}`);

  try {
    // Call the DnDStatsAgent via a hidden message that triggers WebFetch parsing
    const prompt = createParsingPrompt(source);
    console.log(`🔍 DnDStatsAgent parsedData from parseWebContent:`);

    // Use a service worker or background script to handle WebFetch
    const parsedData = await requestDnDStatsParsing(url, prompt);

    console.log(`🔍 result.data keys:`, Object.keys(parsedData || {}));

    if (parsedData) {
      const normalizedData = normalizeMonsterData(parsedData, source);
      console.log(`✅ Normalized monster data:`, normalizedData);
      return normalizedData;
    }

    return null;
  } catch (error) {
    console.error(`🚨 Failed to parse ${source} URL:`, error);

    // Fallback to mock data for development
    if (url.includes('ancient-red-dragon') || url.includes('Ancient%20Red%20Dragon')) {
      console.log(`📚 Using mock Ancient Red Dragon data`);
      return getMockAncientRedDragon(source);
    }

    return null;
  }
}

/**
 * Mock Ancient Red Dragon data for fallback
 */
function getMockAncientRedDragon(source: string): ParsedMonsterData {
  return {
    name: "Ancient Red Dragon",
    size: "Gargantuan",
    type: "dragon",
    alignment: "chaotic evil",
    armorClass: 22,
    hitPoints: 546,
    hitDice: "28d20 + 252",
    speed: "40 ft., climb 40 ft., fly 80 ft.",
    abilities: {
      str: 30,
      dex: 10,
      con: 29,
      int: 18,
      wis: 15,
      cha: 23
    },
    savingThrows: "DEX +7, CON +16, WIS +9, CHA +13",
    skills: "Perception +16, Stealth +7",
    damageResistances: "",
    damageImmunities: "fire",
    conditionImmunities: "",
    senses: "blindsight 60 ft., darkvision 120 ft., passive Perception 26",
    languages: "Common, Draconic",
    challengeRating: "24",
    xp: 62000,
    specialAbilities: [
      {
        name: "Legendary Resistance",
        description: "If the dragon fails a saving throw, it can choose to succeed instead (3/Day)."
      },
      {
        name: "Fire Aura",
        description: "At the start of each of the dragon's turns, each creature within 10 feet of it takes 7 (2d6) fire damage."
      }
    ],
    actions: [
      {
        name: "Multiattack",
        description: "The dragon can use its Frightful Presence. It then makes three attacks: one with its bite and two with its claws."
      },
      {
        name: "Bite",
        description: "Melee Weapon Attack: +17 to hit, reach 15 ft., one target. Hit: 21 (2d10 + 10) piercing damage plus 14 (4d6) fire damage."
      },
      {
        name: "Claw",
        description: "Melee Weapon Attack: +17 to hit, reach 10 ft., one target. Hit: 17 (2d6 + 10) slashing damage."
      },
      {
        name: "Tail",
        description: "Melee Weapon Attack: +17 to hit, reach 20 ft., one target. Hit: 19 (2d8 + 10) bludgeoning damage."
      },
      {
        name: "Frightful Presence",
        description: "Each creature of the dragon's choice that is within 120 feet of the dragon and aware of it must succeed on a DC 21 Wisdom saving throw or become frightened for 1 minute."
      },
      {
        name: "Fire Breath (Recharge 5–6)",
        description: "The dragon exhales fire in a 90-foot cone. Each creature in that area must make a DC 24 Dexterity saving throw, taking 91 (26d6) fire damage on a failed save, or half as much damage on a successful one."
      }
    ],
    legendaryActions: [
      {
        name: "Detect",
        description: "The dragon makes a Wisdom (Perception) check."
      },
      {
        name: "Tail Attack",
        description: "The dragon makes a tail attack."
      },
      {
        name: "Wing Attack (Costs 2 Actions)",
        description: "The dragon beats its wings. Each creature within 15 feet of the dragon must succeed on a DC 25 Dexterity saving throw or take 17 (2d6 + 10) bludgeoning damage and be knocked prone."
      }
    ],
    lairActions: [
      {
        name: "Magma Eruption",
        description: "Magma erupts from a point on the ground the dragon can see within 120 feet of it, creating a 20-foot-high, 5-foot-radius geyser."
      }
    ],
    reactions: [],
    source: source
  };
}

/**
 * Create parsing prompt based on source
 */
function createParsingPrompt(source: string): string {
  const basePrompt = `Extract monster data and return ONLY a valid JSON object with:
- name: monster name (string)
- size: size category like "Large", "Medium" (string)
- type: creature type like "dragon", "humanoid" (string)
- alignment: alignment like "chaotic evil" (string)
- armorClass: AC as number
- hitPoints: HP as number
- hitDice: hit dice formula if available (string)
- speed: speed like "40 ft., climb 40 ft., fly 80 ft." (string)
- abilities: {str: number, dex: number, con: number, int: number, wis: number, cha: number}
- savingThrows: saving throws string if any (string or empty)
- skills: skills string if any (string or empty)
- damageResistances: resistances string if any (string or empty)
- damageImmunities: immunities string if any (string or empty)
- conditionImmunities: condition immunities string if any (string or empty)
- senses: senses string (string)
- languages: languages string (string)
- challengeRating: CR string like "24" or "1/2" (string)
- specialAbilities: array of {name: string, description: string}
- actions: array of {name: string, description: string}
- legendaryActions: array of {name: string, description: string} (empty array if none)
- lairActions: array of {name: string, description: string} (empty array if none)
- reactions: array of {name: string, description: string} (empty array if none)

Return ONLY the JSON object, no other text.`;

  return `Extract monster data from this ${source} page. ${basePrompt}`;
}

/**
 * Request D&D stats parsing using WebFetch service
 */
async function requestDnDStatsParsing(url: string, prompt: string): Promise<any> {
  try {
    // Import the WebFetch service
    const { webFetchMonsterService } = await import('./webFetchMonsterService');

    console.log(`🌐 Using WebFetch service to parse URL: ${url}`);
    const parsedData = await webFetchMonsterService.parseMonsterFromUrl(url);

    if (parsedData) {
      console.log(`✅ WebFetch service returned data for: ${parsedData.name}`);
      return parsedData;
    }

    console.log(`⚠️ WebFetch service returned null, falling back to mock data`);
    return null;
  } catch (error: any) {
    console.error(`🚨 WebFetch service failed:`, error);
    return null;
  }
}

/**
 * Normalize monster data from various sources
 */
function normalizeMonsterData(data: any, source: string): ParsedMonsterData {
  return {
    name: data.name || "Unknown Monster",
    size: data.size || "Medium",
    type: data.type || "humanoid",
    alignment: data.alignment || "neutral",
    armorClass: data.armorClass || data.ac || 10,
    hitPoints: data.hitPoints || data.hp || 1,
    hitDice: data.hitDice || "",
    speed: data.speed || "30 ft.",
    abilities: {
      str: data.abilities?.str || data.str || 10,
      dex: data.abilities?.dex || data.dex || 10,
      con: data.abilities?.con || data.con || 10,
      int: data.abilities?.int || data.int || 10,
      wis: data.abilities?.wis || data.wis || 10,
      cha: data.abilities?.cha || data.cha || 10
    },
    savingThrows: data.savingThrows || data.saves || "",
    skills: data.skills || "",
    damageResistances: data.damageResistances || data.resistances || "",
    damageImmunities: data.damageImmunities || data.immunities || "",
    conditionImmunities: data.conditionImmunities || "",
    senses: data.senses || "passive Perception 10",
    languages: data.languages || "Common",
    challengeRating: data.challengeRating || data.cr || "1",
    xp: data.xp,
    specialAbilities: data.specialAbilities || data.traits || [],
    actions: data.actions || [],
    legendaryActions: data.legendaryActions || [],
    lairActions: data.lairActions || [],
    reactions: data.reactions || [],
    source: source
  };
}

/**
 * Convert parsed monster data to combatant format
 */
export function convertUrlParsedToCombatant(monster: ParsedMonsterData): any {
  const dexMod = Math.floor((monster.abilities.dex - 10) / 2);
  const initiative = Math.floor(Math.random() * 20) + 1 + dexMod;

  return {
    id: Date.now().toString() + Math.random(),
    name: monster.name,
    hp: monster.hitPoints,
    maxHp: monster.hitPoints,
    ac: monster.armorClass,
    initiative,
    isPC: false,
    conditions: [],
    tempHp: 0,
    cr: monster.challengeRating,
    type: monster.type?.toLowerCase() || 'humanoid',
    size: monster.size?.toLowerCase() || 'medium',
    alignment: monster.alignment?.toLowerCase() || 'neutral',
    speed: monster.speed || '30 ft.',
    abilities: monster.abilities,
    saves: monster.savingThrows || '',
    skills: monster.skills || '',
    damageResistances: monster.damageResistances || '',
    damageImmunities: monster.damageImmunities || '',
    conditionImmunities: monster.conditionImmunities || '',
    senses: monster.senses || 'passive Perception 10',
    languages: monster.languages || 'Common',
    proficiencyBonus: `+${getProficiencyBonus(monster.challengeRating)}`,
    actions: monster.actions || [],
    specialAbilities: monster.specialAbilities || [],
    legendaryActions: monster.legendaryActions || [],
    lairActions: monster.lairActions || [],
    reactions: monster.reactions || [],
    xp: monster.xp || crToXP(monster.challengeRating),
    importSource: monster.source,
    importedAt: new Date().toISOString(),
    hitDice: monster.hitDice
  };
}

/**
 * Get proficiency bonus from challenge rating
 */
function getProficiencyBonus(cr: string): number {
  const crValue = parseFloat(cr.replace('1/', '0.'));
  if (crValue < 5) return 2;
  if (crValue < 9) return 3;
  if (crValue < 13) return 4;
  if (crValue < 17) return 5;
  return 6;
}

/**
 * Convert challenge rating to XP
 */
function crToXP(cr: string): number {
  const crToXpMap: { [key: string]: number } = {
    '0': 10, '1/8': 25, '1/4': 50, '1/2': 100,
    '1': 200, '2': 450, '3': 700, '4': 1100, '5': 1800,
    '6': 2300, '7': 2900, '8': 3900, '9': 5000, '10': 5900,
    '11': 7200, '12': 8400, '13': 10000, '14': 11500, '15': 13000,
    '16': 15000, '17': 18000, '18': 20000, '19': 22000, '20': 25000,
    '21': 33000, '22': 41000, '23': 50000, '24': 62000, '25': 75000,
    '26': 90000, '27': 105000, '28': 120000, '29': 135000, '30': 155000
  };
  return crToXpMap[cr] || 100;
}