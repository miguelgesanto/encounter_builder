// Character/PC import parsing utilities

import { Combatant } from '../types/combatant';
import { ImportResult, extractNumber, extractString, sanitizeHPValue, sanitizeACValue, validateImportText, sanitizeName, sanitizeLevelValue } from './importUtils';

export interface PCImportData {
  name: string;
  level?: number;
  hp: number;
  maxHp: number;
  ac: number;
  initiative: number;
  isPC: true;
  conditions: Array<{ name: string; duration?: number }>;
  tempHp: number;
  class?: string;
  race?: string;
  background?: string;
}

export const parsePC = (text: string): ImportResult => {
  const warnings: string[] = [];
  const errors: string[] = [];

  try {
    // Validate input text first
    const validation = validateImportText(text);
    if (!validation.isValid) {
      errors.push(...validation.errors);
      return {
        success: false,
        type: 'pc',
        confidence: 'low',
        data: {},
        warnings,
        errors,
        source: 'text'
      };
    }

    // Extract basic character information
    const rawName = extractCharacterName(text);
    const name = sanitizeName(rawName);
    const rawLevel = extractLevel(text);
    const level = sanitizeLevelValue(rawLevel);
    const hp = extractHP(text);
    const ac = extractAC(text);
    const characterClass = extractClass(text);
    const race = extractRace(text);

    if (!rawName) {
      errors.push('Could not find character name');
    }

    if (!hp) {
      warnings.push('HP not found, using default value');
    }

    if (!ac) {
      warnings.push('AC not found, using default value');
    }

    if (!rawLevel || rawLevel < 1 || rawLevel > 20) {
      warnings.push('Level not found or invalid, using level 1');
    }

    const pcData: PCImportData = {
      name,
      level,
      hp: sanitizeHPValue(hp),
      maxHp: sanitizeHPValue(hp),
      ac: sanitizeACValue(ac),
      initiative: 0,
      isPC: true,
      conditions: [],
      tempHp: 0,
      class: characterClass,
      race: race
    };

    return {
      success: true,
      type: 'pc',
      confidence: 'high',
      data: pcData,
      warnings,
      errors,
      source: 'text'
    };

  } catch (error) {
    errors.push(`Failed to parse character: ${error instanceof Error ? error.message : 'Unknown error'}`);

    return {
      success: false,
      type: 'pc',
      confidence: 'low',
      data: {},
      warnings,
      errors,
      source: 'text'
    };
  }
};

// Helper functions for extracting PC data
const extractCharacterName = (text: string): string => {
  // Look for patterns like "Name: Aragorn" or just a name at the start
  let name = extractString(text, /(?:name|character):\s*([^\n,]+)/i);

  if (!name) {
    // Try to find a name at the beginning of the text
    const firstLine = text.split('\n')[0];
    if (firstLine && firstLine.length < 50 && !firstLine.includes(':')) {
      name = firstLine.trim();
    }
  }

  return name;
};

const extractLevel = (text: string): number => {
  return extractNumber(text, /level\s*:?\s*(\d+)/i, 1);
};

const extractHP = (text: string): number => {
  // Look for various HP patterns
  let hp = extractNumber(text, /(?:hit points?|hp)\s*:?\s*(\d+)/i);

  if (!hp) {
    hp = extractNumber(text, /health\s*:?\s*(\d+)/i);
  }

  if (!hp) {
    // Look for "HP: 45/45" pattern
    hp = extractNumber(text, /hp\s*:?\s*(\d+)\/\d+/i);
  }

  return hp;
};

const extractAC = (text: string): number => {
  return extractNumber(text, /(?:armor class|ac)\s*:?\s*(\d+)/i, 10);
};

const extractClass = (text: string): string => {
  return extractString(text, /class\s*:?\s*([^\n,]+)/i);
};

const extractRace = (text: string): string => {
  return extractString(text, /race\s*:?\s*([^\n,]+)/i);
};

// D&D Beyond URL parsing
export const parseDnDBeyondURL = async (url: string): Promise<ImportResult> => {
  const warnings: string[] = [];
  const errors: string[] = [];

  try {
    // Extract character ID from URL
    const match = url.match(/\/characters\/(\d+)/);
    if (!match) {
      errors.push('Invalid D&D Beyond character URL');
      return {
        success: false,
        type: 'pc',
        confidence: 'low',
        data: {},
        warnings,
        errors,
        source: 'dndbeyond'
      };
    }

    const characterId = match[1];
    warnings.push('D&D Beyond import requires the character to be set to Public');
    warnings.push('Attempting to fetch character data...');

    // Note: In a real implementation, you would make an API call here
    // For now, we'll return a placeholder structure
    errors.push('D&D Beyond API integration not yet implemented. Please use text import instead.');

    return {
      success: false,
      type: 'pc',
      confidence: 'high',
      data: {},
      warnings,
      errors,
      source: 'dndbeyond'
    };

  } catch (error) {
    errors.push(`Failed to parse D&D Beyond URL: ${error instanceof Error ? error.message : 'Unknown error'}`);

    return {
      success: false,
      type: 'pc',
      confidence: 'low',
      data: {},
      warnings,
      errors,
      source: 'dndbeyond'
    };
  }
};

// Convert PC import data to Combatant format
export const importDataToCombatant = (importData: PCImportData): Combatant => {
  const id = Date.now().toString() + Math.random();

  return {
    id,
    name: importData.name,
    hp: importData.hp,
    maxHp: importData.maxHp,
    ac: importData.ac,
    initiative: importData.initiative,
    isPC: true,
    level: importData.level,
    conditions: importData.conditions,
    tempHp: importData.tempHp,
    importSource: 'text',
    importedAt: new Date().toISOString()
  };
};