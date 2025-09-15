// EncounterCalculator - Handles D&D 5e encounter math
export class EncounterCalculator {
    constructor() {
        // XP thresholds by character level for each difficulty
        this.xpThresholds = {
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
            11: { easy: 800, medium: 1600, hard: 2400, deadly: 3600 },
            12: { easy: 1000, medium: 2000, hard: 3000, deadly: 4500 },
            13: { easy: 1100, medium: 2200, hard: 3400, deadly: 5100 },
            14: { easy: 1250, medium: 2500, hard: 3800, deadly: 5700 },
            15: { easy: 1400, medium: 2800, hard: 4300, deadly: 6400 },
            16: { easy: 1600, medium: 3200, hard: 4800, deadly: 7200 },
            17: { easy: 2000, medium: 3900, hard: 5900, deadly: 8800 },
            18: { easy: 2100, medium: 4200, hard: 6300, deadly: 9500 },
            19: { easy: 2400, medium: 4900, hard: 7300, deadly: 10900 },
            20: { easy: 2800, medium: 5700, hard: 8500, deadly: 12700 }
        };

        // XP by Challenge Rating
        this.xpByCR = {
            0: 10,
            0.125: 25,
            0.25: 50,
            0.5: 100,
            1: 200,
            2: 450,
            3: 700,
            4: 1100,
            5: 1800,
            6: 2300,
            7: 2900,
            8: 3900,
            9: 5000,
            10: 5900,
            11: 7200,
            12: 8400,
            13: 10000,
            14: 11500,
            15: 13000,
            16: 15000,
            17: 18000,
            18: 20000,
            19: 22000,
            20: 25000,
            21: 33000,
            22: 41000,
            23: 50000,
            24: 62000,
            25: 75000,
            26: 90000,
            27: 105000,
            28: 120000,
            29: 135000,
            30: 155000
        };

        // Encounter multipliers based on number of monsters
        this.encounterMultipliers = {
            1: 1,
            2: 1.5,
            3: 2,
            4: 2,
            5: 2.5,
            6: 2.5,
            7: 3,
            8: 3,
            9: 3.5,
            10: 3.5,
            11: 4,
            12: 4,
            13: 4.5,
            14: 4.5,
            15: 5
        };
    }

    /**
     * Calculate XP budget for a party based on size, level, and desired difficulty
     */
    calculateXPBudget(partySize, averageLevel, difficulty) {
        if (!this.xpThresholds[averageLevel]) {
            throw new Error(`Invalid character level: ${averageLevel}`);
        }

        const baseThreshold = this.xpThresholds[averageLevel][difficulty];
        if (!baseThreshold) {
            throw new Error(`Invalid difficulty: ${difficulty}`);
        }

        return baseThreshold * partySize;
    }

    /**
     * Get XP value for a given Challenge Rating
     */
    getXPForCR(challengeRating) {
        const xp = this.xpByCR[challengeRating];
        if (xp === undefined) {
            console.warn(`Unknown Challenge Rating: ${challengeRating}`);
            return 0;
        }
        return xp;
    }

    /**
     * Calculate the adjusted XP for an encounter based on monster quantity and multipliers
     */
    calculateEncounterXP(monsters) {
        if (!monsters || monsters.length === 0) {
            return 0;
        }

        // Calculate base XP
        let baseXP = 0;
        let totalMonsters = 0;

        monsters.forEach(entry => {
            const monsterXP = this.getXPForCR(entry.monster.challengeRating);
            baseXP += monsterXP * entry.quantity;
            totalMonsters += entry.quantity;
        });

        // Apply encounter multiplier
        const multiplier = this.getEncounterMultiplier(totalMonsters);
        return Math.floor(baseXP * multiplier);
    }

    /**
     * Get encounter multiplier based on number of monsters
     */
    getEncounterMultiplier(monsterCount) {
        if (monsterCount >= 15) {
            return 5;
        }
        return this.encounterMultipliers[monsterCount] || 1;
    }

