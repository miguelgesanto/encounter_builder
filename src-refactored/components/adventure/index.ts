// Adventure-Themed Components
// 
// Reusable UI components with consistent D&D/medieval theming
// for the Encounter Builder application.

// Core Components
export { AdventureButton, AdventureButtonGroup, AdventureIconButton, QuickActionButtons } from './AdventureButton';
export { AdventureCard, CombatCardWrapper, AdventureCardHeader, AdventureCardContent, AdventureCardFooter } from './AdventureCard';
export { AdventureInput, AdventureTextarea, AdventureSelect, AdventureInputGroup } from './AdventureInput';

// TODO: Add more adventure components as they're implemented
// export { AdventureModal } from './AdventureModal';
// export { AdventureLayout } from './AdventureLayout';
// export { AdventureHeader } from './AdventureHeader';
// export { AdventureSidebar } from './AdventureSidebar';
// export { AdventureTooltip } from './AdventureTooltip';
// export { AdventureBadge } from './AdventureBadge';

// Component Types
export type { AdventureButtonProps, AdventureButtonGroupProps, AdventureIconButtonProps } from './AdventureButton';
export type { AdventureCardProps, AdventureCardHeaderProps, AdventureCardContentProps, AdventureCardFooterProps, CombatCardWrapperProps } from './AdventureCard';
export type { AdventureInputProps, AdventureTextareaProps, AdventureSelectProps, AdventureInputGroupProps } from './AdventureInput';

/**
 * DESIGN SYSTEM OVERVIEW:
 * 
 * The Adventure components provide a consistent theme across the application:
 * 
 * 🎨 Color Scheme:
 * - Warm parchment backgrounds (yellow-50 to amber-50 gradients)
 * - Amber/orange accent colors for interactive elements
 * - Functional color coding (blue for PCs, red for monsters, etc.)
 * 
 * 🎭 Visual Style:
 * - Medieval/fantasy aesthetic with warm, inviting colors
 * - Subtle gradients and shadows for depth
 * - Rounded corners and smooth transitions
 * - Adventure-themed fonts (when implemented)
 * 
 * ♿ Accessibility:
 * - WCAG AA compliant contrast ratios
 * - Proper ARIA labeling throughout
 * - Keyboard navigation support
 * - Focus indicators with amber accent colors
 * 
 * 🚀 Performance:
 * - Lightweight components with minimal re-renders
 * - CSS-based styling (no runtime CSS-in-JS)
 * - Optimized for React 18 concurrent features
 * 
 * USAGE EXAMPLES:
 * 
 * // Basic Button with Adventure Theme
 * import { AdventureButton } from '@/components/adventure';
 * <AdventureButton variant="primary" onClick={handleSave}>
 *   💾 Save Encounter
 * </AdventureButton>
 * 
 * // Combat Card with PC/Monster distinction  
 * import { CombatCardWrapper } from '@/components/adventure';
 * <CombatCardWrapper 
 *   combatantType="pc" 
 *   isCurrentTurn={true}
 *   onClick={handleSelect}
 * >
 *   <div>Player character content</div>
 * </CombatCardWrapper>
 * 
 * // Form Input with Adventure Styling
 * import { AdventureInput } from '@/components/adventure';
 * <AdventureInput.Group label="Creature Name" required>
 *   <AdventureInput
 *     value={name}
 *     onChange={(e) => setName(e.target.value)}
 *     placeholder="Enter creature name..."
 *   />
 * </AdventureInput.Group>
 * 
 * // Quick Action Buttons
 * import { QuickActionButtons } from '@/components/adventure';
 * <QuickActionButtons.NextTurn 
 *   onClick={nextTurn} 
 *   disabled={!hasCombatants} 
 * />
 * <QuickActionButtons.Remove 
 *   onClick={removeCombatant} 
 *   itemName="goblin"
 * />
 */