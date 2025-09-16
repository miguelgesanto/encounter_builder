// D&D-themed dark design system for combat tracker
export const designSystem = {
  // Color Palette - Dark theme optimized for D&D
  colors: {
    // Background Colors
    bg: {
      primary: '#0f0f12',        // Deep dark blue-black (main background)
      secondary: '#1a1b23',      // Dark slate (secondary surfaces)
      elevated: '#242631',       // Elevated surfaces (cards, panels)
      hover: '#2d2f3d',         // Hover states
    },

    // Text Colors
    text: {
      primary: '#e8e9f0',       // Main text (off-white)
      secondary: '#b4b6c7',     // Secondary text
      muted: '#7c7f8f',         // Muted text, labels
      inverse: '#1a1b23',       // Text on light backgrounds
    },

    // D&D Thematic Colors
    dnd: {
      // Class Colors (desaturated for dark theme)
      barbarian: '#e74c3c',
      bard: '#e67e22',
      cleric: '#f1c40f',
      druid: '#27ae60',
      fighter: '#34495e',
      monk: '#9b59b6',
      paladin: '#3498db',
      ranger: '#16a085',
      rogue: '#95a5a6',
      sorcerer: '#e74c3c',
      warlock: '#8e44ad',
      wizard: '#2980b9',
    },

    // Combat State Colors
    combat: {
      currentTurn: '#dc2626',    // Active turn (red)
      playerCharacter: '#059669', // PC indicator (green)
      monster: '#d97706',        // Monster/NPC (orange)
      unconscious: '#7f1d1d',    // Unconscious state
      dead: '#450a0a',           // Dead state
    },

    // Condition Colors
    conditions: {
      negative: '#dc2626',       // Harmful conditions (red)
      positive: '#059669',       // Beneficial conditions (green)
      neutral: '#d97706',        // Neutral conditions (amber)
      concentration: '#7c3aed',  // Concentration (purple)
    },

    // Difficulty Colors
    difficulty: {
      trivial: '#6b7280',
      easy: '#059669',
      medium: '#d97706',
      hard: '#dc2626',
      deadly: '#7f1d1d',
    },

    // UI Colors
    ui: {
      border: '#374151',         // Borders
      borderFocus: '#3b82f6',    // Focus borders
      input: '#1f2937',          // Input backgrounds
      button: '#374151',         // Button backgrounds
      buttonHover: '#4b5563',    // Button hover
      success: '#059669',
      warning: '#d97706',
      error: '#dc2626',
      info: '#3b82f6',
    },
  },

  // Typography
  typography: {
    fontFamily: {
      sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      mono: ['JetBrains Mono', 'Consolas', 'Monaco', 'monospace'],
      display: ['Cinzel', 'serif'], // Fantasy font for headers
    },

    fontSize: {
      xs: '0.75rem',   // 12px
      sm: '0.875rem',  // 14px
      base: '1rem',    // 16px
      lg: '1.125rem',  // 18px
      xl: '1.25rem',   // 20px
      '2xl': '1.5rem', // 24px
      '3xl': '1.875rem', // 30px
    },

    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },

  // Spacing
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '0.75rem',   // 12px
    lg: '1rem',      // 16px
    xl: '1.5rem',    // 24px
    '2xl': '2rem',   // 32px
  },

  // Border Radius
  borderRadius: {
    sm: '0.25rem',   // 4px
    md: '0.375rem',  // 6px
    lg: '0.5rem',    // 8px
    xl: '0.75rem',   // 12px
  },

  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
  },

  // Z-Index
  zIndex: {
    base: 0,
    elevated: 10,
    overlay: 50,
    modal: 100,
    tooltip: 200,
  },
}

// CSS Custom Properties Generator
export const generateCSSVariables = () => {
  const cssVars: string[] = []

  // Generate color variables
  Object.entries(designSystem.colors).forEach(([category, colors]) => {
    if (typeof colors === 'object') {
      Object.entries(colors).forEach(([name, value]) => {
        cssVars.push(`--color-${category}-${name}: ${value};`)
      })
    }
  })

  // Generate spacing variables
  Object.entries(designSystem.spacing).forEach(([name, value]) => {
    cssVars.push(`--spacing-${name}: ${value};`)
  })

  // Generate border radius variables
  Object.entries(designSystem.borderRadius).forEach(([name, value]) => {
    cssVars.push(`--radius-${name}: ${value};`)
  })

  return `:root {\n  ${cssVars.join('\n  ')}\n}`
}

// Component Style Utilities
export const styleUtils = {
  // Combat turn indicators
  getCurrentTurnStyle: () => ({
    backgroundColor: designSystem.colors.combat.currentTurn + '20', // 20% opacity
    borderColor: designSystem.colors.combat.currentTurn,
    borderWidth: '2px',
    boxShadow: `0 0 0 1px ${designSystem.colors.combat.currentTurn}40`,
  }),

  // Player vs NPC styling
  getCreatureTypeStyle: (isPC: boolean) => ({
    backgroundColor: isPC
      ? designSystem.colors.combat.playerCharacter + '15'
      : designSystem.colors.bg.elevated,
    borderColor: isPC
      ? designSystem.colors.combat.playerCharacter + '60'
      : designSystem.colors.ui.border,
  }),

  // Condition styling
  getConditionStyle: (conditionType: 'negative' | 'positive' | 'neutral' | 'concentration') => ({
    backgroundColor: designSystem.colors.conditions[conditionType] + '20',
    borderColor: designSystem.colors.conditions[conditionType] + '60',
    color: designSystem.colors.conditions[conditionType],
  }),

  // Difficulty styling
  getDifficultyStyle: (difficulty: keyof typeof designSystem.colors.difficulty) => ({
    color: designSystem.colors.difficulty[difficulty],
    fontWeight: designSystem.typography.fontWeight.bold,
  }),
}

export default designSystem