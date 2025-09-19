import { CreatureTemplate } from '../types/creature-abilities';

export const CREATURE_ABILITIES: CreatureTemplate[] = [
  {
    name: "Ancient Red Dragon",
    cr: "24",
    abilities: [
      {
        type: "start_of_turn",
        name: "Frightful Presence",
        description: "Available if not used recently",
        priority: "medium"
      },
      {
        type: "legendary_actions",
        name: "Legendary Actions",
        description: "3 actions available",
        priority: "critical",
        count: 3
      },
      {
        type: "lair_actions",
        name: "Lair Actions",
        description: "Tremor, Volcanic gases, or Magma eruption",
        priority: "critical",
        timing: "top of round"
      },
      {
        type: "combat_ability",
        name: "Fire Breath",
        description: "Check recharge (5-6 on d6)",
        priority: "critical"
      },
      {
        type: "resistance",
        name: "Fire Immunity",
        description: "Negates fire damage",
        priority: "high"
      },
      {
        type: "resistance",
        name: "Legendary Resistance",
        description: "3/day remaining",
        priority: "critical"
      }
    ]
  },
  {
    name: "Goblin",
    cr: "1/4",
    abilities: [
      {
        type: "combat_ability",
        name: "Pack Tactics",
        description: "Advantage on attacks with ally within 5ft",
        priority: "high"
      }
    ]
  },
  {
    name: "Lich",
    cr: "21",
    abilities: [
      {
        type: "legendary_actions",
        name: "Legendary Actions",
        description: "3 actions available",
        priority: "critical",
        count: 3
      },
      {
        type: "lair_actions",
        name: "Lair Actions",
        description: "Regain spell slot, Energy tether, or Spirit summon",
        priority: "critical",
        timing: "top of round"
      },
      {
        type: "concentration",
        name: "Concentration",
        description: "Check if maintaining spell",
        priority: "high"
      },
      {
        type: "resistance",
        name: "Legendary Resistance",
        description: "3/day remaining",
        priority: "critical"
      },
      {
        type: "resistance",
        name: "Turn Resistance",
        description: "Advantage vs turn undead",
        priority: "medium"
      },
      {
        type: "combat_ability",
        name: "Paralyzing Touch",
        description: "Save or paralyzed",
        priority: "high"
      }
    ]
  },
  {
    name: "Orc",
    cr: "1/2",
    abilities: [
      {
        type: "combat_ability",
        name: "Aggressive",
        description: "Bonus action: move toward hostile creature",
        priority: "high"
      }
    ]
  },
  {
    name: "Troll",
    cr: "5",
    abilities: [
      {
        type: "start_of_turn",
        name: "Regeneration",
        description: "Regains 10 HP unless acid/fire damage",
        priority: "high"
      },
      {
        type: "resistance",
        name: "Regeneration Weakness",
        description: "Acid or fire stops regeneration",
        priority: "high"
      },
      {
        type: "lair_actions",
        name: "Swamp Lair Actions",
        description: "Entangling roots, Toxic spores, or Muddy ground",
        priority: "critical",
        timing: "top of round"
      }
    ]
  },
  {
    name: "Beholder",
    cr: "13",
    abilities: [
      {
        type: "start_of_turn",
        name: "Eye Rays",
        description: "Roll 3 rays at different targets",
        priority: "critical"
      },
      {
        type: "combat_ability",
        name: "Antimagic Cone",
        description: "Negates magic (including own rays)",
        priority: "high"
      },
      {
        type: "legendary_actions",
        name: "Legendary Actions",
        description: "3 actions available",
        priority: "high",
        count: 3
      }
    ]
  },
  {
    name: "Vampire",
    cr: "13",
    abilities: [
      {
        type: "start_of_turn",
        name: "Regeneration",
        description: "Regains 20 HP unless sunlight/running water",
        priority: "high"
      },
      {
        type: "legendary_actions",
        name: "Legendary Actions",
        description: "3 actions available",
        priority: "high",
        count: 3
      },
      {
        type: "resistance",
        name: "Damage Resistances",
        description: "Necrotic, non-magical physical",
        priority: "medium"
      }
    ]
  },
  {
    name: "Green Hag",
    cr: "3",
    abilities: [
      {
        type: "combat_ability",
        name: "Innate Spellcasting",
        description: "At will: dancing lights, minor illusion, vicious mockery (DC 12)",
        priority: "medium"
      },
      {
        type: "combat_ability",
        name: "Amphibious",
        description: "Can breathe air and water",
        priority: "low"
      },
      {
        type: "combat_ability",
        name: "Coven Spellcasting",
        description: "With 2+ hag allies: augury, scrying, locate object (DC 14)",
        priority: "high"
      }
    ]
  },
  {
    name: "Night Hag",
    cr: "5",
    abilities: [
      {
        type: "combat_ability",
        name: "Innate Spellcasting",
        description: "At will: detect magic, magic missile (4th). 2/day: plane shift, sleep",
        priority: "high"
      },
      {
        type: "resistance",
        name: "Magic Resistance",
        description: "Advantage on saves vs spells and magical effects",
        priority: "high"
      },
      {
        type: "combat_ability",
        name: "Etherealness",
        description: "Can enter Ethereal Plane with heartstone",
        priority: "medium"
      },
      {
        type: "combat_ability",
        name: "Coven Spellcasting",
        description: "With 2+ hag allies: augury, scrying, locate object (DC 14)",
        priority: "high"
      }
    ]
  },
  {
    name: "Annis Hag",
    cr: "6",
    abilities: [
      {
        type: "combat_ability",
        name: "Innate Spellcasting",
        description: "3/day: fog cloud. 1/day: entangle",
        priority: "medium"
      },
      {
        type: "combat_ability",
        name: "Crushing Hug",
        description: "Grappled target takes 36 (2d8 + 27) bludgeoning damage",
        priority: "high"
      },
      {
        type: "combat_ability",
        name: "Coven Spellcasting",
        description: "With 2+ hag allies: augury, scrying, locate object (DC 14)",
        priority: "high"
      }
    ]
  }
];