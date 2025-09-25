// Import format detection and parsing utilities for D&D characters and monsters

export interface ImportResult {
  success: boolean;
  type: 'pc' | 'monster' | 'unknown';
  confidence: 'high' | 'medium' | 'low';
  data: Partial<any>;
  warnings: string[];
  errors: string[];
  source: 'dndbeyond' | 'text' | 'unknown';
}

export interface FormatDetectionResult {
  type: 'pc' | 'monster' | 'unknown';
  confidence: 'high' | 'medium' | 'low';
  indicators: string[];
  source: 'dndbeyond' | 'text';
}

// Input validation functions
export const validateImportText = (text: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!text || typeof text !== 'string') {
    errors.push('No text provided for import');
    return { isValid: false, errors };
  }

  const trimmed = text.trim();
  if (trimmed.length === 0) {
    errors.push('Import text is empty');
    return { isValid: false, errors };
  }

  if (trimmed.length < 10) {
    errors.push('Import text is too short to contain meaningful data');
    return { isValid: false, errors };
  }

  if (trimmed.length > 50000) {
    errors.push('Import text is too long (maximum 50,000 characters)');
    return { isValid: false, errors };
  }

  // Check for potentially malicious content
  const suspiciousPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(trimmed)) {
      errors.push('Import text contains potentially unsafe content');
      return { isValid: false, errors };
    }
  }

  return { isValid: true, errors: [] };
};

// Format Detection Functions with enhanced error handling
export const detectFormat = (text: string): FormatDetectionResult => {
  try {
    const validation = validateImportText(text);
    if (!validation.isValid) {
      return {
        type: 'unknown',
        confidence: 'low',
        indicators: validation.errors,
        source: 'text'
      };
    }

    const normalizedText = text.toLowerCase().trim();

    // URLs are no longer supported
    if (normalizedText.startsWith('http')) {
      return {
        type: 'unknown',
        confidence: 'low',
        indicators: ['URL detected - URL import not supported'],
        source: 'text'
      };
    }

  // Monster indicators (high confidence)
  const monsterIndicators = [
    'challenge', 'cr ', 'challenge rating',
    'armor class', 'hit points', 'speed',
    'str ', 'dex ', 'con ', 'int ', 'wis ', 'cha ',
    'saving throws', 'damage resistance', 'damage immunity',
    'condition immunity', 'senses', 'languages',
    'actions', 'legendary actions', 'lair actions'
  ];

  // PC indicators (high confidence)
  const pcIndicators = [
    'level', 'class:', 'race:', 'background:',
    'hit point maximum', 'proficiency bonus',
    'saving throw', 'skill', 'equipment',
    'spellcasting ability', 'spell slots'
  ];

  // Generic character indicators (medium confidence)
  const characterIndicators = [
    'name:', 'hp:', 'ac:', 'health',
    'armor', 'weapon', 'spell'
  ];

  const foundMonsterIndicators = monsterIndicators.filter(indicator =>
    normalizedText.includes(indicator)
  );

  const foundPcIndicators = pcIndicators.filter(indicator =>
    normalizedText.includes(indicator)
  );

  const foundCharacterIndicators = characterIndicators.filter(indicator =>
    normalizedText.includes(indicator)
  );

  // Determine type and confidence
  if (foundMonsterIndicators.length >= 3) {
    return {
      type: 'monster',
      confidence: 'high',
      indicators: foundMonsterIndicators,
      source: 'text'
    };
  }

  if (foundPcIndicators.length >= 2) {
    return {
      type: 'pc',
      confidence: 'high',
      indicators: foundPcIndicators,
      source: 'text'
    };
  }

  if (foundMonsterIndicators.length > foundPcIndicators.length) {
    return {
      type: 'monster',
      confidence: foundMonsterIndicators.length > 1 ? 'medium' : 'low',
      indicators: foundMonsterIndicators,
      source: 'text'
    };
  }

  if (foundPcIndicators.length > 0 || foundCharacterIndicators.length >= 2) {
    return {
      type: 'pc',
      confidence: foundPcIndicators.length > 0 ? 'medium' : 'low',
      indicators: [...foundPcIndicators, ...foundCharacterIndicators],
      source: 'text'
    };
  }

  return {
    type: 'unknown',
    confidence: 'low',
    indicators: [],
    source: 'text'
  };
  } catch (error) {
    console.warn('Error in format detection:', error);
    return {
      type: 'unknown',
      confidence: 'low',
      indicators: ['Format detection failed'],
      source: 'text'
    };
  }
};

// Text parsing utilities with enhanced error handling
export const extractNumber = (text: string, pattern: RegExp, defaultValue = 0): number => {
  try {
    if (!text || typeof text !== 'string') {
      return defaultValue;
    }

    const match = text.match(pattern);
    if (match && match[1]) {
      const num = parseInt(match[1]);
      return isNaN(num) ? defaultValue : num;
    }
    return defaultValue;
  } catch (error) {
    console.warn('Error extracting number:', error);
    return defaultValue;
  }
};

export const extractString = (text: string, pattern: RegExp, defaultValue = ''): string => {
  try {
    if (!text || typeof text !== 'string') {
      return defaultValue;
    }

    const match = text.match(pattern);
    return match && match[1] ? match[1].trim() : defaultValue;
  } catch (error) {
    console.warn('Error extracting string:', error);
    return defaultValue;
  }
};

