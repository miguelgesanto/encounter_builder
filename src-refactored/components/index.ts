// Shared UI Components
//
// Common components used across multiple features in the 
// D&D Encounter Builder application.

// Adventure-themed components
export * from './adventure';

// TODO: Add other shared component categories as needed
// export * from './ui';           // Base design system components
// export * from './layout';       // Layout and navigation components  
// export * from './forms';        // Form-specific components
// export * from './data-display'; // Tables, lists, cards for data
// export * from './feedback';     // Modals, alerts, notifications
// export * from './navigation';   // Tabs, breadcrumbs, pagination

/**
 * COMPONENT ORGANIZATION:
 * 
 * This index serves as the main entry point for all shared components
 * that can be used across different features. Components are organized
 * by category:
 * 
 * 📁 adventure/     - D&D themed components (buttons, cards, inputs)
 * 📁 ui/           - Base design system primitives  
 * 📁 layout/       - Page structure and navigation
 * 📁 forms/        - Form controls and validation
 * 📁 data-display/ - Tables, lists, and data visualization
 * 📁 feedback/     - User feedback (modals, alerts, toasts)
 * 📁 navigation/   - Navigation components (tabs, menus)
 * 
 * USAGE:
 * 
 * // Import specific components from features
 * import { AdventureButton, AdventureCard } from '@/components/adventure';
 * 
 * // Or import from the main components index
 * import { AdventureButton, AdventureCard } from '@/components';
 * 
 * COMPONENT GUIDELINES:
 * 
 * ✅ Components in /components are SHARED across features
 * ✅ Feature-specific components stay in /features/[feature]/components  
 * ✅ All components follow the Adventure theme for consistency
 * ✅ Components are accessible by default (ARIA, keyboard navigation)
 * ✅ Components support TypeScript with proper prop interfaces
 * ✅ Performance optimized with React.memo where appropriate
 */