import { CreatureTemplate } from '../types/creature-abilities';

export const CREATURE_ABILITIES: CreatureTemplate[] = [
  {
    name: "Ancient Red Dragon",
    cr: "24",
    abilities: [
      {
        type: "start_of_turn",
        name: "Frightful Presence",
        description: "120 ft, DC 21 Wis save or frightened for 1 minute",
        priority: "high"
      },
      {
        type: "legendary_actions",
        name: "Legendary Actions (3)",
        description: "Detect, Tail Attack, Wing Attack (2 actions)",
        priority: "critical",
        count: 3
      },
      {
        type: "lair_actions",
        name: "Lair Actions",
        description: "Tremor (DC 15 Dex), Volcanic gases (DC 13 Con), or Magma eruption",
        priority: "critical",
        timing: "initiative 20"
      },
      {
        type: "combat_ability",
        name: "Fire Breath",
        description: "Recharge 5-6: 90-ft cone, DC 24 Dex, 91 (26d6) fire damage",
        priority: "critical"
      },
      {
        type: "combat_ability",
        name: "Multiattack",
        description: "Frightful Presence + Bite + 2 Claws",
        priority: "high"
      },
      {
        type: "resistance",
        name: "Fire Immunity",
        description: "Immune to fire damage",
        priority: "high"
      },
      {
        type: "resistance",
        name: "Legendary Resistance",
        description: "3/day: Can choose to succeed on failed save",
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
        name: "Legendary Actions (3)",
        description: "Cantrip, Paralyzing Touch (2), Frightening Gaze (2), Disrupt Life (3)",
        priority: "critical",
        count: 3
      },
      {
        type: "lair_actions",
        name: "Lair Actions",
        description: "Regain spell slot (d8), Negative energy tether, Spirit summon (52 dmg)",
        priority: "critical",
        timing: "initiative 20"
      },
      {
        type: "concentration",
        name: "Spellcasting (18th level)",
        description: "DC 20, +12 to hit. May lose concentration when damaged",
        priority: "high"
      },
      {
        type: "resistance",
        name: "Legendary Resistance",
        description: "3/day: Can choose to succeed on failed save",
        priority: "critical"
      },
      {
        type: "resistance",
        name: "Turn Resistance",
        description: "Advantage on saves vs turn undead effects",
        priority: "medium"
      },
      {
        type: "combat_ability",
        name: "Paralyzing Touch",
        description: "DC 18 Con save or paralyzed for 1 minute",
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
        description: "Regains 10 HP (disabled by acid/fire damage)",
        priority: "high"
      },
      {
        type: "resistance",
        name: "Resistances",
        description: "Regeneration stopped by acid or fire",
        priority: "medium"
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
        description: "Roll 3 eye rays at different targets",
        priority: "critical"
      },
      {
        type: "combat_ability",
        name: "Antimagic Cone",
        description: "150ft cone negates magic (including own eye rays)",
        priority: "high"
      },
      {
        type: "legendary_actions",
        name: "Legendary Actions",
        description: "3 actions: Eye ray or move",
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
        description: "Regains 20 HP (disabled in sunlight/running water)",
        priority: "high"
      },
      {
        type: "legendary_actions",
        name: "Legendary Actions",
        description: "3 actions: Move, Unarmed Strike, Bite (costs 2)",
        priority: "high",
        count: 3
      },
      {
        type: "resistance",
        name: "Resistances",
        description: "Resistant: necrotic, non-magical physical",
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