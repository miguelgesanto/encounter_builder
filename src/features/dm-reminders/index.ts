// DM Reminders Feature Export Index

// Core types
export type * from './types/reminder.types'

// Hooks
export { useDMReminderEngine } from './hooks/useDMReminderEngine'
export type { DMReminderEngineHook } from './hooks/useDMReminderEngine'

// Components
export { ReminderOverlaySystem } from './components/ReminderOverlaySystem'
export { ReminderControlPanel, ManualTriggerPanel } from './components/ReminderControlPanel'
export {
  EnhancedCombatTracker,
  withDMReminders,
  ReminderSystemProvider,
  ReminderSystemContext,
  useReminderSystem
} from './components/EnhancedCombatTracker'

// Engine and utilities
export { PredictiveReminderEngine } from './engine/PredictiveReminderEngine'
export { ReminderTriggerManager } from './triggers/ReminderTriggerManager'
export type { TriggerManagerConfig } from './triggers/ReminderTriggerManager'
export { ContextAnalyzer } from './utils/ContextAnalyzer'

// AI Agent
export { ReminderAIAgent } from './agents/ReminderAIAgent'
export type { AIResponse } from './agents/ReminderAIAgent'

// Cache
export { ReminderCache, ReminderCacheManager } from './cache/ReminderCache'
export type { CacheConfig, CacheStats } from './cache/ReminderCache'

// Re-export commonly used types for convenience
export type {
  ReminderContent,
  DisplayedReminder,
  ReminderPreferences,
  EncounterContext,
  TurnContext,
  PredictedEvent,
  ReminderType,
  DisplayPosition
} from './types/reminder.types'