// Export utilities for D&D characters and monsters

import { Combatant } from '../types/combatant';

export type ExportFormat = 'json' | 'text' | 'csv';

export interface ExportOptions {
  format: ExportFormat;
  includeStats?: boolean;
  includeConditions?: boolean;
  includeImportSource?: boolean;
}

// Export single combatant
export const exportCombatant = (combatant: Combatant, options: ExportOptions): string => {
  switch (options.format) {
    case 'json':
      return exportToJSON([combatant], options);
    case 'text':
      return exportToText([combatant], options);
    case 'csv':
      return exportToCSV([combatant], options);
    default:
      throw new Error(`Unsupported export format: ${options.format}`);
  }
};

// Export multiple combatants
export const exportCombatants = (combatants: Combatant[], options: ExportOptions): string => {
  switch (options.format) {
    case 'json':
      return exportToJSON(combatants, options);
    case 'text':
      return exportToText(combatants, options);
    case 'csv':
      return exportToCSV(combatants, options);
    default:
      throw new Error(`Unsupported export format: ${options.format}`);
  }
};

// JSON Export
const exportToJSON = (combatants: Combatant[], options: ExportOptions): string => {
  const exportData = combatants.map(combatant => {
    const data: any = {
      name: combatant.name,
      hp: combatant.hp,
      maxHp: combatant.maxHp,
      ac: combatant.ac,
      initiative: combatant.initiative,
      isPC: combatant.isPC
    };

    if (combatant.isPC && combatant.level) {
      data.level = combatant.level;
    }

    if (!combatant.isPC && combatant.cr) {
      data.cr = combatant.cr;
      data.xp = combatant.xp;
      data.type = combatant.type;
      data.environment = combatant.environment;
    }

    if (options.includeStats && combatant.tempHp !== undefined) {
      data.tempHp = combatant.tempHp;
    }

    if (options.includeConditions && combatant.conditions?.length > 0) {
      data.conditions = combatant.conditions;
    }

    if (options.includeImportSource) {
      data.importSource = combatant.importSource;
      data.importedAt = combatant.importedAt;
    }

    return data;
  });

  return JSON.stringify(exportData, null, 2);
};

// Text Export (stat block format)
const exportToText = (combatants: Combatant[], options: ExportOptions): string => {
  return combatants.map(combatant => {
    let text = `${combatant.name}\n`;
    text += `${'='.repeat(combatant.name.length)}\n\n`;

    if (combatant.isPC) {
      text += `Player Character`;
      if (combatant.level) {
        text += ` - Level ${combatant.level}`;
      }
      text += `\n`;
    } else {
      if (combatant.type) {
        text += `${combatant.type.charAt(0).toUpperCase() + combatant.type.slice(1)}`;
      }
      if (combatant.cr) {
        text += ` - Challenge Rating ${combatant.cr}`;
        if (combatant.xp) {
          text += ` (${combatant.xp} XP)`;
        }
      }
      text += `\n`;
    }

    text += `\n`;
    text += `Armor Class: ${combatant.ac}\n`;
    text += `Hit Points: ${combatant.hp}`;
    if (combatant.maxHp !== combatant.hp) {
      text += ` (${combatant.maxHp} max)`;
    }
    if (options.includeStats && combatant.tempHp && combatant.tempHp > 0) {
      text += ` + ${combatant.tempHp} temp`;
    }
    text += `\n`;

    if (combatant.initiative !== 0) {
      text += `Initiative: ${combatant.initiative > 0 ? '+' : ''}${combatant.initiative}\n`;
    }

    if (!combatant.isPC && combatant.environment && combatant.environment !== 'any') {
      text += `Environment: ${combatant.environment.charAt(0).toUpperCase() + combatant.environment.slice(1)}\n`;
    }

    if (options.includeConditions && combatant.conditions?.length > 0) {
      text += `\nConditions: ${combatant.conditions.map(c =>
        c.duration ? `${c.name} (${c.duration})` : c.name
      ).join(', ')}\n`;
    }

    if (options.includeImportSource && combatant.importSource) {
      text += `\nImported from: ${combatant.importSource}`;
      if (combatant.importedAt) {
        text += ` on ${new Date(combatant.importedAt).toLocaleDateString()}`;
      }
      text += `\n`;
    }

    return text;
  }).join('\n\n---\n\n');
};

// CSV Export
const exportToCSV = (combatants: Combatant[], options: ExportOptions): string => {
  const headers = ['Name', 'Type', 'HP', 'Max HP', 'AC', 'Initiative'];

  // Add conditional headers
  if (combatants.some(c => c.isPC && c.level)) {
    headers.push('Level');
  }
  if (combatants.some(c => !c.isPC && c.cr)) {
    headers.push('CR', 'XP', 'Creature Type', 'Environment');
  }
  if (options.includeStats) {
    headers.push('Temp HP');
  }
  if (options.includeConditions) {
    headers.push('Conditions');
  }
  if (options.includeImportSource) {
    headers.push('Import Source', 'Import Date');
  }

  const csvData = [headers.join(',')];

  combatants.forEach(combatant => {
    const row = [
      `"${combatant.name}"`,
      combatant.isPC ? 'PC' : 'Monster',
      combatant.hp.toString(),
      combatant.maxHp.toString(),
      combatant.ac.toString(),
      combatant.initiative.toString()
    ];

    // Add conditional data
    if (combatants.some(c => c.isPC && c.level)) {
      row.push(combatant.isPC && combatant.level ? combatant.level.toString() : '');
    }
    if (combatants.some(c => !c.isPC && c.cr)) {
      row.push(
        !combatant.isPC && combatant.cr ? combatant.cr : '',
        !combatant.isPC && combatant.xp ? combatant.xp.toString() : '',
        !combatant.isPC && combatant.type ? `"${combatant.type}"` : '',
        !combatant.isPC && combatant.environment ? `"${combatant.environment}"` : ''
      );
    }
    if (options.includeStats) {
      row.push(combatant.tempHp ? combatant.tempHp.toString() : '0');
    }
    if (options.includeConditions) {
      const conditions = combatant.conditions?.map(c =>
        c.duration ? `${c.name} (${c.duration})` : c.name
      ).join('; ') || '';
      row.push(`"${conditions}"`);
    }
    if (options.includeImportSource) {
      row.push(
        combatant.importSource ? `"${combatant.importSource}"` : '',
        combatant.importedAt ? `"${new Date(combatant.importedAt).toLocaleDateString()}"` : ''
      );
    }

    csvData.push(row.join(','));
  });

  return csvData.join('\n');
};

// Utility to download export data
export const downloadExport = (data: string, filename: string, format: ExportFormat): void => {
  const mimeTypes = {
    json: 'application/json',
    text: 'text/plain',
    csv: 'text/csv'
  };

  const blob = new Blob([data], { type: mimeTypes[format] });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.${format}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};

// Generate suggested filename based on content
export const generateExportFilename = (combatants: Combatant[]): string => {
  if (combatants.length === 1) {
    return `${combatants[0].name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}`;
  } else {
    const pcCount = combatants.filter(c => c.isPC).length;
    const monsterCount = combatants.filter(c => !c.isPC).length;

    let filename = 'encounter';
    if (pcCount > 0 && monsterCount > 0) {
      filename = `encounter_${pcCount}pcs_${monsterCount}monsters`;
    } else if (pcCount > 0) {
      filename = `party_${pcCount}characters`;
    } else if (monsterCount > 0) {
      filename = `monsters_${monsterCount}creatures`;
    }

    return filename;
  }
};