export const sanitizeStatValue = (value: number, min = 1, max = 30): number => {
  if (typeof value !== 'number' || isNaN(value)) {
    return min;
  }
  return Math.max(min, Math.min(max, value));
};

export const sanitizeHPValue = (value: number): number => {
  if (typeof value !== 'number' || isNaN(value) || value < 1) {
    return 1;
  }
  // Cap at reasonable maximum to prevent system issues
  return Math.min(value, 9999);
};

export const sanitizeACValue = (value: number): number => {
  if (typeof value !== 'number' || isNaN(value)) {
    return 10;
  }
  return Math.max(10, Math.min(25, value));
};

export const sanitizeLevelValue = (value: number): number => {
  if (typeof value !== 'number' || isNaN(value) || value < 1) {
    return 1;
  }
  return Math.max(1, Math.min(20, value));
};

export const sanitizeName = (name: string): string => {
  if (!name || typeof name !== 'string') {
    return 'Unnamed';
  }

  const trimmed = name.trim();
  if (trimmed.length === 0) {
    return 'Unnamed';
  }

  // Remove dangerous characters and limit length
  const sanitized = trimmed.replace(/[<>\"'&]/g, '').substring(0, 100);
  return sanitized || 'Unnamed';
};

export const validateCR = (cr: string): { isValid: boolean; normalized: string; warnings: string[] } => {
  const warnings: string[] = [];

  if (!cr || typeof cr !== 'string') {
    warnings.push('Challenge Rating not specified, defaulting to CR 1');
    return { isValid: false, normalized: '1', warnings };
  }

  const trimmed = cr.trim();

  // Common CR formats
  const validCRs = ['0', '1/8', '1/4', '1/2', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10',
                    '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30'];

  if (validCRs.includes(trimmed)) {
    return { isValid: true, normalized: trimmed, warnings };
  }

  // Try to normalize common variations
  const normalized = trimmed
    .replace(/^cr\s*/i, '')
    .replace(/one[- ]?half/i, '1/2')
    .replace(/one[- ]?quarter/i, '1/4')
    .replace(/one[- ]?eighth/i, '1/8');

  if (validCRs.includes(normalized)) {
    warnings.push(`Normalized CR from "${trimmed}" to "${normalized}"`);
    return { isValid: true, normalized, warnings };
  }

  warnings.push(`Invalid CR "${trimmed}", defaulting to CR 1`);
  return { isValid: false, normalized: '1', warnings };
};

// CR to XP conversion
export const crToXP = (cr: string): number => {
  const crMap: Record<string, number> = {
    '0': 10,
    '1/8': 25,
    '1/4': 50,
    '1/2': 100,
    '1': 200,
    '2': 450,
    '3': 700,
    '4': 1100,
    '5': 1800,
    '6': 2300,
    '7': 2900,
    '8': 3900,
    '9': 5000,
    '10': 5900,
    '11': 7200,
    '12': 8400,
    '13': 10000,
    '14': 11500,
    '15': 13000,
    '16': 15000,
    '17': 18000,
    '18': 20000,
    '19': 22000,
    '20': 25000,
    '21': 33000,
    '22': 41000,
    '23': 50000,
    '24': 62000,
    '25': 75000,
    '26': 90000,
    '27': 105000,
    '28': 120000,
    '29': 135000,
    '30': 155000
  };

  return crMap[cr] || 0;
};

// Bulk import detection with enhanced error handling
export const detectBulkImport = (text: string): string[] => {
  try {
    const validation = validateImportText(text);
    if (!validation.isValid) {
      return [];
    }

    // First, try splitting by more distinctive separators (like dashes or multiple empty lines)
    let sections = text.split(/\n\s*[-=]{3,}\s*\n|\n\s*\n\s*\n/);

    // If that doesn't find multiple sections, try splitting by creature name patterns
    if (sections.length <= 1) {
      // Look for patterns that indicate new creatures (name followed by size/type)
      const creaturePattern = /\n\s*([A-Z][a-zA-Z\s]+)\s*\n\s*(Tiny|Small|Medium|Large|Huge|Gargantuan)/gi;
      const matches = [...text.matchAll(creaturePattern)];

      if (matches.length > 1) {
        sections = [];
        let lastIndex = 0;

        for (let i = 0; i < matches.length; i++) {
          const match = matches[i];
          const nextMatch = matches[i + 1];

          if (i > 0) {
            const startIndex = lastIndex;
            const endIndex = nextMatch ? nextMatch.index! : text.length;
            sections.push(text.substring(startIndex, endIndex));
          }

          if (i === 0) {
            lastIndex = match.index!;
          } else {
            lastIndex = match.index!;
          }
        }

        // Add the last section
        if (lastIndex < text.length) {
          sections.push(text.substring(lastIndex));
        }
      }
    }

    return sections
      .filter(section => {
        const trimmed = section.trim();
        return trimmed.length > 100 && trimmed.length < 10000; // Must be substantial
      })
      .filter(section => {
        try {
          const detection = detectFormat(section);
          // Only count as separate creatures if they have high confidence and include creature name
          return detection.confidence === 'high' &&
                 section.toLowerCase().includes('armor class') &&
                 section.toLowerCase().includes('hit points');
        } catch (error) {
          console.warn('Error detecting format for section:', error);
          return false;
        }
      })
      .slice(0, 50); // Limit to 50 sections to prevent performance issues
  } catch (error) {
    console.warn('Error in bulk import detection:', error);
    return [];
  }
};