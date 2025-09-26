import React, { useState } from 'react'
import { User, Shield, Heart, Zap, Eye, Swords, ChevronDown, ChevronUp, Upload, FileText, Globe } from 'lucide-react'
import { Combatant } from '../types/combatant'

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

  // Use actual abilities if available, otherwise fall back to defaults
  const abilities = combatant.abilities && Object.keys(combatant.abilities).length > 0
    ? {
        str: combatant.abilities.str ?? 10,
        dex: combatant.abilities.dex ?? 10,
        con: combatant.abilities.con ?? 10,
        int: combatant.abilities.int ?? 10,
        wis: combatant.abilities.wis ?? 10,
        cha: combatant.abilities.cha ?? 10
      }
    : getDefaultAbilities(combatant);

  console.log('🎭 StatBlock abilities source:', combatant.abilities ? 'imported' : 'default');
  console.log('🎭 StatBlock final abilities:', abilities);
  console.log('🎭 StatBlock combatant.actions:', combatant.actions);
  console.log('🎭 StatBlock actions length:', combatant.actions?.length || 0);

  const getImportSourceInfo = () => {
    if (!combatant.importSource) return null;

    switch (combatant.importSource) {
      case 'text':
        return {
          icon: <FileText className="w-3 h-3" />,
          label: 'Imported from text',
          color: 'text-blue-400'
        };
      case 'dndbeyond':
        return {
          icon: <Globe className="w-3 h-3" />,
          label: 'Imported from D&D Beyond',
          color: 'text-orange-400'
        };
      case 'manual':
        return {
          icon: <User className="w-3 h-3" />,
          label: 'Created manually',
          color: 'text-green-400'
        };
      default:
        return null;
    }
  };

  const importSourceInfo = getImportSourceInfo();

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
      <div className="grid grid-cols-4 gap-1 text-xs">
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
          <div className="text-sm font-bold text-dnd-primary">{combatant.speed || '30 ft.'}</div>
          <div className="text-xs text-dnd-muted">
            {combatant.type === 'dragon' && 'fly 80 ft.'}
            {combatant.type === 'undead' && 'hover'}
          </div>
        </div>
        {!combatant.isPC && (
          <div className="text-center bg-dnd-primary/10 rounded p-1">
            <div className="font-medium text-dnd-secondary flex items-center justify-center gap-1">
              <Swords className="w-3 h-3" />
              CR
            </div>
            <div className="text-sm font-bold text-dnd-primary">
              {combatant.cr ? formatChallengeRating(combatant.cr) : 'N/A'}
            </div>
            <div className="text-xs text-dnd-muted">
              {combatant.xp ? `${combatant.xp.toLocaleString()} XP` : 'XP Unknown'}
            </div>
          </div>
        )}
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
              {combatant.saves || 'None'}
            </div>
          </div>
          <div>
            <span className="font-medium text-dnd-secondary">Skills:</span>
            <div className="text-dnd-primary">
              {combatant.skills || 'None'}
            </div>
          </div>
        </div>

        {/* Resistances and Immunities */}
        <div>
          <span className="font-medium text-dnd-secondary">Damage Resistances:</span>
          <span className="text-dnd-primary ml-1">
            {combatant.damageResistances || 'None'}
          </span>
        </div>

        <div>
          <span className="font-medium text-dnd-secondary">Damage Immunities:</span>
          <span className="text-dnd-primary ml-1">
            {combatant.damageImmunities || 'None'}
          </span>
        </div>

        <div>
          <span className="font-medium text-dnd-secondary">Condition Immunities:</span>
          <span className="text-dnd-primary ml-1">
            {combatant.conditionImmunities || 'None'}
          </span>
        </div>

        {/* Senses */}
        <div>
          <span className="font-medium text-dnd-secondary">Senses:</span>
          <span className="text-dnd-primary ml-1">
            {combatant.senses || (
              <>
                {combatant.type === 'dragon' && 'Blindsight 60 ft., Darkvision 120 ft.'}
                {combatant.type === 'undead' && 'Darkvision 60 ft.'}
                {combatant.type === 'giant' && 'Darkvision 60 ft.'}
                {!['dragon', 'undead', 'giant'].includes(combatant.type || '') && 'Passive Perception ' + (10 + Math.floor((abilities.wis - 10) / 2))}
                {combatant.type === 'dragon' && ', Passive Perception ' + (10 + Math.floor((abilities.wis - 10) / 2) + getProficiencyBonus(combatant.cr))}
              </>
            )}
          </span>
        </div>

        {/* Languages */}
        <div>
          <span className="font-medium text-dnd-secondary">Languages:</span>
          <span className="text-dnd-primary ml-1">
            {combatant.languages || (
              <>
                {combatant.type === 'dragon' && 'Common, Draconic'}
                {combatant.type === 'undead' && 'The languages it knew in life'}
                {combatant.type === 'giant' && 'Giant'}
                {combatant.isPC && 'Common + varies by race'}
                {!combatant.isPC && !['dragon', 'undead', 'giant'].includes(combatant.type || '') && 'Common'}
              </>
            )}
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
            {/* Use imported special abilities if available */}
            {combatant.specialAbilities && combatant.specialAbilities.length > 0 ? (
              <>
                {console.log('🌟 StatBlock rendering imported special abilities:', combatant.specialAbilities)}
                {combatant.specialAbilities.map((ability, index) => {
                  // Format the description with proper bolding for DC values and damage
                  const formatAbilityDescription = (desc: string) => {
                    return desc
                      // Bold DC values
                      .replace(/DC\s*(\d+)/g, 'DC <span class="font-bold">$1</span>')
                      // Bold damage like "4 (1d4 + 2)"
                      .replace(/(\d+\s*\([^)]+\))/g, '<span class="font-bold">$1</span>')
                      // Bold standalone damage numbers before damage types
                      .replace(/(\d+)\s+(damage|hit points?)/g, '<span class="font-bold">$1</span> $2')
                      // Bold feet measurements
                      .replace(/(\d+)\s+feet?/g, '<span class="font-bold">$1</span> feet');
                  };

                  return (
                    <div key={index}>
                      <span className="font-bold text-dnd-secondary">{ability.name}:</span>
                      <span
                        className="text-dnd-primary ml-1"
                        dangerouslySetInnerHTML={{ __html: formatAbilityDescription(ability.description) }}
                      />
                    </div>
                  );
                })}
              </>
            ) : (
              /* Fallback to type-based special abilities if no imported ones */
              <>
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
              </>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      {!combatant.isPC && (
        <div className="border-t border-dnd pt-2">
          <h5 className="font-medium text-dnd-primary mb-1 text-xs">Actions</h5>
          <div className="space-y-1 text-xs">
            {/* Use imported actions if available */}
            {combatant.actions && combatant.actions.length > 0 ? (
              <>
                {console.log('🎯 StatBlock rendering imported actions:', combatant.actions)}
                {combatant.actions.map((action, index) => {
                  // Format the description with proper bolding for attack bonuses and damage
                  const formatActionDescription = (desc: string) => {
                    return desc
                      // Bold attack bonuses like "+4 to hit"
                      .replace(/(\+\d+)\s+to hit/g, '<span class="font-bold">$1</span> to hit')
                      // Bold damage like "4 (1d4 + 2)"
                      .replace(/(\d+\s*\([^)]+\))/g, '<span class="font-bold">$1</span>')
                      // Bold standalone damage numbers before damage types
                      .replace(/Hit:\s*(\d+)/g, 'Hit: <span class="font-bold">$1</span>')
                      // Bold DC values
                      .replace(/DC\s*(\d+)/g, 'DC <span class="font-bold">$1</span>');
                  };

                  return (
                    <div key={index}>
                      <span className="font-bold text-dnd-secondary">{action.name}:</span>
                      <span
                        className="text-dnd-primary ml-1"
                        dangerouslySetInnerHTML={{ __html: formatActionDescription(action.description) }}
                      />
                    </div>
                  );
                })}
              </>
            ) : (
              /* Fallback to type-based actions if no imported actions */
              <>
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
              </>
            )}
          </div>
        </div>
      )}

      {/* Legendary Actions */}
      {!combatant.isPC && combatant.legendaryActions && combatant.legendaryActions.length > 0 && (
        <div className="border-t border-dnd pt-2">
          <h5 className="font-medium text-dnd-primary mb-1 text-xs">Legendary Actions</h5>
          <div className="space-y-1 text-xs">
            {console.log('⭐ StatBlock rendering imported legendary actions:', combatant.legendaryActions)}
            {combatant.legendaryActions.map((action, index) => {
              // Format the description with proper bolding
              const formatLegendaryDescription = (desc: string) => {
                return desc
                  // Bold attack bonuses like "+4 to hit"
                  .replace(/(\+\d+)\s+to hit/g, '<span class="font-bold">$1</span> to hit')
                  // Bold damage like "4 (1d4 + 2)"
                  .replace(/(\d+\s*\([^)]+\))/g, '<span class="font-bold">$1</span>')
                  // Bold DC values
                  .replace(/DC\s*(\d+)/g, 'DC <span class="font-bold">$1</span>')
                  // Bold costs like "(Costs 2 Actions)"
                  .replace(/\(Costs\s+(\d+)\s+Actions?\)/g, '(Costs <span class="font-bold">$1</span> Actions)');
              };

              return (
                <div key={index}>
                  <span className="font-bold text-dnd-secondary">{action.name}:</span>
                  <span
                    className="text-dnd-primary ml-1"
                    dangerouslySetInnerHTML={{ __html: formatLegendaryDescription(action.description) }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Reactions */}
      {!combatant.isPC && combatant.reactions && combatant.reactions.length > 0 && (
        <div className="border-t border-dnd pt-2">
          <h5 className="font-medium text-dnd-primary mb-1 text-xs">Reactions</h5>
          <div className="space-y-1 text-xs">
            {console.log('⚡ StatBlock rendering imported reactions:', combatant.reactions)}
            {combatant.reactions.map((reaction, index) => {
              // Format the description with proper bolding
              const formatReactionDescription = (desc: string) => {
                return desc
                  // Bold attack bonuses like "+4 to hit"
                  .replace(/(\+\d+)\s+to hit/g, '<span class="font-bold">$1</span> to hit')
                  // Bold damage like "4 (1d4 + 2)"
                  .replace(/(\d+\s*\([^)]+\))/g, '<span class="font-bold">$1</span>')
                  // Bold DC values
                  .replace(/DC\s*(\d+)/g, 'DC <span class="font-bold">$1</span>');
              };

              return (
                <div key={index}>
                  <span className="font-bold text-dnd-secondary">{reaction.name}:</span>
                  <span
                    className="text-dnd-primary ml-1"
                    dangerouslySetInnerHTML={{ __html: formatReactionDescription(reaction.description) }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Lair Actions */}
      {!combatant.isPC && combatant.specialAbilities && combatant.specialAbilities.length > 0 && (
        (() => {
          // Filter for lair action abilities
          const lairActions = combatant.specialAbilities.filter(ability =>
            ability.name.toLowerCase().includes('lair') ||
            ability.description.toLowerCase().includes('lair action') ||
            ability.description.toLowerCase().includes('initiative count 20')
          );

          if (lairActions.length === 0) return null;

          return (
            <div className="border-t border-dnd pt-2">
              <h5 className="font-medium text-dnd-primary mb-1 text-xs">Lair Actions</h5>
              <div className="space-y-1 text-xs">
                {console.log('🏰 StatBlock rendering lair actions:', lairActions)}
                {lairActions.map((action, index) => {
                  // Format the description with proper bolding
                  const formatLairDescription = (desc: string) => {
                    return desc
                      // Bold DC values
                      .replace(/DC\s*(\d+)/g, 'DC <span class="font-bold">$1</span>')
                      // Bold damage like "4 (1d4 + 2)"
                      .replace(/(\d+\s*\([^)]+\))/g, '<span class="font-bold">$1</span>')
                      // Bold initiative count
                      .replace(/(initiative count 20)/gi, '<span class="font-bold">$1</span>')
                      // Bold feet measurements
                      .replace(/(\d+)\s+feet?/g, '<span class="font-bold">$1</span> feet');
                  };

                  return (
                    <div key={index}>
                      <span className="font-bold text-dnd-secondary">{action.name}:</span>
                      <span
                        className="text-dnd-primary ml-1"
                        dangerouslySetInnerHTML={{ __html: formatLairDescription(action.description) }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()
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


      {/* Import Source Info */}
      {importSourceInfo && (
        <div className="border-t border-dnd pt-2">
          <div className="flex items-center gap-2 text-xs">
            <div className={importSourceInfo.color}>
              {importSourceInfo.icon}
            </div>
            <span className="text-dnd-muted">{importSourceInfo.label}</span>
            {combatant.importedAt && (
              <span className="text-dnd-muted">
                • {new Date(combatant.importedAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      )}

        </>
      )}
    </div>
  )
}

export default StatBlock