/**
 * Open5e API Integration
 * Uses the Open5e API (api.open5e.com) for monster database
 * Rich SRD content with source information and detailed monster stats
 */

const API_BASE_URL = 'https://api.open5e.com';

export interface MonsterListEntry {
  slug: string;
  name: string;
  url?: string;
  document__title?: string;
  document__slug?: string;
  challenge_rating?: string;
}

export interface MonsterDetail {
  slug: string;
  name: string;
  size: string;
  type: string;
  subtype?: string;
  alignment: string;
  armor_class: number;
  hit_points: number;
  hit_dice: string;
  speed: {
    walk?: string;
    swim?: string;
    fly?: string;
    burrow?: string;
    climb?: string;
  };
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  proficiencies: Array<{
    value: number;
    proficiency: {
      index: string;
      name: string;
      url: string;
    };
  }>;
  damage_vulnerabilities: string[];
  damage_resistances: string[];
  damage_immunities: string[];
  condition_immunities: Array<{
    index: string;
    name: string;
    url: string;
  }>;
  senses: {
    passive_perception: number;
    blindsight?: string;
    darkvision?: string;
    tremorsense?: string;
    truesight?: string;
  };
  languages: string;
  challenge_rating: number;
  proficiency_bonus: number;
  xp: number;
  special_abilities?: Array<{
    name: string;
    desc: string;
    spellcasting?: {
      level: number;
      ability: {
        index: string;
        name: string;
        url: string;
      };
      dc: number;
      modifier: number;
      components_required: string[];
      school: string;
      slots: { [key: string]: number };
      spells: Array<{
        level: number;
        spells: Array<{
          name: string;
          url: string;
        }>;
      }>;
    };
  }>;
  actions?: Array<{
    name: string;
    desc: string;
    attack_bonus?: number;
    damage?: Array<{
      damage_type: {
        index: string;
        name: string;
        url: string;
      };
      damage_dice: string;
    }>;
  }>;
  legendary_actions?: Array<{
    name: string;
    desc: string;
  }>;
  reactions?: Array<{
    name: string;
    desc: string;
  }>;
  url: string;
}

/**
 * D&D 5e API Client
 */
export class DnD5eAPI {
  private baseUrl: string;
  private monstersCache: MonsterListEntry[] | null = null;
  private monsterDetailsCache: Map<string, MonsterDetail> = new Map();
  private pendingRequests: Map<string, Promise<any>> = new Map();
  private batchQueue: Set<string> = new Set();
  private batchTimeout: NodeJS.Timeout | null = null;
  private lastCacheUpdate: number = 0;
  private CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  constructor(baseUrl = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Get all monsters list with improved caching
   */
  async getMonsters(): Promise<MonsterListEntry[]> {
    const now = Date.now();

    // Check if cache is still valid
    if (this.monstersCache && (now - this.lastCacheUpdate) < this.CACHE_DURATION) {
      return this.monstersCache;
    }

    // Deduplicate requests
    const cacheKey = 'monsters-list';
    if (this.pendingRequests.has(cacheKey)) {
      return await this.pendingRequests.get(cacheKey)!;
    }

    const promise = this.fetchMonstersList();
    this.pendingRequests.set(cacheKey, promise);

    try {
      const result = await promise;
      this.lastCacheUpdate = now;
      return result;
    } finally {
      this.pendingRequests.delete(cacheKey);
    }
  }

  private async fetchMonstersList(): Promise<MonsterListEntry[]> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

      const response = await fetch(`${this.baseUrl}/monsters/?limit=1000`, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json'
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      this.monstersCache = data.results || [];
      return this.monstersCache;
    } catch (error) {
      console.error('Failed to fetch monsters list:', error);
      throw error;
    }
  }

  /**
   * Get detailed monster data with request deduplication
   */
  async getMonster(slug: string): Promise<MonsterDetail> {
    // Check cache first
    if (this.monsterDetailsCache.has(slug)) {
      return this.monsterDetailsCache.get(slug)!;
    }

    // Deduplicate concurrent requests
    const cacheKey = `monster-${slug}`;
    if (this.pendingRequests.has(cacheKey)) {
      return await this.pendingRequests.get(cacheKey)!;
    }

    const promise = this.fetchMonsterDetail(slug);
    this.pendingRequests.set(cacheKey, promise);

    try {
      return await promise;
    } finally {
      this.pendingRequests.delete(cacheKey);
    }
  }

  private async fetchMonsterDetail(slug: string): Promise<MonsterDetail> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s timeout

