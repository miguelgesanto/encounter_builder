export interface BaseEntity {
  id: string
  createdAt: string
  updatedAt: string
}

export interface AbilityScores {
  str: number
  dex: number
  con: number
  int: number
  wis: number
  cha: number
}

export interface DiceRoll {
  count: number
  sides: number
  modifier: number
}

export interface DamageRoll extends DiceRoll {
  type: 'piercing' | 'slashing' | 'bludgeoning' | 'fire' | 'cold' | 'lightning' | 'thunder' | 'acid' | 'poison' | 'psychic' | 'radiant' | 'necrotic' | 'force'
}

export type ImportSource = 'manual' | 'text' | 'dndbeyond' | 'open5e'

export type ChallengeRating = '0' | '1/8' | '1/4' | '1/2' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11' | '12' | '13' | '14' | '15' | '16' | '17' | '18' | '19' | '20' | '21' | '22' | '23' | '24' | '25' | '26' | '27' | '28' | '29' | '30'

export type CreatureType = 'aberration' | 'beast' | 'celestial' | 'construct' | 'dragon' | 'elemental' | 'fey' | 'fiend' | 'giant' | 'humanoid' | 'monstrosity' | 'ooze' | 'plant' | 'undead'

export type CreatureSize = 'Tiny' | 'Small' | 'Medium' | 'Large' | 'Huge' | 'Gargantuan'

export type Alignment = 'lawful good' | 'neutral good' | 'chaotic good' | 'lawful neutral' | 'true neutral' | 'chaotic neutral' | 'lawful evil' | 'neutral evil' | 'chaotic evil' | 'unaligned'