    /**
     * Evaluate encounter difficulty for a given party
     */
    evaluateEncounterDifficulty(monsters, partySize, averageLevel) {
        const encounterXP = this.calculateEncounterXP(monsters);
        const thresholds = this.xpThresholds[averageLevel];
        
        if (!thresholds) {
            return 'unknown';
        }

        const partyThresholds = {
            easy: thresholds.easy * partySize,
            medium: thresholds.medium * partySize,
            hard: thresholds.hard * partySize,
            deadly: thresholds.deadly * partySize
        };

        if (encounterXP < partyThresholds.easy) {
            return 'trivial';
        } else if (encounterXP < partyThresholds.medium) {
            return 'easy';
        } else if (encounterXP < partyThresholds.hard) {
            return 'medium';
        } else if (encounterXP < partyThresholds.deadly) {
            return 'hard';
        } else {
            return 'deadly';
        }
    }

    /**
     * Calculate daily XP budget for a party (for campaign management)
     */
    calculateDailyXPBudget(partySize, averageLevel) {
        const mediumThreshold = this.xpThresholds[averageLevel]?.medium || 0;
        return mediumThreshold * partySize * 6; // Roughly 6-8 medium encounters per day
    }

    /**
     * Suggest monsters that fit within a given XP budget
     */
    suggestMonstersForBudget(availableMonsters, xpBudget, maxMonsters = 8) {
        const suggestions = [];
        
        // Try single monsters first
        for (const monster of availableMonsters) {
            const monsterXP = this.getXPForCR(monster.challengeRating);
            if (monsterXP <= xpBudget && monsterXP >= xpBudget * 0.7) {
                suggestions.push({
                    monsters: [{ monster, quantity: 1 }],
                    totalXP: monsterXP,
                    adjustedXP: monsterXP
                });
            }
        }

        // Try pairs and groups
        for (let quantity = 2; quantity <= maxMonsters; quantity++) {
            for (const monster of availableMonsters) {
                const baseXP = this.getXPForCR(monster.challengeRating) * quantity;
                const multiplier = this.getEncounterMultiplier(quantity);
                const adjustedXP = Math.floor(baseXP * multiplier);
                
                if (adjustedXP <= xpBudget && adjustedXP >= xpBudget * 0.7) {
                    suggestions.push({
                        monsters: [{ monster, quantity }],
                        totalXP: baseXP,
                        adjustedXP: adjustedXP
                    });
                }
            }
        }

        // Sort by how close they are to the target budget
        suggestions.sort((a, b) => {
            const aDiff = Math.abs(a.adjustedXP - xpBudget);
            const bDiff = Math.abs(b.adjustedXP - xpBudget);
            return aDiff - bDiff;
        });

        return suggestions.slice(0, 10); // Return top 10 suggestions
    }

    /**
     * Generate encounter statistics for analysis
     */
    generateEncounterStats(monsters, partySize, averageLevel) {
        const baseXP = monsters.reduce((total, entry) => {
            return total + (this.getXPForCR(entry.monster.challengeRating) * entry.quantity);
        }, 0);

        const totalMonsters = monsters.reduce((total, entry) => total + entry.quantity, 0);
        const adjustedXP = this.calculateEncounterXP(monsters);
        const multiplier = this.getEncounterMultiplier(totalMonsters);
        const difficulty = this.evaluateEncounterDifficulty(monsters, partySize, averageLevel);

        return {
            baseXP,
            adjustedXP,
            multiplier,
            totalMonsters,
            difficulty,
            monsterBreakdown: monsters.map(entry => ({
                name: entry.monster.name,
                quantity: entry.quantity,
                cr: entry.monster.challengeRating,
                individualXP: this.getXPForCR(entry.monster.challengeRating),
                totalXP: this.getXPForCR(entry.monster.challengeRating) * entry.quantity
            }))
        };
    }
}