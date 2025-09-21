import React, { useState } from 'react'
import { User, Shield, Heart, Zap, Eye, Swords, ChevronDown, ChevronUp } from 'lucide-react'

interface Combatant {
  id: string
  name: string
  hp: number
  maxHp: number
  ac: number
  initiative: number
  isPC: boolean
  level?: number
  conditions: Array<{ name: string; duration?: number }>
  cr?: string
  type?: string
  environment?: string
  xp?: number
  tempHp?: number
}

interface StatBlockProps {
  combatant: Combatant
  onCollapse?: () => void
}

export const StatBlock: React.FC<StatBlockProps> = ({ combatant, onCollapse }) => {
  const [collapsed, setCollapsed] = useState(false)
  const formatChallengeRating = (cr: string | undefined): string => {
    if (!cr) return '';
    if (cr === '0.125') return '1/8';
    if (cr === '0.25') return '1/4';
    if (cr === '0.5') return '1/2';
    return cr;
  };

  const formatModifier = (score: number): string => {
    const modifier = Math.floor((score - 10) / 2);
    return modifier >= 0 ? `+${modifier}` : `${modifier}`;
  };

  const getProficiencyBonus = (cr: string | undefined): number => {
    if (!cr) return 2;
    const crValue = parseFloat(cr);
    if (crValue < 0.25) return 2;
    if (crValue < 1) return 2;
    if (crValue < 5) return 2;
    if (crValue < 9) return 3;
    if (crValue < 13) return 4;
    if (crValue < 17) return 5;
    return 6;
  };

  // Generate reasonable ability scores based on creature type and CR if not provided
  const getDefaultAbilities = (combatant: Combatant) => {
    const crValue = parseFloat(combatant.cr || '1');
    const baseMod = Math.min(5, Math.max(0, Math.floor(crValue / 5)));

    if (combatant.type === 'dragon') {
      return { str: 23 + baseMod, dex: 10 + baseMod, con: 21 + baseMod, int: 14 + baseMod, wis: 13 + baseMod, cha: 17 + baseMod };
    } else if (combatant.type === 'undead') {
      return { str: 11 + baseMod, dex: 16 + baseMod, con: 16 + baseMod, int: 20 + baseMod, wis: 14 + baseMod, cha: 16 + baseMod };
    } else if (combatant.type === 'giant') {
      return { str: 18 + baseMod, dex: 13 + baseMod, con: 16 + baseMod, int: 7 + baseMod, wis: 9 + baseMod, cha: 7 + baseMod };
    } else if (combatant.isPC) {
      return { str: 16, dex: 14, con: 15, int: 12, wis: 13, cha: 10 };
    } else {
      // Generic creature
      return { str: 10 + baseMod, dex: 12 + baseMod, con: 12 + baseMod, int: 8 + baseMod, wis: 11 + baseMod, cha: 8 + baseMod };
    }
  };

  const abilities = getDefaultAbilities(combatant);

  return (
    <div className="bg-dnd-card border border-dnd rounded-lg p-3 space-y-2 text-xs">
      {/* Header */}
      <div className="border-b border-dnd pb-2">
        <div className="flex items-center justify-between mb-1">
          <h4 className="text-sm font-bold text-dnd-primary">
            {combatant.name}
          </h4>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-dnd-muted hover:text-dnd-secondary"
            title={collapsed ? "Expand details" : "Collapse details"}
          >
            {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>

        {combatant.isPC ? (
          <div className="text-xs text-dnd-secondary flex items-center gap-1">
            <User className="w-3 h-3" />
            Level {combatant.level} Player Character
          </div>
        ) : (
          <div className="text-xs text-dnd-secondary">
            <span>
              {combatant.type && <span className="capitalize">{combatant.type}</span>}
              {combatant.environment && (
                <span className="text-dnd-muted ml-1">({combatant.environment})</span>
              )}
              {combatant.cr && (
                <span className="text-dnd-muted ml-2">• CR {formatChallengeRating(combatant.cr)}</span>
              )}
            </span>
          </div>
        )}
      </div>

      {!collapsed && (
        <>
          {/* Basic Stats */}
      <div className="grid grid-cols-3 gap-1 text-xs">
        <div className="text-center bg-dnd-primary/10 rounded p-1">
          <div className="font-medium text-dnd-secondary flex items-center justify-center gap-1">
            <Shield className="w-3 h-3" />
            AC
          </div>
          <div className="text-sm font-bold text-dnd-primary">{combatant.ac}</div>
          <div className="text-xs text-dnd-muted">Natural Armor</div>
        </div>
        <div className="text-center bg-dnd-primary/10 rounded p-1">
          <div className="font-medium text-dnd-secondary flex items-center justify-center gap-1">
            <Heart className="w-3 h-3" />
            HP
          </div>
          <div className="text-sm font-bold text-dnd-primary">
            {combatant.hp}/{combatant.maxHp}
            {combatant.tempHp && combatant.tempHp > 0 && (
              <span className="text-blue-400 text-xs ml-1">+{combatant.tempHp}</span>
            )}
          </div>
          <div className="text-xs text-dnd-muted">
            ({Math.floor(combatant.maxHp / 8)}d{combatant.type === 'dragon' ? '12' : combatant.type === 'giant' ? '12' : '8'} + {Math.floor(abilities.con / 2) * Math.floor(combatant.maxHp / 8)})
          </div>
        </div>
        <div className="text-center bg-dnd-primary/10 rounded p-1">
          <div className="font-medium text-dnd-secondary flex items-center justify-center gap-1">
            <Zap className="w-3 h-3" />
            Speed
          </div>
          <div className="text-sm font-bold text-dnd-primary">30 ft.</div>
          <div className="text-xs text-dnd-muted">
            {combatant.type === 'dragon' && 'fly 80 ft.'}
            {combatant.type === 'undead' && 'hover'}
          </div>
        </div>
      </div>

      {/* Ability Scores */}
      <div className="bg-dnd-primary/5 rounded p-2">
        <div className="grid grid-cols-6 gap-1 text-xs">
          <div className="text-center">
            <div className="font-bold text-dnd-secondary">STR</div>
            <div className="text-xs text-dnd-primary font-mono">
              {abilities.str}
            </div>
            <div className="text-xs text-dnd-muted">
              ({formatModifier(abilities.str)})
            </div>
          </div>
          <div className="text-center">
            <div className="font-bold text-dnd-secondary">DEX</div>
            <div className="text-xs text-dnd-primary font-mono">
              {abilities.dex}
            </div>
            <div className="text-xs text-dnd-muted">
              ({formatModifier(abilities.dex)})
            </div>
          </div>
          <div className="text-center">
            <div className="font-bold text-dnd-secondary">CON</div>
            <div className="text-xs text-dnd-primary font-mono">
              {abilities.con}
            </div>
            <div className="text-xs text-dnd-muted">
              ({formatModifier(abilities.con)})
            </div>
          </div>
          <div className="text-center">
            <div className="font-bold text-dnd-secondary">INT</div>
            <div className="text-xs text-dnd-primary font-mono">
              {abilities.int}
            </div>
            <div className="text-xs text-dnd-muted">
              ({formatModifier(abilities.int)})
            </div>
          </div>
          <div className="text-center">
            <div className="font-bold text-dnd-secondary">WIS</div>
            <div className="text-xs text-dnd-primary font-mono">
              {abilities.wis}
            </div>
            <div className="text-xs text-dnd-muted">
              ({formatModifier(abilities.wis)})
            </div>
          </div>
          <div className="text-center">
            <div className="font-bold text-dnd-secondary">CHA</div>
            <div className="text-xs text-dnd-primary font-mono">
              {abilities.cha}
            </div>
            <div className="text-xs text-dnd-muted">
              ({formatModifier(abilities.cha)})
            </div>
          </div>
        </div>
      </div>

      {/* Additional D&D Stats */}
      <div className="space-y-1 text-xs">
        {/* Saving Throws */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="font-medium text-dnd-secondary">Saves:</span>
            <div className="text-dnd-primary">
              {combatant.type === 'dragon' && `Con +${Math.floor((abilities.con - 10) / 2) + getProficiencyBonus(combatant.cr)}, Wis +${Math.floor((abilities.wis - 10) / 2) + getProficiencyBonus(combatant.cr)}`}
              {combatant.type === 'undead' && `Int +${Math.floor((abilities.int - 10) / 2) + getProficiencyBonus(combatant.cr)}, Wis +${Math.floor((abilities.wis - 10) / 2) + getProficiencyBonus(combatant.cr)}`}
              {combatant.isPC && `Varies by class`}
              {!combatant.isPC && combatant.type !== 'dragon' && combatant.type !== 'undead' && 'None'}
            </div>
          </div>
          <div>
            <span className="font-medium text-dnd-secondary">Skills:</span>
            <div className="text-dnd-primary">
              {combatant.type === 'dragon' && 'Perception +7, Stealth +6'}
              {combatant.type === 'undead' && 'Arcana +8, History +8'}
              {combatant.type === 'giant' && 'Athletics +7'}
              {combatant.isPC && 'Varies by class'}
              {!combatant.isPC && !['dragon', 'undead', 'giant'].includes(combatant.type || '') && 'None'}
            </div>
          </div>
        </div>

        {/* Resistances and Immunities */}
        <div>
          <span className="font-medium text-dnd-secondary">Damage Resistances:</span>
          <span className="text-dnd-primary ml-1">
            {combatant.type === 'dragon' && 'Fire'}
            {combatant.type === 'undead' && 'Necrotic; Bludgeoning, Piercing, and Slashing from Nonmagical Attacks'}
            {combatant.type === 'giant' && 'None'}
            {!combatant.isPC && !['dragon', 'undead', 'giant'].includes(combatant.type || '') && 'None'}
            {combatant.isPC && 'Varies by race/class'}
          </span>
        </div>

        <div>
          <span className="font-medium text-dnd-secondary">Damage Immunities:</span>
          <span className="text-dnd-primary ml-1">
            {combatant.type === 'dragon' && combatant.cr && parseFloat(combatant.cr) >= 10 ? 'Fire' : 'None'}
            {combatant.type === 'undead' && 'Poison'}
            {!['dragon', 'undead'].includes(combatant.type || '') && 'None'}
          </span>
        </div>

        <div>
          <span className="font-medium text-dnd-secondary">Condition Immunities:</span>
          <span className="text-dnd-primary ml-1">
            {combatant.type === 'undead' && 'Charmed, Exhaustion, Poisoned'}
            {combatant.type === 'dragon' && parseFloat(combatant.cr || '0') >= 15 ? 'Frightened' : 'None'}
            {!['dragon', 'undead'].includes(combatant.type || '') && 'None'}
          </span>
        </div>

        {/* Senses */}
        <div>
          <span className="font-medium text-dnd-secondary">Senses:</span>
          <span className="text-dnd-primary ml-1">
            {combatant.type === 'dragon' && 'Blindsight 60 ft., Darkvision 120 ft.'}
            {combatant.type === 'undead' && 'Darkvision 60 ft.'}
            {combatant.type === 'giant' && 'Darkvision 60 ft.'}
            {!['dragon', 'undead', 'giant'].includes(combatant.type || '') && 'Passive Perception ' + (10 + formatModifier(abilities.wis))}
            , Passive Perception {10 + formatModifier(abilities.wis) + (combatant.type === 'dragon' ? getProficiencyBonus(combatant.cr) : 0)}
          </span>
        </div>

        {/* Languages */}
        <div>
          <span className="font-medium text-dnd-secondary">Languages:</span>
          <span className="text-dnd-primary ml-1">
            {combatant.type === 'dragon' && 'Common, Draconic'}
            {combatant.type === 'undead' && 'The languages it knew in life'}
            {combatant.type === 'giant' && 'Giant'}
            {combatant.isPC && 'Common + varies by race'}
            {!combatant.isPC && !['dragon', 'undead', 'giant'].includes(combatant.type || '') && 'Common'}
          </span>
        </div>

        {/* XP and Environment */}
        {combatant.xp && !combatant.isPC && (
          <div>
            <span className="font-medium text-dnd-secondary">XP Value:</span>
            <span className="text-dnd-primary ml-1">{combatant.xp.toLocaleString()}</span>
          </div>
        )}
      </div>

      {/* Traits */}
      {!combatant.isPC && (
        <div className="border-t border-dnd pt-2">
          <h5 className="font-medium text-dnd-primary mb-1 text-xs">Special Abilities</h5>
          <div className="space-y-1 text-xs">
            {combatant.type === 'dragon' && (
              <>
                <div>
                  <span className="font-bold text-dnd-secondary">Legendary Resistance (3/Day):</span>
                  <span className="text-dnd-primary ml-1">If the dragon fails a saving throw, it can choose to succeed instead.</span>
                </div>
                <div>
                  <span className="font-bold text-dnd-secondary">Frightful Presence:</span>
                  <span className="text-dnd-primary ml-1">Each creature within 120 feet must make a <span className="font-bold">DC 19</span> Wisdom saving throw or become frightened for 1 minute.</span>
                </div>
              </>
            )}
            {combatant.type === 'undead' && combatant.name.toLowerCase().includes('lich') && (
              <>
                <div>
                  <span className="font-bold text-dnd-secondary">Legendary Resistance (3/Day):</span>
                  <span className="text-dnd-primary ml-1">If the lich fails a saving throw, it can choose to succeed instead.</span>
                </div>
                <div>
                  <span className="font-bold text-dnd-secondary">Rejuvenation:</span>
                  <span className="text-dnd-primary ml-1">If it has a phylactery, a destroyed lich gains a new body in <span className="font-bold">1d10</span> days.</span>
                </div>
              </>
            )}
            {combatant.type === 'giant' && (
              <div>
                <span className="font-bold text-dnd-secondary">Regeneration:</span>
                <span className="text-dnd-primary ml-1">The troll regains <span className="font-bold">10</span> hit points at the start of its turn if it has at least 1 hit point.</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      {!combatant.isPC && (
        <div className="border-t border-dnd pt-2">
          <h5 className="font-medium text-dnd-primary mb-1 text-xs">Actions</h5>
          <div className="space-y-1 text-xs">
            {combatant.type === 'dragon' && (
              <>
                <div>
                  <span className="font-bold text-dnd-secondary">Multiattack:</span>
                  <span className="text-dnd-primary ml-1">The dragon can use its Frightful Presence. It then makes three attacks: one with its bite and two with its claws.</span>
                </div>
                <div>
                  <span className="font-bold text-dnd-secondary">Bite:</span>
                  <span className="text-dnd-primary ml-1">Melee Weapon Attack: <span className="font-bold">+{Math.floor((abilities.str - 10) / 2) + getProficiencyBonus(combatant.cr)}</span> to hit, reach 10 ft., one target. Hit: <span className="font-bold">2d10 + {Math.floor((abilities.str - 10) / 2)}</span> piercing damage plus <span className="font-bold">1d6</span> fire damage.</span>
                </div>
                <div>
                  <span className="font-bold text-dnd-secondary">Fire Breath (Recharge 5-6):</span>
                  <span className="text-dnd-primary ml-1">90-foot line, DC <span className="font-bold">{8 + getProficiencyBonus(combatant.cr) + Math.floor((abilities.con - 10) / 2)}</span> Dex save, <span className="font-bold">18d6</span> fire damage (half on success).</span>
                </div>
              </>
            )}
            {combatant.type === 'undead' && combatant.name.toLowerCase().includes('lich') && (
              <>
                <div>
                  <span className="font-bold text-dnd-secondary">Paralyzing Touch:</span>
                  <span className="text-dnd-primary ml-1">Melee Spell Attack: <span className="font-bold">+{Math.floor((abilities.int - 10) / 2) + getProficiencyBonus(combatant.cr)}</span> to hit, reach 5 ft., one creature. Hit: <span className="font-bold">3d6</span> cold damage, target must save or be paralyzed for 1 minute.</span>
                </div>
                <div>
                  <span className="font-bold text-dnd-secondary">Spellcasting:</span>
                  <span className="text-dnd-primary ml-1">18th-level spellcaster. Spell save DC <span className="font-bold">{8 + getProficiencyBonus(combatant.cr) + Math.floor((abilities.int - 10) / 2)}</span>, <span className="font-bold">+{getProficiencyBonus(combatant.cr) + Math.floor((abilities.int - 10) / 2)}</span> to hit with spell attacks.</span>
                </div>
              </>
            )}
            {combatant.type === 'giant' && (
              <>
                <div>
                  <span className="font-bold text-dnd-secondary">Multiattack:</span>
                  <span className="text-dnd-primary ml-1">The troll makes three attacks: one with its bite and two with its claws.</span>
                </div>
                <div>
                  <span className="font-bold text-dnd-secondary">Bite:</span>
                  <span className="text-dnd-primary ml-1">Melee Weapon Attack: <span className="font-bold">+{Math.floor((abilities.str - 10) / 2) + getProficiencyBonus(combatant.cr)}</span> to hit, reach 5 ft., one target. Hit: <span className="font-bold">1d6 + {Math.floor((abilities.str - 10) / 2)}</span> piercing damage.</span>
                </div>
                <div>
                  <span className="font-bold text-dnd-secondary">Claw:</span>
                  <span className="text-dnd-primary ml-1">Melee Weapon Attack: <span className="font-bold">+{Math.floor((abilities.str - 10) / 2) + getProficiencyBonus(combatant.cr)}</span> to hit, reach 5 ft., one target. Hit: <span className="font-bold">1d6 + {Math.floor((abilities.str - 10) / 2)}</span> slashing damage.</span>
                </div>
              </>
            )}
            {!['dragon', 'undead', 'giant'].includes(combatant.type || '') && (
              <div>
                <span className="font-bold text-dnd-secondary">Attack:</span>
                <span className="text-dnd-primary ml-1">Melee Weapon Attack: <span className="font-bold">+{Math.floor((abilities.str - 10) / 2) + getProficiencyBonus(combatant.cr)}</span> to hit, reach 5 ft., one target. Hit: <span className="font-bold">1d6 + {Math.floor((abilities.str - 10) / 2)}</span> damage.</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Legendary Actions */}
      {!combatant.isPC && combatant.cr && parseFloat(combatant.cr) >= 10 && ['dragon', 'undead'].includes(combatant.type || '') && (
        <div className="border-t border-dnd pt-2">
          <h5 className="font-medium text-dnd-primary mb-1 text-xs">Legendary Actions (3 per turn)</h5>
          <div className="space-y-1 text-xs">
            <div>
              <span className="font-bold text-dnd-secondary">Detect:</span>
              <span className="text-dnd-primary ml-1">The {combatant.name.toLowerCase()} makes a Wisdom (Perception) check.</span>
            </div>
            <div>
              <span className="font-bold text-dnd-secondary">Attack:</span>
              <span className="text-dnd-primary ml-1">The {combatant.name.toLowerCase()} makes one attack.</span>
            </div>
            {combatant.type === 'dragon' && (
              <div>
                <span className="font-bold text-dnd-secondary">Wing Attack (Costs 2 Actions):</span>
                <span className="text-dnd-primary ml-1">All creatures within 15 feet make DC <span className="font-bold">{8 + getProficiencyBonus(combatant.cr) + Math.floor((abilities.str - 10) / 2)}</span> Dex save or take <span className="font-bold">2d6 + {Math.floor((abilities.str - 10) / 2)}</span> bludgeoning damage and be knocked prone.</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Conditions */}
      {combatant.conditions && combatant.conditions.length > 0 && (
        <div className="border-t border-dnd pt-2">
          <h5 className="font-medium text-dnd-primary mb-1 text-xs flex items-center gap-1">
            <Swords className="w-3 h-3" />
            Active Conditions
          </h5>
          <div className="flex flex-wrap gap-1">
            {combatant.conditions.map((condition, index) => (
              <span
                key={index}
                className="badge-dnd badge-condition text-xs px-1.5 py-0.5 rounded bg-red-900 text-red-300"
              >
                {condition.name}
                {condition.duration && ` (${condition.duration})`}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* PC-specific info */}
      {combatant.isPC && combatant.level && (
        <div className="bg-green-900/20 border border-green-800 rounded p-2">
          <div className="text-xs text-green-300">
            <strong>Player Character</strong> - Level {combatant.level}
          </div>
        </div>
      )}

      {/* Monster-specific info */}
      {!combatant.isPC && combatant.cr && (
        <div className="bg-orange-900/20 border border-orange-800 rounded p-2">
          <div className="text-xs text-orange-300">
            <strong>Challenge Rating {formatChallengeRating(combatant.cr)}</strong>
            {combatant.xp && ` (${combatant.xp} XP)`}
            <br />
            Proficiency Bonus: +{getProficiencyBonus(combatant.cr)}
          </div>
        </div>
      )}
        </>
      )}
    </div>
  )
}

export default StatBlock