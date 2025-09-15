// MonsterDatabase - Manages monster data for the application
export class MonsterDatabase {
    constructor() {
        this.monsters = [];
        this.initialized = false;
    }

    async init() {
        if (this.initialized) return;
        
        // Load default monster data
        this.monsters = this.getDefaultMonsters();
        this.initialized = true;
        console.log(`MonsterDatabase initialized with ${this.monsters.length} monsters`);
    }

    getMonsters() {
        return this.monsters;
    }

    getMonsterByName(name) {
        return this.monsters.find(monster => monster.name.toLowerCase() === name.toLowerCase());
    }

    getMonstersByCR(challengeRating) {
        return this.monsters.filter(monster => monster.challengeRating === challengeRating);
    }

    getMonstersByType(type) {
        return this.monsters.filter(monster => monster.type.toLowerCase() === type.toLowerCase());
    }

    searchMonsters(query) {
        const searchTerm = query.toLowerCase();
        return this.monsters.filter(monster => 
            monster.name.toLowerCase().includes(searchTerm) ||
            monster.type.toLowerCase().includes(searchTerm) ||
            monster.size.toLowerCase().includes(searchTerm)
        );
    }

    // Default monster data based on D&D 5e SRD
    getDefaultMonsters() {
        return [
            // CR 0
            {
                name: "Awakened Shrub",
                size: "Small",
                type: "Plant",
                challengeRating: 0,
                armorClass: 9,
                hitPoints: 10,
                speed: "20 ft.",
                abilities: { str: 3, dex: 8, con: 11, int: 10, wis: 10, cha: 6 },
                damageResistances: "Piercing",
                damageVulnerabilities: "Fire",
                senses: "Passive Perception 10",
                languages: "One language known by its creator",
                description: "An awakened shrub is an ordinary shrub given sentience and mobility."
            },
            {
                name: "Badger",
                size: "Tiny",
                type: "Beast",
                challengeRating: 0,
                armorClass: 10,
                hitPoints: 3,
                speed: "20 ft., burrow 5 ft.",
                abilities: { str: 4, dex: 11, con: 12, int: 2, wis: 12, cha: 5 },
                senses: "Darkvision 30 ft., Passive Perception 11",
                languages: "—",
                description: "A fierce, territorial creature despite its small size."
            },
            {
                name: "Cat",
                size: "Tiny",
                type: "Beast",
                challengeRating: 0,
                armorClass: 12,
                hitPoints: 2,
                speed: "40 ft., climb 30 ft.",
                abilities: { str: 3, dex: 15, con: 10, int: 3, wis: 12, cha: 7 },
                skills: "Perception +2, Stealth +4",
                senses: "Passive Perception 12",
                languages: "—",
                description: "A small feline creature, often kept as a pet."
            },

            // CR 1/8
            {
                name: "Bandit",
                size: "Medium",
                type: "Humanoid",
                challengeRating: 0.125,
                armorClass: 12,
                hitPoints: 11,
                speed: "30 ft.",
                abilities: { str: 11, dex: 12, con: 12, int: 10, wis: 10, cha: 10 },
                skills: "Deception +2, Stealth +3",
                senses: "Passive Perception 10",
                languages: "Any one language",
                description: "Bandits rove in gangs and are sometimes led by thugs, veterans, or spellcasters."
            },
            {
                name: "Commoner",
                size: "Medium",
                type: "Humanoid",
                challengeRating: 0.125,
                armorClass: 10,
                hitPoints: 4,
                speed: "30 ft.",
                abilities: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
                senses: "Passive Perception 10",
                languages: "Any one language",
                description: "Commoners include peasants, serfs, slaves, servants, pilgrims, merchants, artisans, and hermits."
            },
            {
                name: "Giant Rat",
                size: "Small",
                type: "Beast",
                challengeRating: 0.125,
                armorClass: 12,
                hitPoints: 7,
                speed: "30 ft.",
                abilities: { str: 7, dex: 15, con: 11, int: 2, wis: 10, cha: 4 },
                senses: "Darkvision 60 ft., Passive Perception 10",
                languages: "—",
                description: "A giant rat is about the size of a small dog."
            },

            // CR 1/4
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
                description: "Goblins are small, black-hearted humanoids that lair in despoiled dungeons and other dismal settings."
            },
            {
                name: "Kobold",
                size: "Small",
                type: "Humanoid",
                challengeRating: 0.25,
                armorClass: 12,
                hitPoints: 5,
                speed: "30 ft.",
                abilities: { str: 7, dex: 15, con: 9, int: 8, wis: 7, cha: 8 },
                senses: "Darkvision 60 ft., Passive Perception 8",
                languages: "Common, Draconic",
                description: "Kobolds are craven reptilian humanoids that worship evil dragons as demigods."
            },
            {
                name: "Skeleton",
                size: "Medium",
                type: "Undead",
                challengeRating: 0.25,
                armorClass: 13,
                hitPoints: 13,
                speed: "30 ft.",
                abilities: { str: 10, dex: 14, con: 15, int: 6, wis: 8, cha: 5 },
                damageVulnerabilities: "Bludgeoning",
                damageImmunities: "Poison",
                conditionImmunities: "Exhaustion, Poisoned",
                senses: "Darkvision 60 ft., Passive Perception 9",
                languages: "Understands all languages it knew in life but can't speak",
                description: "Skeletons arise when animated by dark magic."
            },

            // CR 1/2
            {
                name: "Orc",
                size: "Medium",
                type: "Humanoid",
                challengeRating: 0.5,
                armorClass: 13,
                hitPoints: 15,
                speed: "30 ft.",
                abilities: { str: 16, dex: 12, con: 16, int: 7, wis: 11, cha: 10 },
                skills: "Intimidation +2",
                senses: "Darkvision 60 ft., Passive Perception 10",
                languages: "Common, Orc",
                description: "Orcs are savage raiders and pillagers with stooped postures, low foreheads, and piggish faces."
            },
            {
                name: "Scout",
                size: "Medium",
                type: "Humanoid",
                challengeRating: 0.5,
                armorClass: 13,
                hitPoints: 16,
                speed: "30 ft.",
                abilities: { str: 11, dex: 14, con: 12, int: 11, wis: 13, cha: 11 },
                skills: "Nature +4, Perception +5, Stealth +6, Survival +5",
                senses: "Passive Perception 15",
                languages: "Any one language",
                description: "Scouts are skilled hunters and trackers who offer their services for a fee."
            },
            {
                name: "Warhorse",
                size: "Large",
                type: "Beast",
                challengeRating: 0.5,
                armorClass: 11,
                hitPoints: 19,
                speed: "60 ft.",
                abilities: { str: 18, dex: 12, con: 13, int: 2, wis: 12, cha: 7 },
                senses: "Passive Perception 11",
                languages: "—",
                description: "Warhorses are bred for strength and aggression, trained for mounted combat."
            },

            // CR 1
            {
                name: "Brown Bear",
                size: "Large",
                type: "Beast",
                challengeRating: 1,
                armorClass: 11,
                hitPoints: 34,
                speed: "40 ft., climb 30 ft.",
                abilities: { str: 19, dex: 10, con: 16, int: 2, wis: 13, cha: 7 },
                skills: "Perception +3",
                senses: "Passive Perception 13",
                languages: "—",
                description: "A brown bear's statistics can be used for almost any bear of similar size."
            },
            {
                name: "Dire Wolf",
                size: "Large",
                type: "Beast",
                challengeRating: 1,
                armorClass: 14,
                hitPoints: 37,
                speed: "50 ft.",
                abilities: { str: 17, dex: 15, con: 15, int: 3, wis: 12, cha: 7 },
                skills: "Perception +3, Stealth +4",
                senses: "Passive Perception 13",
                languages: "—",
                description: "A dire wolf is a large, primitive wolf."
            },
            {
                name: "Hobgoblin",
                size: "Medium",
                type: "Humanoid",
                challengeRating: 1,
                armorClass: 18,
                hitPoints: 11,
                speed: "30 ft.",
                abilities: { str: 13, dex: 12, con: 12, int: 10, wis: 10, cha: 9 },
                senses: "Darkvision 60 ft., Passive Perception 10",
                languages: "Common, Goblin",
                description: "Hobgoblins are large, hairy cousins of goblins."
            },

            // CR 2
            {
                name: "Ogre",
                size: "Large",
                type: "Giant",
                challengeRating: 2,
                armorClass: 11,
                hitPoints: 59,
                speed: "40 ft.",
                abilities: { str: 19, dex: 8, con: 16, int: 5, wis: 7, cha: 7 },
                senses: "Darkvision 60 ft., Passive Perception 8",
                languages: "Common, Giant",
                description: "Ogres are hulking giants notorious for their quick tempers and tendency to solve problems with violence."
            },
            {
                name: "Owlbear",
                size: "Large",
                type: "Monstrosity",
                challengeRating: 3,
                armorClass: 13,
                hitPoints: 59,
                speed: "40 ft.",
                abilities: { str: 20, dex: 12, con: 17, int: 3, wis: 12, cha: 7 },
                skills: "Perception +3",
                senses: "Darkvision 60 ft., Passive Perception 13",
                languages: "—",
                description: "An owlbear is a cross between a bear and an owl, which 'exists because wizards were very drunk and very bored.'"
            },
            {
                name: "Veteran",
                size: "Medium",
                type: "Humanoid",
                challengeRating: 3,
                armorClass: 17,
                hitPoints: 58,
                speed: "30 ft.",
                abilities: { str: 16, dex: 13, con: 14, int: 10, wis: 11, cha: 10 },
                skills: "Athletics +5, Perception +2",
                senses: "Passive Perception 12",
                languages: "Any one language",
                description: "Veterans are professional fighters who take up arms for pay or to protect something they believe in or value."
            },

            // CR 3
            {
                name: "Ankheg",
                size: "Large",
                type: "Monstrosity",
                challengeRating: 2,
                armorClass: 14,
                hitPoints: 39,
                speed: "30 ft., burrow 10 ft.",
                abilities: { str: 17, dex: 11, con: 13, int: 1, wis: 13, cha: 6 },
                senses: "Darkvision 60 ft., Tremorsense 60 ft., Passive Perception 11",
                languages: "—",
                description: "An ankheg resembles an enormous many-legged insect."
            },
            {
                name: "Knight",
                size: "Medium",
                type: "Humanoid",
                challengeRating: 3,
                armorClass: 18,
                hitPoints: 52,
                speed: "30 ft.",
                abilities: { str: 16, dex: 11, con: 14, int: 11, wis: 11, cha: 15 },
                savingThrows: "Con +4, Wis +2",
                senses: "Passive Perception 10",
                languages: "Any one language",
                description: "Knights are warriors who pledge service to rulers, religious orders, and noble causes."
            },

            // CR 4
            {
                name: "Ettin",
                size: "Large",
                type: "Giant",
                challengeRating: 4,
                armorClass: 12,
                hitPoints: 85,
                speed: "40 ft.",
                abilities: { str: 21, dex: 8, con: 17, int: 6, wis: 10, cha: 8 },
                skills: "Perception +4",
                senses: "Darkvision 60 ft., Passive Perception 14",
                languages: "Giant, Orc",
                description: "An ettin is a foul, two-headed giant with the crude characteristics of an orc."
            },

            // CR 5
            {
                name: "Hill Giant",
                size: "Huge",
                type: "Giant",
                challengeRating: 5,
                armorClass: 13,
                hitPoints: 105,
                speed: "40 ft.",
                abilities: { str: 21, dex: 8, con: 19, int: 5, wis: 9, cha: 6 },
                skills: "Perception +2",
                senses: "Passive Perception 12",
                languages: "Giant",
                description: "Hill giants are selfish, cunning brutes who survive through hunting, gathering, and raiding."
            },
            {
                name: "Troll",
                size: "Large",
                type: "Giant",
                challengeRating: 5,
                armorClass: 15,
                hitPoints: 84,
                speed: "30 ft.",
                abilities: { str: 18, dex: 13, con: 20, int: 7, wis: 9, cha: 7 },
                skills: "Perception +2",
                senses: "Darkvision 60 ft., Passive Perception 12",
                languages: "Giant",
                description: "Trolls are savage cannibals with an amazing regenerative ability."
            },
            {
                name: "Shambling Mound",
                size: "Large",
                type: "Plant",
                challengeRating: 5,
                armorClass: 15,
                hitPoints: 136,
                speed: "20 ft., swim 20 ft.",
                abilities: { str: 18, dex: 8, con: 17, int: 5, wis: 10, cha: 5 },
                damageResistances: "Cold, Fire",
                damageImmunities: "Lightning",
                conditionImmunities: "Blinded, Deafened, Exhaustion",
                senses: "Blindsight 60 ft., Passive Perception 10",
                languages: "—",
                description: "A shambling mound is a heap of rotting vegetation animated by dark magic."
            },

            // CR 6
            {
                name: "Wyvern",
                size: "Large",
                type: "Dragon",
                challengeRating: 6,
                armorClass: 13,
                hitPoints: 110,
                speed: "20 ft., fly 80 ft.",
                abilities: { str: 19, dex: 10, con: 16, int: 5, wis: 12, cha: 6 },
                skills: "Perception +4",
                senses: "Darkvision 60 ft., Passive Perception 14",
                languages: "—",
                description: "A wyvern is a dragon-like creature with a venomous stinger on its tail."
            },
            {
                name: "Mammoth",
                size: "Huge",
                type: "Beast",
                challengeRating: 6,
                armorClass: 13,
                hitPoints: 126,
                speed: "40 ft.",
                abilities: { str: 24, dex: 9, con: 21, int: 3, wis: 11, cha: 6 },
                senses: "Passive Perception 10",
                languages: "—",
                description: "A mammoth is an elephantine creature covered in thick fur and bearing massive tusks."
            },

            // CR 7
            {
                name: "Stone Giant",
                size: "Huge",
                type: "Giant",
                challengeRating: 7,
                armorClass: 17,
                hitPoints: 126,
                speed: "40 ft.",
                abilities: { str: 23, dex: 15, con: 20, int: 10, wis: 12, cha: 9 },
                skills: "Athletics +12, Perception +5",
                senses: "Darkvision 60 ft., Passive Perception 15",
                languages: "Giant",
                description: "Stone giants are reclusive and artistic, carving magnificent sculptures in mountain peaks."
            },

            // CR 8
            {
                name: "Frost Giant",
                size: "Huge",
                type: "Giant",
                challengeRating: 8,
                armorClass: 15,
                hitPoints: 138,
                speed: "40 ft.",
                abilities: { str: 23, dex: 9, con: 21, int: 9, wis: 10, cha: 12 },
                skills: "Athletics +9, Perception +3",
                damageImmunities: "Cold",
                senses: "Passive Perception 13",
                languages: "Giant",
                description: "Frost giants are barbaric raiders who dwell in frigid lands."
            },
            {
                name: "Hydra",
                size: "Huge",
                type: "Monstrosity",
                challengeRating: 8,
                armorClass: 15,
                hitPoints: 172,
                speed: "30 ft., swim 30 ft.",
                abilities: { str: 20, dex: 12, con: 20, int: 2, wis: 10, cha: 7 },
                skills: "Perception +6",
                senses: "Darkvision 60 ft., Passive Perception 16",
                languages: "—",
                description: "A hydra is a reptilian horror with multiple serpentine heads that regrow when severed."
            },

            // CR 9
            {
                name: "Fire Giant",
                size: "Huge",
                type: "Giant",
                challengeRating: 9,
                armorClass: 18,
                hitPoints: 162,
                speed: "30 ft.",
                abilities: { str: 25, dex: 9, con: 23, int: 10, wis: 14, cha: 13 },
                skills: "Athletics +11, Perception +6",
                damageImmunities: "Fire",
                senses: "Passive Perception 16",
                languages: "Giant",
                description: "Fire giants are master craftsmen who dwell near volcanoes and lava flows."
            },

            // CR 10
            {
                name: "Young Red Dragon",
                size: "Large",
                type: "Dragon",
                challengeRating: 10,
                armorClass: 18,
                hitPoints: 178,
                speed: "40 ft., climb 40 ft., fly 80 ft.",
                abilities: { str: 23, dex: 10, con: 21, int: 14, wis: 11, cha: 19 },
                skills: "Perception +6, Stealth +4",
                damageImmunities: "Fire",
                senses: "Blindsight 30 ft., Darkvision 120 ft., Passive Perception 16",
                languages: "Common, Draconic",
                description: "Young red dragons are proud and greedy, with an insatiable lust for treasure."
            },
            {
                name: "Aboleth",
                size: "Large",
                type: "Aberration",
                challengeRating: 10,
                armorClass: 17,
                hitPoints: 135,
                speed: "10 ft., swim 40 ft.",
                abilities: { str: 21, dex: 9, con: 15, int: 18, wis: 15, cha: 18 },
                skills: "History +12, Perception +10",
                senses: "Darkvision 120 ft., Passive Perception 20",
                languages: "Deep Speech, telepathy 120 ft.",
                description: "Aboleths are ancient, alien creatures that rule over underground lakes and seas."
            }

            // Additional monsters can be added here for higher CRs
        ];
    }

    // Method to add custom monsters (for future expansion)
    addMonster(monster) {
        const requiredFields = ['name', 'size', 'type', 'challengeRating', 'armorClass', 'hitPoints'];
        
        for (const field of requiredFields) {
            if (!(field in monster)) {
                throw new Error(`Monster missing required field: ${field}`);
            }
        }

        // Check for duplicate names
        if (this.getMonsterByName(monster.name)) {
            throw new Error(`Monster with name "${monster.name}" already exists`);
        }

        this.monsters.push(monster);
        console.log(`Added custom monster: ${monster.name}`);
    }

    // Method to remove monsters
    removeMonster(name) {
        const index = this.monsters.findIndex(monster => monster.name === name);
        if (index !== -1) {
            this.monsters.splice(index, 1);
            console.log(`Removed monster: ${name}`);
            return true;
        }
        return false;
    }

    // Get monsters filtered by multiple criteria
    getFilteredMonsters(filters = {}) {
        let filtered = [...this.monsters];

        if (filters.minCR !== undefined) {
            filtered = filtered.filter(m => m.challengeRating >= filters.minCR);
        }

        if (filters.maxCR !== undefined) {
            filtered = filtered.filter(m => m.challengeRating <= filters.maxCR);
        }

        if (filters.type) {
            filtered = filtered.filter(m => m.type.toLowerCase() === filters.type.toLowerCase());
        }

        if (filters.size) {
            filtered = filtered.filter(m => m.size.toLowerCase() === filters.size.toLowerCase());
        }

        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            filtered = filtered.filter(m => 
                m.name.toLowerCase().includes(searchTerm) ||
                m.type.toLowerCase().includes(searchTerm) ||
                (m.description && m.description.toLowerCase().includes(searchTerm))
            );
        }

        return filtered;
    }

    // Get statistics about the monster database
    getStats() {
        const stats = {
            total: this.monsters.length,
            byType: {},
            byCR: {},
            bySize: {}
        };

        this.monsters.forEach(monster => {
            // Count by type
            stats.byType[monster.type] = (stats.byType[monster.type] || 0) + 1;
            
            // Count by CR
            const cr = monster.challengeRating.toString();
            stats.byCR[cr] = (stats.byCR[cr] || 0) + 1;
            
            // Count by size
            stats.bySize[monster.size] = (stats.bySize[monster.size] || 0) + 1;
        });

        return stats;
    }
}