      const response = await fetch(`${this.baseUrl}/monsters/${slug}`, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json'
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const monster = await response.json();
      console.log(`🔍 Fetched monster details for ${slug}`);

      this.monsterDetailsCache.set(slug, monster);
      return monster;
    } catch (error) {
      console.error(`Failed to fetch monster ${slug}:`, error);
      throw error;
    }
  }

  /**
   * Search monsters by name (fuzzy search)
   */
  /**
   * Enhanced monster search with additional sources
   */
  async searchMonsters(query: string): Promise<MonsterListEntry[]> {
    const monsters = await this.getMonsters();
    const normalizedQuery = query.toLowerCase().trim();

    if (!normalizedQuery) {
      return [];
    }

    // First filter by search criteria
    const filteredMonsters = monsters.filter(monster => {
      const name = monster.name?.toLowerCase() || '';
      const slug = monster.slug?.toLowerCase() || '';

      // Exact match first
      if (name === normalizedQuery || slug === normalizedQuery) {
        return true;
      }

      // Contains match
      if (name.includes(normalizedQuery) || slug.includes(normalizedQuery)) {
        return true;
      }

      // Word boundary match
      const words = normalizedQuery.split(' ');
      return words.every(word =>
        name.includes(word) || slug.includes(word)
      );
    });

    // Remove duplicates by prioritizing core D&D 5e sources
    const uniqueMonsters = new Map<string, MonsterListEntry>();
    const sourcePriority: Record<string, number> = {
      '5e Core Rules': 1,
      'Systems Reference Document': 2,
      'Level Up Advanced 5e Monstrous Menagerie': 3,
      'Tome of Beasts': 4,
      'Tome of Beasts 2': 5,
      'Creature Codex': 6
    };

    filteredMonsters.forEach(monster => {
      const baseName = monster.name.toLowerCase();
      const currentPriority = sourcePriority[monster.document__title || ''] || 99;

      if (!uniqueMonsters.has(baseName) ||
          currentPriority < (sourcePriority[uniqueMonsters.get(baseName)?.document__title || ''] || 99)) {
        uniqueMonsters.set(baseName, monster);
      }
    });

    return Array.from(uniqueMonsters.values())
      .sort((a, b) => {
        // Sort by source priority, then by name
        const aPriority = sourcePriority[a.document__title || ''] || 99;
        const bPriority = sourcePriority[b.document__title || ''] || 99;
        if (aPriority !== bPriority) {
          return aPriority - bPriority;
        }
        return a.name.localeCompare(b.name);
      })
      .slice(0, 20); // Limit results
  }

  /**
   * Convert API monster to our combatant format
   */
  convertToCombatant(monster: MonsterDetail): any {
    console.log('🐉 Converting monster to combatant:', monster.name);
    console.log('🐉 Monster raw data:', monster);
    console.log('🐉 STR:', monster.strength, 'DEX:', monster.dexterity, 'CON:', monster.constitution);

    const dexMod = Math.floor((monster.dexterity - 10) / 2);
    const initiative = Math.floor(Math.random() * 20) + 1 + dexMod;

    // Format speed
    const speedParts = [];
    if (monster.speed.walk) speedParts.push(`${monster.speed.walk} ft.`);
    if (monster.speed.fly) speedParts.push(`fly ${monster.speed.fly} ft.${monster.speed.hover ? ' (hover)' : ''}`);
    if (monster.speed.swim) speedParts.push(`swim ${monster.speed.swim} ft.`);
    if (monster.speed.climb) speedParts.push(`climb ${monster.speed.climb} ft.`);
    if (monster.speed.burrow) speedParts.push(`burrow ${monster.speed.burrow} ft.`);

    // Format saves
    const saves = [];
    if (monster.strength_save) saves.push(`STR +${monster.strength_save}`);
    if (monster.dexterity_save) saves.push(`DEX +${monster.dexterity_save}`);
    if (monster.constitution_save) saves.push(`CON +${monster.constitution_save}`);
    if (monster.intelligence_save) saves.push(`INT +${monster.intelligence_save}`);
    if (monster.wisdom_save) saves.push(`WIS +${monster.wisdom_save}`);
    if (monster.charisma_save) saves.push(`CHA +${monster.charisma_save}`);

    // Format skills
    const skills = [];
    if (monster.skills) {
      Object.entries(monster.skills).forEach(([skill, bonus]) => {
        const formattedBonus = bonus >= 0 ? `+${bonus}` : `${bonus}`;
        skills.push(`${skill.charAt(0).toUpperCase() + skill.slice(1)} ${formattedBonus}`);
      });
    }

    // Calculate XP from CR if not provided
    const crToXP = (cr: string): number => {
      const crMap: Record<string, number> = {
        '0': 10, '1/8': 25, '1/4': 50, '1/2': 100, '1': 200, '2': 450, '3': 700, '4': 1100,
        '5': 1800, '6': 2300, '7': 2900, '8': 3900, '9': 5000, '10': 5900, '11': 7200,
        '12': 8400, '13': 10000, '14': 11500, '15': 13000, '16': 15000, '17': 18000,
        '18': 20000, '19': 22000, '20': 25000, '21': 33000, '22': 41000, '23': 50000,
        '24': 62000, '25': 75000, '26': 90000, '27': 105000, '28': 120000, '29': 135000, '30': 155000
      };
      return crMap[cr] || 0;
    };

    return {
      id: Date.now().toString() + Math.random(),
      name: monster.name,
      hp: monster.hit_points,
      maxHp: monster.hit_points,
      ac: typeof monster.armor_class === 'number' ? monster.armor_class : monster.armor_class?.[0]?.value || 10,
      initiative,
      isPC: false,
      conditions: [],
      tempHp: 0,
      cr: monster.challenge_rating || '1',
      type: monster.type,
      size: monster.size.toLowerCase(),
      alignment: monster.alignment.toLowerCase(),
      speed: speedParts.join(', ') || '30 ft.',
      abilities: {
        str: monster.strength,
        dex: monster.dexterity,
        con: monster.constitution,
        int: monster.intelligence,
        wis: monster.wisdom,
        cha: monster.charisma
      },
      saves: saves.join(', '),
      skills: skills.join(', '),
      damageResistances: monster.damage_resistances || '',
      damageImmunities: monster.damage_immunities || '',
      conditionImmunities: monster.condition_immunities || '',
      damageVulnerabilities: monster.damage_vulnerabilities || '',
      senses: monster.senses || `passive Perception ${10 + Math.floor((monster.wisdom - 10) / 2)}`,
      languages: monster.languages || '',
      proficiencyBonus: `+${monster.proficiency_bonus || 2}`,
      actions: this.formatActions(monster.actions),
      legendaryActions: this.formatActions(monster.legendary_actions),
      reactions: this.formatActions(monster.reactions),
      specialAbilities: this.formatActions(monster.special_abilities),
      xp: crToXP(monster.challenge_rating || '1'),
      importSource: 'open5e',
      importedAt: new Date().toISOString(),
      apiData: monster // Store original API data for reference
    };
  }


  private formatActions(actions?: Array<{ name: string; desc: string }>): Array<{ name: string; description: string }> {
    if (!actions) return [];
    return actions.map(action => ({
      name: action.name,
      description: action.desc
    }));
  }

  /**
   * Get monsters by challenge rating
   */
  async getMonstersByCR(cr: number): Promise<MonsterListEntry[]> {
    const monsters = await this.getMonsters();
    const filteredMonsters = [];

    // This would require fetching each monster's details, which is expensive
    // For now, return all monsters - could be optimized with a backend index
    return monsters.slice(0, 20);
  }

  /**
   * Get display source for a monster
   */
  getSourceDisplay(monster: MonsterListEntry): { short: string; full: string; edition: string } {
    const title = monster.document__title || 'Unknown';

    if (title.includes('5e Core Rules')) {
      return { short: 'SRD', full: 'D&D 5e SRD', edition: 'Official' };
    }
    if (title.includes('Systems Reference Document')) {
      return { short: 'SRD', full: 'Systems Reference Document', edition: 'Official' };
    }
    if (title.includes('Level Up Advanced 5e')) {
      return { short: 'A5e', full: 'Level Up Advanced 5e', edition: 'Alternative' };
    }
    if (title.includes('Black Flag')) {
      return { short: 'BF', full: 'Black Flag SRD', edition: 'Alternative' };
    }
    if (title.includes('Tome of Beasts')) {
      return { short: 'ToB', full: title, edition: '3rd Party' };
    }
    if (title.includes('Creature Codex')) {
      return { short: 'CC', full: title, edition: '3rd Party' };
    }

    return { short: 'SRD', full: title, edition: 'Official' };
  }

  /**
   * Batch fetch multiple monsters
   */
  async getMultipleMonsters(slugs: string[]): Promise<MonsterDetail[]> {
    const results: MonsterDetail[] = [];
    const uncachedSlugs: string[] = [];

    // Check cache first
    for (const slug of slugs) {
      if (this.monsterDetailsCache.has(slug)) {
        results.push(this.monsterDetailsCache.get(slug)!);
      } else {
        uncachedSlugs.push(slug);
      }
    }

    if (uncachedSlugs.length === 0) {
      return results;
    }

    // Batch fetch remaining monsters
    const batchPromises = uncachedSlugs.map(slug => this.getMonster(slug));
    const batchResults = await Promise.all(batchPromises);

    return [...results, ...batchResults];
  }

  /**
   * Prefetch popular monsters
   */
  async prefetchPopularMonsters(): Promise<void> {
    const popularSlugs = [
      'ancient-red-dragon', 'goblin', 'orc', 'skeleton', 'zombie',
      'troll', 'ogre', 'wolf', 'bandit'
    ];

    // Fire and forget - don't await
    this.getMultipleMonsters(popularSlugs).catch(err =>
      console.warn('Failed to prefetch popular monsters:', err)
    );
  }

  /**
   * Clear caches
   */
  clearCache(): void {
    this.monstersCache = null;
    this.monsterDetailsCache.clear();
    this.pendingRequests.clear();
    this.lastCacheUpdate = 0;
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
      this.batchTimeout = null;
    }
  }
}

// Global API instance
export const dnd5eAPI = new DnD5eAPI();