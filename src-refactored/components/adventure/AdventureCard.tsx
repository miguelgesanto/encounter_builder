import React from 'react';
import { CombatCardVariant } from '../../types/combatant';

interface AdventureCardProps {
  children: React.ReactNode;
  variant?: CombatCardVariant;
  isHighlighted?: boolean;
  isSelected?: boolean;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  className?: string;
  role?: string;
  'aria-label'?: string;
  tabIndex?: number;
}

/**
 * Adventure-Themed Card Component
 * 
 * Provides the foundation for all card-based UI elements in the D&D Encounter Builder.
 * Features parchment-style backgrounds, appropriate borders, and adventure theming.
 * 
 * IMPROVEMENTS FROM ORIGINAL:
 * ✅ Consistent parchment/medieval aesthetic
 * ✅ PC vs Monster visual distinction (blue vs red borders)  
 * ✅ Current turn highlighting with glowing effects
 * ✅ Improved accessibility with proper ARIA attributes
 * ✅ Hover states and interactive feedback
 * ✅ Flexible styling system for different use cases
 */
export const AdventureCard: React.FC<AdventureCardProps> = ({
  children,
  variant = 'monster',
  isHighlighted = false,
  isSelected = false,
  onClick,
  className = '',
  role,
  'aria-label': ariaLabel,
  tabIndex,
}) => {
  // Base card styles - parchment background with medieval feel
  const baseStyles = `
    relative rounded-lg border-2 p-4
    transition-all duration-300 ease-in-out
    shadow-sm hover:shadow-md
    ${onClick ? 'cursor-pointer' : ''}
  `;

  // Background styling - warm parchment feel
  const backgroundStyles = `
    bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50
    hover:from-yellow-100 hover:via-amber-100 hover:to-orange-100
  `;

  // Variant-specific border styling
  const variantStyles = {
    pc: 'border-l-4 border-l-blue-500 border-blue-200',
    monster: 'border-l-4 border-l-red-500 border-red-200',
    'current-turn': 'border-amber-400 shadow-amber-500/20',
    selected: 'ring-2 ring-amber-400'
  };

  // Highlighting for current turn
  const highlightStyles = isHighlighted ? `
    border-amber-400 bg-gradient-to-br from-amber-100 via-orange-100 to-amber-100
    shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30
    before:absolute before:inset-0 before:rounded-lg
    before:bg-gradient-to-r before:from-amber-400/10 before:to-orange-400/10
    before:animate-pulse before:pointer-events-none
  ` : '';

  // Selection styling
  const selectionStyles = isSelected ? 'ring-2 ring-amber-400 ring-offset-2' : '';

  // Interactive styles for clickable cards
  const interactiveStyles = onClick ? `
    hover:scale-[1.02] hover:shadow-md
    active:scale-[0.98] active:shadow-sm
    focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2
  ` : '';

  // Combine all styles
  const combinedClassName = `
    ${baseStyles}
    ${backgroundStyles}
    ${variantStyles[variant]}
    ${highlightStyles}
    ${selectionStyles}
    ${interactiveStyles}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  return (
    <div
      className={combinedClassName}
      onClick={onClick}
      role={role}
      aria-label={ariaLabel}
      tabIndex={tabIndex}
    >
      {children}
    </div>
  );
};

// Specialized card variants for common use cases
interface CombatCardWrapperProps extends Omit<AdventureCardProps, 'variant'> {
  combatantType: 'pc' | 'monster';
  isCurrentTurn?: boolean;
}

export const CombatCardWrapper: React.FC<CombatCardWrapperProps> = ({
  combatantType,
  isCurrentTurn = false,
  children,
  ...props
}) => {
  const variant = isCurrentTurn ? 'current-turn' : combatantType;
  
  return (
    <AdventureCard
      variant={variant}
      isHighlighted={isCurrentTurn}
      {...props}
    >
      {children}
    </AdventureCard>
  );
};

// Card header component for consistent title styling
interface AdventureCardHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export const AdventureCardHeader: React.FC<AdventureCardHeaderProps> = ({
  title,
  subtitle,
  icon,
  actions,
  className = ''
}) => {
  return (
    <div className={`flex items-center justify-between mb-3 ${className}`}>
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {icon && (
          <div className="text-amber-600 flex-shrink-0">
            {icon}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="font-adventure-heading text-lg font-semibold text-amber-900 truncate">
            {title}
          </h3>
          {subtitle && (
            <p className="font-adventure-body text-sm text-amber-700 truncate">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {actions && (
        <div className="flex items-center gap-1 flex-shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
};

// Card content area with proper spacing
interface AdventureCardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const AdventureCardContent: React.FC<AdventureCardContentProps> = ({
  children,
  className = ''
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {children}
    </div>
  );
};

// Card footer for actions
interface AdventureCardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const AdventureCardFooter: React.FC<AdventureCardFooterProps> = ({
  children,
  className = ''
}) => {
  return (
    <div className={`flex items-center justify-end gap-2 mt-4 pt-3 border-t border-amber-200 ${className}`}>
      {children}
    </div>
  );
};

// Compound component structure
AdventureCard.Header = AdventureCardHeader;
AdventureCard.Content = AdventureCardContent;
AdventureCard.Footer = AdventureCardFooter;

export type { 
  AdventureCardProps, 
  AdventureCardHeaderProps, 
  AdventureCardContentProps, 
  AdventureCardFooterProps,
  CombatCardWrapperProps
};