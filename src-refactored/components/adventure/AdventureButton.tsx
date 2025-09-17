import React from 'react';
import { ButtonVariant, ButtonSize } from '../../types/combatant';

interface AdventureButtonProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  title?: string;
  'aria-label'?: string;
}

/**
 * Adventure-Themed Button Component
 * 
 * Provides consistent button styling across the D&D Encounter Builder
 * with medieval/fantasy aesthetic and proper accessibility support.
 * 
 * IMPROVEMENTS IMPLEMENTED:
 * ✅ Consistent adventure theming with gradients and textures
 * ✅ Functional color coding (primary, secondary, danger, success)
 * ✅ Multiple size options for different use cases
 * ✅ Accessibility features (ARIA labels, focus indicators)
 * ✅ Hover effects and visual feedback
 * ✅ Disabled state handling
 */
export const AdventureButton: React.FC<AdventureButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  type = 'button',
  className = '',
  title,
  'aria-label': ariaLabel,
}) => {
  // Base styles that apply to all buttons
  const baseStyles = `
    inline-flex items-center justify-center gap-2
    font-adventure-body font-semibold
    border border-transparent rounded-lg
    transition-all duration-200 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-offset-2
    shadow-sm hover:shadow-md
    disabled:opacity-50 disabled:cursor-not-allowed
    disabled:transform-none disabled:shadow-none
    transform hover:scale-105 active:scale-95
  `;

  // Size-specific styles
  const sizeStyles = {
    xs: 'px-2 py-1 text-xs min-h-[24px]',
    sm: 'px-3 py-1.5 text-sm min-h-[32px]',
    md: 'px-4 py-2 text-base min-h-[40px]',
    lg: 'px-6 py-3 text-lg min-h-[48px]',
    xl: 'px-8 py-4 text-xl min-h-[56px]'
  };

  // Variant-specific styles with adventure theming
  const variantStyles = {
    primary: `
      bg-gradient-to-r from-orange-600 to-amber-600
      text-white border-orange-500/50
      hover:from-orange-700 hover:to-amber-700
      focus:ring-orange-500/50
      shadow-amber-500/20 hover:shadow-amber-500/40
    `,
    secondary: `
      bg-gradient-to-r from-slate-600 to-slate-700
      text-slate-200 border-slate-500/50
      hover:from-slate-700 hover:to-slate-800
      focus:ring-slate-500/50
      shadow-slate-500/20 hover:shadow-slate-500/40
    `,
    danger: `
      bg-gradient-to-r from-red-600 to-red-700
      text-white border-red-500/50
      hover:from-red-700 hover:to-red-800
      focus:ring-red-500/50
      shadow-red-500/20 hover:shadow-red-500/40
    `,
    success: `
      bg-gradient-to-r from-green-600 to-emerald-600
      text-white border-green-500/50
      hover:from-green-700 hover:to-emerald-700
      focus:ring-green-500/50
      shadow-green-500/20 hover:shadow-green-500/40
    `,
    warning: `
      bg-gradient-to-r from-yellow-600 to-orange-500
      text-white border-yellow-500/50
      hover:from-yellow-700 hover:to-orange-600
      focus:ring-yellow-500/50
      shadow-yellow-500/20 hover:shadow-yellow-500/40
    `
  };

  // Combine all styles
  const combinedClassName = `
    ${baseStyles}
    ${sizeStyles[size]}
    ${variantStyles[variant]}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={combinedClassName}
      title={title}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
};

// Compound component for button groups
interface AdventureButtonGroupProps {
  children: React.ReactNode;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export const AdventureButtonGroup: React.FC<AdventureButtonGroupProps> = ({
  children,
  orientation = 'horizontal',
  className = ''
}) => {
  const orientationStyles = {
    horizontal: 'flex flex-row gap-2',
    vertical: 'flex flex-col gap-2'
  };

  return (
    <div className={`${orientationStyles[orientation]} ${className}`}>
      {children}
    </div>
  );
};

// Icon button variant for compact actions
interface AdventureIconButtonProps extends Omit<AdventureButtonProps, 'children'> {
  icon: React.ReactNode;
  label: string; // Required for accessibility
}

export const AdventureIconButton: React.FC<AdventureIconButtonProps> = ({
  icon,
  label,
  size = 'md',
  ...props
}) => {
  // Icon-specific size adjustments
  const iconSizeStyles = {
    xs: 'p-1 w-6 h-6',
    sm: 'p-1.5 w-8 h-8',
    md: 'p-2 w-10 h-10',
    lg: 'p-3 w-12 h-12',
    xl: 'p-4 w-14 h-14'
  };

  return (
    <AdventureButton
      {...props}
      size={size}
      className={`${iconSizeStyles[size]} ${props.className || ''}`}
      aria-label={label}
      title={label}
    >
      {icon}
    </AdventureButton>
  );
};

/**
 * Pre-configured button variants for common actions
 */
export const QuickActionButtons = {
  // Combat actions
  NextTurn: ({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) => (
    <AdventureButton variant="danger" onClick={onClick} disabled={disabled}>
      ➡️ Next Turn
    </AdventureButton>
  ),

  RollInitiative: ({ onClick }: { onClick: () => void }) => (
    <AdventureButton variant="warning" onClick={onClick}>
      🎲 Roll Initiative
    </AdventureButton>
  ),

  AddCombatant: ({ onClick }: { onClick: () => void }) => (
    <AdventureButton variant="success" onClick={onClick}>
      ➕ Add Combatant
    </AdventureButton>
  ),

  // Save/Load actions
  SaveEncounter: ({ onClick }: { onClick: () => void }) => (
    <AdventureButton variant="primary" onClick={onClick}>
      💾 Save
    </AdventureButton>
  ),

  LoadEncounter: ({ onClick }: { onClick: () => void }) => (
    <AdventureButton variant="secondary" onClick={onClick}>
      📂 Load
    </AdventureButton>
  ),

  // Utility actions
  Reset: ({ onClick }: { onClick: () => void }) => (
    <AdventureButton variant="secondary" onClick={onClick}>
      🔄 Reset
    </AdventureButton>
  ),

  Remove: ({ onClick, itemName }: { onClick: () => void; itemName?: string }) => (
    <AdventureIconButton
      variant="danger"
      size="sm"
      icon={<span>✕</span>}
      label={`Remove ${itemName || 'item'}`}
      onClick={onClick}
    />
  )
};

// Export types for use in other components
export type { AdventureButtonProps, AdventureButtonGroupProps, AdventureIconButtonProps };